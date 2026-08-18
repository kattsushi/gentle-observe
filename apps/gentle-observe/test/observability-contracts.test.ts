import { describe, expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import {
  decodeGentleAIProcessEvidence,
  decodeRuntimeAgentEvidence,
  decodeRuntimeAgentProjection,
} from "../src/domain/evidence";
import { makeDemoLayer } from "../src/demo/layers";
import { AgentTelemetrySource, GentleAIProcessSource } from "../src/sources/evidence-sources";
const validRuntimeAgent = {
  durationMs: 120,
  id: "agent-1",
  model: "model-a",
  parentId: null,
  provider: "provider-a",
  repoId: "repo-1",
  sessionId: "session-1",
  status: "running",
  steps: [{ id: "step-1", status: "completed" }],
} as const;
const validProcess = {
  ...validRuntimeAgent,
  activity: "running",
  status: "active",
  type: "sdd",
} as const;
const readDemo = (scenario: "normal" | "degraded" | "complex") =>
  Effect.runPromise(
    Effect.gen(function* () {
      const agents = yield* AgentTelemetrySource;
      const processes = yield* GentleAIProcessSource;
      return [yield* agents.snapshot(), yield* processes.snapshot()] as const;
    }).pipe(Effect.provide(makeDemoLayer(scenario))),
  );
describe("observability contracts and deterministic demo sources", () => {
  test("rejects malformed, private payload variants, and RDD identifiers before projection", async () => {
    const malformed = await Effect.runPromiseExit(decodeRuntimeAgentEvidence({ id: "agent-1" }));
    const reject = (extra: object) =>
      Effect.runPromiseExit(decodeGentleAIProcessEvidence({ ...validProcess, ...extra }));
    const denied = await Promise.all([
      reject({ classification: "safe-rDd" }),
      reject({ repoId: "prefix-RdD-42" }),
      reject({ payloadBody: "private" }),
      reject({ tool_arguments: "private" }),
    ]);
    expect(malformed._tag).toBe("Failure");
    expect(denied.every((result) => result._tag === "Failure")).toBe(true);
  });

  test("projects independent health, availability, capabilities, and missingness", async () => {
    const [runtime, processes] = await readDemo("degraded");
    expect(
      `${runtime.health}/${runtime.availability}/${runtime.missingness}/${processes.health}/${processes.availability}/${processes.missingness}/${runtime.capabilities.tokens.state}`,
    ).toBe("degraded/available/partial/missing/unavailable/complete/unsupported");
  });

  test("bounds steps and returns ordered deterministic scenarios", async () => {
    const oversized = await Effect.runPromiseExit(
      decodeRuntimeAgentEvidence({
        ...validRuntimeAgent,
        steps: Array.from({ length: 3 }, (_, index) => ({ id: `${index}`, status: "completed" })),
      }),
    );
    const [firstRuntime, firstProcesses] = await readDemo("complex");
    const [secondRuntime, secondProcesses] = await readDemo("complex");
    const excess = await Effect.runPromiseExit(
      decodeRuntimeAgentProjection({
        ...firstRuntime,
        records: [...firstRuntime.records, firstRuntime.records[0]],
      }),
    );
    expect(oversized._tag).toBe("Failure");
    expect(excess._tag).toBe("Failure");
    expect(firstRuntime.records.map((record) => record.id)).toEqual(["agent-alpha", "agent-beta"]);
    expect(firstProcesses.records.map((record) => record.id)).toEqual([
      "process-build",
      "process-check",
    ]);
    expect([firstRuntime, firstProcesses]).toEqual([secondRuntime, secondProcesses]);
    expect((await readDemo("normal"))[0].capabilities.tokens.state).toBe("supported");
    expect(firstRuntime.capabilities.tokens.state).toBe("missing");
  });

  test("allows a contract-compatible source layer to replace the demo source", async () => {
    const replacement = Layer.succeed(
      AgentTelemetrySource,
      AgentTelemetrySource.of({
        snapshot: () =>
          Effect.succeed({
            availability: "available",
            capabilities: { tokens: { state: "missing" } },
            freshness: "fresh",
            health: "available",
            missingness: "none",
            provenance: { adapterVersion: "test", kind: "test" },
            records: [validRuntimeAgent],
          }),
      }),
    );
    const snapshot = await Effect.runPromise(
      Effect.gen(function* () {
        const source = yield* AgentTelemetrySource;
        return yield* source.snapshot();
      }).pipe(Effect.provide(replacement)),
    );
    expect(snapshot.records).toEqual([validRuntimeAgent]);
  });
});
