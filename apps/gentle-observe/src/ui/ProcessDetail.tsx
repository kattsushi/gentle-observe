import { KeyValue } from "@/components/ui/key-value";

import type { ShellProjection } from "./projection";

type Process = ShellProjection["processes"]["records"][number];

const tokenLabel = (tokens: ShellProjection["processes"]["capabilities"]["tokens"]) =>
  tokens.state === "supported"
    ? `Token usage: supported input ${tokens.inputTokens ?? "missing"} output ${tokens.outputTokens ?? "missing"}`
    : `Token usage: ${tokens.state}`;

const compactTokenLabel = (tokens: ShellProjection["processes"]["capabilities"]["tokens"]) =>
  tokens.state === "supported"
    ? `tokens supported ${tokens.inputTokens ?? "missing"}/${tokens.outputTokens ?? "missing"}`
    : `tokens ${tokens.state}`;

export const ProcessDetail = ({
  compact,
  projection,
  record,
}: {
  readonly compact: boolean;
  readonly projection: ShellProjection;
  readonly record: Process;
}) =>
  compact ? (
    <>
      <text>Process Detail | {record.id}</text>
      <text>
        repo {record.repoId}/session {record.sessionId} parent:{record.parentId ?? "none"}
      </text>
      <text>
        reported {record.status} | {record.durationMs}ms | activity {record.activity}
      </text>
      <text>
        step {record.steps.map((step) => `${step.id}:${step.status}`).join(", ") || "none"}
      </text>
      <text>
        src {projection.processes.freshness}/{projection.processes.missingness}{" "}
        {projection.processes.provenance.kind}/{projection.processes.provenance.adapterVersion} |{" "}
        {compactTokenLabel(projection.processes.capabilities.tokens)}
      </text>
      {record.type === "sdd" ? (
        <text>SDD: phase/progress/artifacts/attempts/dependencies/Strict TDD unavailable</text>
      ) : (
        <>
          <text>id: {record.id} | type: generic</text>
          <text>canonical name/category/version: unavailable</text>
          <text>specialized semantics: unavailable</text>
        </>
      )}
      <text>reported activity ≠ runtime liveness; no delivery authority</text>
      <text>2 timeline | Esc back</text>
    </>
  ) : (
    <>
      <text>Process Detail | {record.id}</text>
      <KeyValue
        items={[
          { key: "identity", value: `repo ${record.repoId} | session ${record.sessionId}` },
          {
            key: "parent/status",
            value: `parent ${record.parentId ?? "none supplied"} | reported ${record.status} | ${record.durationMs}ms`,
          },
          {
            key: "activity",
            value: `${record.activity} | step ${record.steps.map((step) => `${step.id}:${step.status}`).join(", ") || "none"}`,
          },
          {
            key: "source",
            value: `${projection.processes.freshness}/${projection.processes.missingness} ${projection.processes.provenance.kind}/${projection.processes.provenance.adapterVersion}`,
          },
        ]}
      />
      <text>{tokenLabel(projection.processes.capabilities.tokens)}</text>
      {record.type === "sdd" ? (
        <text>
          SDD specialization: phase/progress/artifacts/attempts/dependencies/Strict TDD unavailable
        </text>
      ) : (
        <>
          <text>id: {record.id} | type: generic</text>
          <text>canonical name/category/version: unavailable</text>
          <text>specialized semantics: unavailable</text>
        </>
      )}
      <text>Reported activity is not runtime liveness and gives no delivery authority.</text>
      <text>2 timeline | Esc back</text>
    </>
  );
