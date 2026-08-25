import { describe, expect, test } from "bun:test";
import { Effect } from "effect";

import { makeLiveLayer } from "../src/live/layer";
import { AgentTelemetrySource, GentleAIProcessSource } from "../src/sources/evidence-sources";

const pi = {
  cwd: "/workspace/repository",
  latestEntry: { timestamp: "2026-03-21T10:00:30.000Z", type: "thinking_level_change" },
  sessionId: "session-123",
} as const;

const gentle = {
  artifacts: [
    {
      exists: true,
      mtime: "2026-03-21T10:02:30.000Z",
      name: "applyProgress",
      state: "partial",
    },
  ],
  blocked: false,
  change: "live-source-spike",
  nextRecommended: "apply",
  provenance: {
    contract: "gentle-ai.sdd-status/v1" as const,
    observedAt: "2026-03-21T10:03:00.000Z",
  },
} as const;

const snapshots = (readers: Parameters<typeof makeLiveLayer>[0]) =>
  Effect.gen(function* () {
    const agents = yield* AgentTelemetrySource;
    const processes = yield* GentleAIProcessSource;
    return [yield* agents.snapshot(), yield* processes.snapshot()] as const;
  }).pipe(Effect.provide(makeLiveLayer(readers)));

describe("live source layer", () => {
  test("projects persisted Pi metadata as an idle live source with missing token capability", async () => {
    const [runtime] = await Effect.runPromise(
      snapshots({ gentle: Effect.succeed(gentle), pi: Effect.succeed(pi) }),
    );

    expect(runtime).toEqual({
      availability: "available",
      capabilities: { tokens: { state: "missing" } },
      freshness: "unknown",
      health: "available",
      missingness: "partial",
      provenance: { adapterVersion: "live-v1", kind: "live" },
      records: [
        {
          durationMs: 0,
          id: "session-123",
          model: "unobserved",
          parentId: null,
          provider: "pi",
          repoId: "/workspace/repository",
          sessionId: "session-123",
          status: "idle",
          steps: [
            {
              id: "session-123:thinking_level_change:2026-03-21T10:00:30.000Z",
              status: "completed",
            },
          ],
        },
      ],
    });
  });

  test("projects Gentle planning metadata as a waiting live process", async () => {
    const [, processes] = await Effect.runPromise(
      snapshots({ gentle: Effect.succeed(gentle), pi: Effect.succeed(pi) }),
    );

    expect(processes).toEqual({
      availability: "available",
      capabilities: { tokens: { state: "missing" } },
      freshness: "unknown",
      health: "available",
      missingness: "partial",
      provenance: { adapterVersion: "live-v1", kind: "live" },
      records: [
        {
          activity: "apply",
          durationMs: 0,
          id: "live-source-spike",
          parentId: null,
          repoId: "live-source-spike",
          sessionId: "live-source-spike",
          status: "waiting",
          steps: [{ id: "applyProgress:0", status: "idle" }],
          type: "sdd",
        },
      ],
    });
  });

  test.each(["apply", "verify"])(
    "projects blocked %s advice as a bounded blocked activity without raw reasons",
    async (nextRecommended) => {
      const [, processes] = await Effect.runPromise(
        snapshots({
          gentle: Effect.succeed({
            ...gentle,
            blocked: true,
            blockedReasons: ["provider detail that must not leave the status reader"],
            nextRecommended,
          }),
          pi: Effect.succeed(pi),
        }),
      );

      expect(processes.records[0]).toMatchObject({ activity: "blocked", status: "waiting" });
      expect(JSON.stringify(processes)).not.toContain("provider detail");
    },
  );

  test.each([
    { exists: false, expected: "idle", state: "done" },
    { exists: true, expected: "completed", state: "done" },
    { exists: true, expected: "idle", state: "partial" },
    { exists: false, expected: "idle", state: "missing" },
  ] as const)("projects $state artifacts as $expected only when they exist", async (artifact) => {
    const [, processes] = await Effect.runPromise(
      snapshots({
        gentle: Effect.succeed({ ...gentle, artifacts: [{ ...gentle.artifacts[0], ...artifact }] }),
        pi: Effect.succeed(pi),
      }),
    );

    expect(processes.records[0]?.steps).toEqual([
      { id: "applyProgress:0", status: artifact.expected },
    ]);
  });

  test("degrades only the Pi plane when its reader fails", async () => {
    const [runtime, processes] = await Effect.runPromise(
      snapshots({ gentle: Effect.succeed(gentle), pi: Effect.fail(new Error("Pi unavailable")) }),
    );

    expect(runtime).toMatchObject({
      availability: "available",
      capabilities: { tokens: { state: "missing" } },
      health: "degraded",
      missingness: "partial",
      provenance: { adapterVersion: "live-v1", kind: "live" },
      records: [],
    });
    expect(processes.health).toBe("available");
    expect(processes.records).toHaveLength(1);
  });

  test("degrades only the Gentle plane when its reader fails", async () => {
    const [runtime, processes] = await Effect.runPromise(
      snapshots({ gentle: Effect.fail(new Error("Gentle unavailable")), pi: Effect.succeed(pi) }),
    );

    expect(runtime.health).toBe("available");
    expect(runtime.records).toHaveLength(1);
    expect(processes).toMatchObject({
      availability: "available",
      capabilities: { tokens: { state: "missing" } },
      health: "degraded",
      missingness: "partial",
      provenance: { adapterVersion: "live-v1", kind: "live" },
      records: [],
    });
  });
});
