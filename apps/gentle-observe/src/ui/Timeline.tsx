import type { OverviewPlane } from "./Overview";
import type { ShellProjection } from "./projection";

type TimelineRecord =
  | ShellProjection["runtime"]["records"][number]
  | ShellProjection["processes"]["records"][number];

const sourceFor = (projection: ShellProjection, plane: OverviewPlane) =>
  plane === "runtime" ? projection.runtime : projection.processes;

export const Timeline = ({
  plane,
  projection,
  record,
}: {
  readonly plane: OverviewPlane;
  readonly projection: ShellProjection;
  readonly record: TimelineRecord;
}) => {
  const source = sourceFor(projection, plane);
  const status = plane === "runtime" ? `observed ${record.status}` : `reported ${record.status}`;

  return (
    <>
      <text>
        Timeline | {plane === "runtime" ? "Runtime" : "Processes"} | {record.id}
      </text>
      <text>
        identity: repo {record.repoId} | session {record.sessionId}
      </text>
      <text>
        {status} | duration {record.durationMs}ms
      </text>
      <text>
        steps: {record.steps.map((step) => `${step.id} (${step.status})`).join(", ") || "none"}
      </text>
      <text>timestamps unavailable in normalized contract</text>
      <text>
        source: {source.provenance.kind} / {source.provenance.adapterVersion} | freshness{" "}
        {source.freshness}
      </text>
      <text>missingness {source.missingness} | Enter detail | Esc back</text>
    </>
  );
};
