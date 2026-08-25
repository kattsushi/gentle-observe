import { Effect, Layer } from "effect";
import {
  GentleAIProcessEvidence,
  GentleAIProcessProjection,
  RuntimeAgentEvidence,
  RuntimeAgentProjection,
} from "../domain/evidence";
import { AgentTelemetrySource, GentleAIProcessSource } from "../sources/evidence-sources";
export type DemoScenario = "normal" | "degraded" | "complex";
type Agent = typeof RuntimeAgentEvidence.Type;
type Process = typeof GentleAIProcessEvidence.Type;
type Runtime = typeof RuntimeAgentProjection.Type;
type Processes = typeof GentleAIProcessProjection.Type;
type Health = "available" | "degraded" | "missing";
type Token = {
  readonly state: "supported" | "unsupported" | "missing";
  readonly inputTokens?: number;
  readonly outputTokens?: number;
};
const agent = (id: string, status: Agent["status"]): Agent => ({
  durationMs: 120,
  id,
  model: "demo-model",
  parentId: null,
  provider: "demo-provider",
  repoId: "demo-repo",
  sessionId: "demo-session",
  status,
  steps: [{ id: `${id}-step`, status: "completed" }],
});
const process = (id: string, type: Process["type"]): Process => ({
  activity: "running",
  durationMs: 90,
  id,
  parentId: null,
  repoId: "demo-repo",
  sessionId: "demo-session",
  status: "active",
  steps: [{ id: `${id}-event`, status: "completed" }],
  type,
});
const ordered = <A extends { readonly id: string }>(records: ReadonlyArray<A>) =>
  [...records].sort((left, right) => left.id.localeCompare(right.id));
const metadata = (health: Health, tokens: Token) =>
  ({
    availability: health === "missing" ? "unavailable" : "available",
    capabilities: { tokens },
    freshness: health === "degraded" ? "stale" : health === "missing" ? "unknown" : "fresh",
    health,
    missingness: health === "missing" ? "complete" : health === "degraded" ? "partial" : "none",
    provenance: { adapterVersion: "demo-v1", kind: "demo" },
  }) as const;
const runtimeSnapshot = (scenario: DemoScenario): Runtime => {
  const records =
    scenario === "complex"
      ? ordered([agent("agent-beta", "idle"), agent("agent-alpha", "running")])
      : [agent("agent-alpha", scenario === "degraded" ? "failed" : "running")];

  return {
    ...metadata(
      scenario === "degraded" ? "degraded" : "available",
      scenario === "normal"
        ? { inputTokens: 20, outputTokens: 10, state: "supported" }
        : { state: scenario === "complex" ? "missing" : "unsupported" },
    ),
    records,
  };
};
const processSnapshot = (scenario: DemoScenario): Processes => ({
  ...metadata(scenario === "degraded" ? "missing" : "available", { state: "unsupported" }),
  records:
    scenario === "degraded"
      ? []
      : ordered(
          scenario === "complex"
            ? [process("process-check", "generic"), process("process-build", "sdd")]
            : [process("process-build", "sdd")],
        ),
});
export const makeDemoLayer = (scenario: DemoScenario) =>
  Layer.merge(
    Layer.succeed(
      AgentTelemetrySource,
      AgentTelemetrySource.of({ snapshot: () => Effect.succeed(runtimeSnapshot(scenario)) }),
    ),
    Layer.succeed(
      GentleAIProcessSource,
      GentleAIProcessSource.of({ snapshot: () => Effect.succeed(processSnapshot(scenario)) }),
    ),
  );
