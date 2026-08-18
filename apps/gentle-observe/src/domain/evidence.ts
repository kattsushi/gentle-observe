import { Data, Effect, Schema } from "effect";
const EvidenceStatus = Schema.Literals(["running", "idle", "completed", "failed"]);
const ProcessStatus = Schema.Literals(["active", "waiting", "completed", "failed"]);
const Steps = Schema.Array(Schema.Struct({ id: Schema.String, status: EvidenceStatus })).pipe(
  Schema.check(Schema.isMaxLength(2)),
);
const Availability = Schema.Literals(["available", "unavailable"]);
const SourceHealth = Schema.Literals(["available", "degraded", "missing"]);
const Freshness = Schema.Literals(["fresh", "stale", "unknown"]);
const Provenance = Schema.Struct({
  adapterVersion: Schema.String,
  kind: Schema.Literals(["demo", "live", "test"]),
});
const TokenUsage = Schema.Struct({
  inputTokens: Schema.optionalKey(Schema.Number),
  outputTokens: Schema.optionalKey(Schema.Number),
  state: Schema.Literals(["supported", "unsupported", "missing"]),
});
const Capabilities = Schema.Struct({ tokens: TokenUsage });
export const RuntimeAgentEvidence = Schema.Struct({
  durationMs: Schema.Number,
  id: Schema.String,
  model: Schema.String,
  parentId: Schema.NullOr(Schema.String),
  provider: Schema.String,
  repoId: Schema.String,
  sessionId: Schema.String,
  status: EvidenceStatus,
  steps: Steps,
});
export const GentleAIProcessEvidence = Schema.Struct({
  activity: Schema.String,
  durationMs: Schema.Number,
  id: Schema.String,
  parentId: Schema.NullOr(Schema.String),
  repoId: Schema.String,
  sessionId: Schema.String,
  status: ProcessStatus,
  steps: Steps,
  type: Schema.Literals(["sdd", "generic"]),
});
const sourceProjection = <S extends Schema.Constraint>(records: S) =>
  Schema.Struct({
    availability: Availability,
    capabilities: Capabilities,
    freshness: Freshness,
    health: SourceHealth,
    missingness: Schema.Literals(["none", "partial", "complete"]),
    provenance: Provenance,
    records: Schema.Array(records).pipe(Schema.check(Schema.isMaxLength(2))),
  });

export const RuntimeAgentProjection = sourceProjection(RuntimeAgentEvidence);
export const GentleAIProcessProjection = sourceProjection(GentleAIProcessEvidence);
export class EvidenceRejected extends Data.TaggedError("EvidenceRejected")<{
  readonly reason: string;
}> {}
const deniedKey = /(arg|body|payload|prompt|thought|tool|telemetry|mutation)/;
const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const containsDeniedMetadata = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(containsDeniedMetadata);
  if (!isRecord(value)) return false;

  return Object.entries(value).some(([key, nested]) => {
    const normalizedKey = key.toLowerCase();
    const rdd =
      (normalizedKey.includes("classification") || normalizedKey.endsWith("id")) &&
      typeof nested === "string" &&
      nested.toLowerCase().includes("rdd");

    return deniedKey.test(normalizedKey) || rdd || containsDeniedMetadata(nested);
  });
};
const decodeMetadataOnly = <S extends Schema.Constraint>(schema: S, input: unknown) =>
  Effect.gen(function* () {
    if (containsDeniedMetadata(input)) {
      return yield* Effect.fail(
        new EvidenceRejected({ reason: "private or RDD evidence is denied" }),
      );
    }

    return yield* Schema.decodeUnknownEffect(schema)(input).pipe(
      Effect.mapError(
        () => new EvidenceRejected({ reason: "evidence does not match its contract" }),
      ),
    );
  });
export const decodeRuntimeAgentEvidence = (input: unknown) =>
  decodeMetadataOnly(RuntimeAgentEvidence, input);

export const decodeGentleAIProcessEvidence = (input: unknown) =>
  decodeMetadataOnly(GentleAIProcessEvidence, input);

export const decodeRuntimeAgentProjection = (input: unknown) =>
  decodeMetadataOnly(RuntimeAgentProjection, input);
