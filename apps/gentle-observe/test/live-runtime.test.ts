import { describe, expect, test } from "bun:test";
import { Deferred, Effect, Fiber, Option } from "effect";
import { TestClock } from "effect/testing";

import { startLiveRefresh, type LiveRefreshScheduler } from "../src/live/refresh";
import { acquireLiveProjection } from "../src/live/runtime";
import type { LiveSubprocessOptions, LiveSystemDependencies } from "../src/live/system";
import type { ShellProjection } from "../src/ui/projection";

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

const refreshProjection = (health: "available" | "degraded"): ShellProjection => ({
  demo: false,
  processes: {
    availability: health === "available" ? "available" : "unavailable",
    capabilities: { tokens: { state: "missing" } },
    freshness: "unknown",
    health,
    missingness: health === "available" ? "partial" : "complete",
    provenance: { adapterVersion: "live-v1", kind: "live" },
    records: [],
  },
  runtime: {
    availability: "available",
    capabilities: { tokens: { state: "missing" } },
    freshness: "unknown",
    health: "available",
    missingness: "partial",
    provenance: { adapterVersion: "live-v1", kind: "live" },
    records: [],
  },
});

const deferred = <A>() => {
  let reject: (cause: unknown) => void = () => undefined;
  let resolve: (value: A) => void = () => undefined;
  const promise = new Promise<A>((resolve_, reject_) => {
    resolve = resolve_;
    reject = reject_;
  });
  return { promise, reject, resolve };
};

const refreshScheduler = () => {
  const scheduled: Array<{ at: number; cancelled: boolean; task: () => void }> = [];
  const scheduler: LiveRefreshScheduler = {
    schedule(at, task) {
      const entry = { at, cancelled: false, task };
      scheduled.push(entry);
      return () => {
        entry.cancelled = true;
      };
    },
  };
  return { scheduled, scheduler };
};

const settle = async () => {
  for (let index = 0; index < 4; index += 1) await Promise.resolve();
};

describe("live refresh", () => {
  test("schedules the first acquisition and seeds unchanged suppression", async () => {
    const initial = refreshProjection("available");
    const gate = deferred<ShellProjection>();
    const { scheduled, scheduler } = refreshScheduler();
    const published: ShellProjection[] = [];
    let acquisitions = 0;
    let now = 100;
    const cancel = startLiveRefresh({
      acquire: () => {
        acquisitions += 1;
        return gate.promise;
      },
      clock: { now: () => now },
      initialProjection: initial,
      intervalMs: 25,
      onFailure: () => undefined,
      publish: (projection) => published.push(projection),
      scheduler,
    });

    expect(acquisitions).toBe(0);
    expect(scheduled[0]?.at).toBe(125);
    scheduled[0]?.task();
    expect(acquisitions).toBe(1);
    now = 200;
    gate.resolve(initial);
    await settle();

    expect(published).toEqual([]);
    expect(scheduled[1]?.at).toBe(225);
    cancel();
    expect(scheduled[1]?.cancelled).toBe(true);
  });

  test("serializes work, publishes changes, and continues after unchanged projections", async () => {
    const gates = Array.from({ length: 3 }, () => deferred<ShellProjection>());
    const { scheduled, scheduler } = refreshScheduler();
    const initial = refreshProjection("available");
    const changed = refreshProjection("degraded");
    const published: ShellProjection[] = [];
    let acquisitions = 0;
    const cancel = startLiveRefresh({
      acquire: () => gates[acquisitions++]?.promise ?? Promise.reject(new Error("unexpected")),
      clock: { now: () => 100 },
      initialProjection: initial,
      intervalMs: 25,
      onFailure: () => undefined,
      publish: (projection) => published.push(projection),
      scheduler,
    });

    scheduled[0]?.task();
    scheduled[0]?.task();
    expect(acquisitions).toBe(1);
    gates[0]?.resolve(changed);
    await settle();
    scheduled[1]?.task();
    gates[1]?.resolve(changed);
    await settle();
    scheduled[2]?.task();
    gates[2]?.resolve(initial);
    await settle();

    expect(published).toEqual([changed, initial]);
    expect(scheduled).toHaveLength(4);
    cancel();
  });

  test("aborts in-flight work and ignores cancellation-induced rejection", async () => {
    const gate = deferred<ShellProjection>();
    const { scheduled, scheduler } = refreshScheduler();
    const failures: unknown[] = [];
    const published: ShellProjection[] = [];
    let aborted = false;
    const cancel = startLiveRefresh({
      acquire: (signal) => {
        signal.addEventListener("abort", () => {
          aborted = true;
        });
        return gate.promise;
      },
      clock: { now: () => 100 },
      initialProjection: refreshProjection("available"),
      intervalMs: 25,
      onFailure: (cause) => failures.push(cause),
      publish: (projection) => published.push(projection),
      scheduler,
    });

    scheduled[0]?.task();
    cancel();
    cancel();
    gate.reject(new Error("aborted"));
    await settle();

    expect(aborted).toBe(true);
    expect(failures).toEqual([]);
    expect(published).toEqual([]);
    expect(scheduled).toHaveLength(1);
  });

  test("suppresses a successful publication after cancellation", async () => {
    const gate = deferred<ShellProjection>();
    const { scheduled, scheduler } = refreshScheduler();
    const published: ShellProjection[] = [];
    const cancel = startLiveRefresh({
      acquire: () => gate.promise,
      clock: { now: () => 100 },
      initialProjection: refreshProjection("available"),
      intervalMs: 25,
      onFailure: () => undefined,
      publish: (projection) => published.push(projection),
      scheduler,
    });

    scheduled[0]?.task();
    cancel();
    gate.resolve(refreshProjection("degraded"));
    await settle();

    expect(published).toEqual([]);
    expect(scheduled).toHaveLength(1);
  });

  test("reports one unexpected rejection and stops scheduling", async () => {
    const { scheduled, scheduler } = refreshScheduler();
    const failure = new Error("unexpected");
    const failures: unknown[] = [];
    let acquisitions = 0;
    startLiveRefresh({
      acquire: () => {
        acquisitions += 1;
        return Promise.reject(failure);
      },
      clock: { now: () => 100 },
      initialProjection: refreshProjection("available"),
      intervalMs: 25,
      onFailure: (cause) => failures.push(cause),
      publish: () => undefined,
      scheduler,
    });

    scheduled[0]?.task();
    await settle();
    scheduled[0]?.task();

    expect(acquisitions).toBe(1);
    expect(failures).toEqual([failure]);
    expect(scheduled).toHaveLength(1);
  });
});
