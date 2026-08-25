import { Effect, Layer } from "effect";

import { GentleAIProcessProjection, RuntimeAgentProjection } from "../domain/evidence";
import { AgentTelemetrySource, GentleAIProcessSource } from "./evidence-sources";

const unavailable = {
  availability: "unavailable",
  capabilities: { tokens: { state: "unsupported" } },
  freshness: "unknown",
  health: "missing",
  missingness: "complete",
  provenance: { adapterVersion: "local-unavailable", kind: "unavailable" },
} as const;

const runtime = { ...unavailable, records: [] } satisfies typeof RuntimeAgentProjection.Type;
const processes = { ...unavailable, records: [] } satisfies typeof GentleAIProcessProjection.Type;

export const unavailableLayer = Layer.merge(
  Layer.succeed(
    AgentTelemetrySource,
    AgentTelemetrySource.of({ snapshot: () => Effect.succeed(runtime) }),
  ),
  Layer.succeed(
    GentleAIProcessSource,
    GentleAIProcessSource.of({ snapshot: () => Effect.succeed(processes) }),
  ),
);
