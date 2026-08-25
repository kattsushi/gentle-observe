import type { ShellProjection } from "./projection";

type Agent = ShellProjection["runtime"]["records"][number];

const tokenLabel = (tokens: ShellProjection["runtime"]["capabilities"]["tokens"]) =>
  tokens.state === "supported"
    ? `Token usage: supported input ${tokens.inputTokens ?? "missing"} output ${tokens.outputTokens ?? "missing"}`
    : `Token usage: ${tokens.state}`;

export const AgentDetail = ({
  projection,
  record,
}: {
  readonly projection: ShellProjection;
  readonly record: Agent;
}) => (
  <>
    <text>Agent Detail | {record.id}</text>
    <text>
      repo {record.repoId} | session {record.sessionId}
    </text>
    <text>
      parent: {record.parentId ?? "none supplied"} | observed {record.status} | {record.durationMs}
      ms
    </text>
    <text>
      model: {record.model} | provider: {record.provider}
    </text>
    <text>
      steps: {record.steps.map((step) => `${step.id} (${step.status})`).join(", ") || "none"}
    </text>
    <text>
      Runtime source: {projection.runtime.freshness} | missing {projection.runtime.missingness} |
      {` ${projection.runtime.provenance.kind}/${projection.runtime.provenance.adapterVersion}`}
    </text>
    <text>{tokenLabel(projection.runtime.capabilities.tokens)}</text>
    <text>2 timeline | Esc back</text>
  </>
);
