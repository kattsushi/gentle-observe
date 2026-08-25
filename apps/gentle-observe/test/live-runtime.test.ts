import { describe, expect, test } from "bun:test";
import { Deferred, Effect, Fiber, Option } from "effect";
import { TestClock } from "effect/testing";

import { acquireLiveProjection } from "../src/live/runtime";
import type { LiveSubprocessOptions, LiveSystemDependencies } from "../src/live/system";

const repository = "/workspace/repository";
const sessionRoot = "/pi/agent/sessions";
const sessionDirectory = "/pi/agent/sessions/--workspace-repository--";
const change = "live-source-spike";
const changeRoot = "/workspace/repository/openspec/changes/live-source-spike";
const sessionFile = `${sessionDirectory}/newest.jsonl`;
const applyProgress = `${changeRoot}/apply-progress.md`;

const persistedSession = [
  JSON.stringify({
    cwd: repository,
    id: "session-newest",
    timestamp: "2026-03-21T10:00:00.000Z",
    type: "session",
    version: 3,
  }),
  JSON.stringify({ timestamp: "2026-03-21T10:02:00.000Z", type: "tool" }),
  "",
].join("\n");

const statusStdout = JSON.stringify({
  artifactPaths: { applyProgress: [applyProgress] },
  artifactStore: "openspec",
  artifacts: { applyProgress: "partial" },
  blockedReasons: [],
  changeName: change,
  changeRoot,
  nextRecommended: "apply",
  schemaName: "gentle-ai.sdd-status",
  schemaVersion: 1,
});

const availableMetadata = {
  availability: "available",
  capabilities: { tokens: { state: "missing" } },
  freshness: "unknown",
  health: "available",
  missingness: "partial",
  provenance: { adapterVersion: "live-v1", kind: "live" },
} as const;

type RuntimeDependencyOverrides = Partial<
  Pick<LiveSystemDependencies, "canonicalize" | "readText" | "run">
>;
type LiveRunCall = readonly [string, ReadonlyArray<string>, LiveSubprocessOptions];
type LiveReadCall = readonly [string, number];

const dependencies = (
  calls: LiveRunCall[],
  reads: LiveReadCall[],
  stats: string[],
  overrides: RuntimeDependencyOverrides = {},
): LiveSystemDependencies => ({
  canonicalize: overrides.canonicalize ?? ((path) => Effect.succeed(path)),
  listDirectory: (path) => {
    expect(path).toBe(sessionDirectory);
    return Effect.succeed(["older.jsonl", "newest.jsonl"]);
  },
  readText:
    overrides.readText ??
    ((path, maximumBytes) => {
      reads.push([path, maximumBytes]);
      return Effect.succeed(persistedSession);
    }),
  run:
    overrides.run ??
    ((file, arguments_, options) => {
      calls.push([file, arguments_, options]);
      return Effect.succeed({ stdout: statusStdout });
    }),
  stat: (path) => {
    stats.push(path);
    if (path === `${sessionDirectory}/older.jsonl`) {
      return Effect.succeed({ isRegular: true, mtime: new Date("2026-03-21T09:00:00.000Z") });
    }
    if (path === sessionFile) {
      return Effect.succeed({ isRegular: true, mtime: new Date("2026-03-21T10:00:00.000Z") });
    }
    if (path === applyProgress) {
      return Effect.succeed({ isRegular: true, mtime: new Date("2026-03-21T10:03:00.000Z") });
    }
    throw new Error(`unexpected stat: ${path}`);
  },
});

const liveOptions = { change, changeRoot, repository, sessionRoot };

const acquireWithinOuterBound = (dependencies_: LiveSystemDependencies) =>
  Effect.scoped(
    Effect.gen(function* () {
      const projection = yield* acquireLiveProjection(dependencies_, liveOptions).pipe(
        Effect.forkScoped,
      );
      yield* Effect.yieldNow;
      yield* TestClock.adjust("5 seconds");
      yield* Effect.yieldNow;

      const completion = yield* Fiber.join(projection).pipe(
        Effect.timeoutOption(1_000),
        Effect.forkScoped,
      );
      yield* Effect.yieldNow;
      yield* TestClock.adjust(1_000);
      return yield* Fiber.join(completion);
    }),
  ).pipe(Effect.provide(TestClock.layer()));

describe("live runtime acquisition", () => {
  test("starts Pi acquisition while Gentle status is gated", async () => {
    const [calls, reads, stats]: [LiveRunCall[], LiveReadCall[], string[]] = [[], [], []];

    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const gentleStarted = yield* Deferred.make<void>();
          const piStarted = yield* Deferred.make<void>();
          const releaseGentle = yield* Deferred.make<{ readonly stdout: string }>();
          const projection = yield* acquireLiveProjection(
            dependencies(calls, reads, stats, {
              canonicalize: (path) => Deferred.succeed(piStarted, undefined).pipe(Effect.as(path)),
              run: () =>
                Effect.gen(function* () {
                  yield* Deferred.succeed(gentleStarted, undefined);
                  return yield* Deferred.await(releaseGentle);
                }),
            }),
            liveOptions,
          ).pipe(Effect.forkScoped);

          yield* Deferred.await(gentleStarted);
          yield* Effect.yieldNow;
          const piStart = yield* Deferred.await(piStarted).pipe(
            Effect.timeoutOption(1),
            Effect.forkScoped,
          );
          yield* Effect.yieldNow;
          yield* TestClock.adjust(1);
          const started = yield* Fiber.join(piStart);
          if (Option.isNone(started))
            throw new Error("Pi acquisition did not start with Gentle gated");

          yield* Deferred.succeed(releaseGentle, { stdout: statusStdout });
          yield* Fiber.join(projection);
        }),
      ).pipe(Effect.provide(TestClock.layer())),
    );
  });

  test("degrades only Gentle when its plane stalls beyond the outer bound", async () => {
    const completion = await Effect.runPromise(
      acquireWithinOuterBound(dependencies([], [], [], { run: () => Effect.never })),
    );

    if (Option.isNone(completion)) throw new Error("Gentle plane did not finish within its bound");
    expect(completion.value.processes).toMatchObject({ health: "degraded", records: [] });
    expect(completion.value.runtime).toMatchObject({
      health: "available",
      records: [{ id: "session-newest", status: "idle" }],
    });
  });

  test("degrades only Pi when its plane stalls beyond the outer bound", async () => {
    const completion = await Effect.runPromise(
      acquireWithinOuterBound(dependencies([], [], [], { readText: () => Effect.never })),
    );

    if (Option.isNone(completion)) throw new Error("Pi plane did not finish within its bound");
    expect(completion.value.processes).toMatchObject({
      health: "available",
      records: [{ id: change, status: "waiting" }],
    });
    expect(completion.value.runtime).toMatchObject({ health: "degraded", records: [] });
  });

  test("composes persisted Pi and Gentle status adapters into one non-demo projection", async () => {
    const [calls, reads, stats]: [LiveRunCall[], LiveReadCall[], string[]] = [[], [], []];

    const projection = await Effect.runPromise(
      acquireLiveProjection(dependencies(calls, reads, stats), liveOptions),
    );

    expect(calls).toEqual([
      [
        "gentle-ai",
        [
          "sdd-status",
          change,
          "--cwd",
          repository,
          "--contract",
          "gentle-ai.sdd-status/v1",
          "--json",
        ],
        { deadlineMs: 5_000, maximumStdoutBytes: 1_048_576 },
      ],
    ]);
    expect(reads).toEqual([[sessionFile, 1_048_576]]);
    expect(stats).toEqual([applyProgress, `${sessionDirectory}/older.jsonl`, sessionFile]);
    expect(projection).toEqual({
      demo: false,
      processes: {
        ...availableMetadata,
        records: [
          {
            activity: "apply",
            durationMs: 0,
            id: change,
            parentId: null,
            repoId: change,
            sessionId: change,
            status: "waiting",
            steps: [{ id: "applyProgress:0", status: "idle" }],
            type: "sdd",
          },
        ],
      },
      runtime: {
        ...availableMetadata,
        records: [
          {
            durationMs: 0,
            id: "session-newest",
            model: "unobserved",
            parentId: null,
            provider: "pi",
            repoId: repository,
            sessionId: "session-newest",
            status: "idle",
            steps: [{ id: "session-newest:tool:2026-03-21T10:02:00.000Z", status: "completed" }],
          },
        ],
      },
    });
    expect(
      JSON.stringify({ processes: projection.processes, runtime: projection.runtime }),
    ).not.toContain("demo");
  });
});
