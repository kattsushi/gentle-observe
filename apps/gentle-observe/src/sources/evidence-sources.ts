import { Context, Effect } from "effect";

import type { EvidenceRejected } from "../domain/evidence";
import { GentleAIProcessProjection, RuntimeAgentProjection } from "../domain/evidence";

type Source<T> = { readonly snapshot: () => Effect.Effect<T, EvidenceRejected> };
export class AgentTelemetrySource extends Context.Service<
  AgentTelemetrySource,
  Source<typeof RuntimeAgentProjection.Type>
>()("@gentle-observe/AgentTelemetrySource") {}

export class GentleAIProcessSource extends Context.Service<
  GentleAIProcessSource,
  Source<typeof GentleAIProcessProjection.Type>
>()("@gentle-observe/GentleAIProcessSource") {}
