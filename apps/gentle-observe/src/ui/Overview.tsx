import type { ShellProjection } from "./projection";

export type OverviewPlane = "runtime" | "processes";

type RuntimeRecord = ShellProjection["runtime"]["records"][number];
type ProcessRecord = ShellProjection["processes"]["records"][number];

export interface OverviewProps {
  readonly compact: boolean;
  readonly plane: OverviewPlane;
  readonly processId: string | undefined;
  readonly projection: ShellProjection;
  readonly runtimeId: string | undefined;
}

const selected = <Record extends { readonly id: string }>(
  records: ReadonlyArray<Record>,
  id: string | undefined,
) => records.find((record) => record.id === id) ?? records[0];

const RuntimeRow = ({
  record,
  selected: isSelected,
}: {
  record: RuntimeRecord;
  selected: boolean;
}) => (
  <text>
    {isSelected ? "> " : "  "}
    {record.id} | observed {record.status}
  </text>
);

const ProcessRow = ({
  record,
  selected: isSelected,
}: {
  record: ProcessRecord;
  selected: boolean;
}) => (
  <text>
    {isSelected ? "> " : "  "}
    {record.id} | reported {record.status}
  </text>
);

export const selectedRouteRecord = (
  projection: ShellProjection,
  plane: OverviewPlane,
  id: string | undefined,
) =>
  plane === "runtime"
    ? projection.runtime.records.find((record) => record.id === id)
    : projection.processes.records.find((record) => record.id === id);

export const selectedRecord = (
  projection: ShellProjection,
  plane: OverviewPlane,
  id: string | undefined,
) =>
  selectedRouteRecord(projection, plane, id) ??
  (plane === "runtime" ? projection.runtime.records[0] : projection.processes.records[0]);

export const Overview = ({ compact, plane, processId, projection, runtimeId }: OverviewProps) => {
  const runtime = selected(projection.runtime.records, runtimeId);
  const processes = selected(projection.processes.records, processId);

  return (
    <>
      <text>
        Runtime{plane === "runtime" ? " [active]" : ""} | Processes
        {plane === "processes" ? " [active]" : ""}
      </text>
      {plane === "runtime" ? (
        projection.runtime.records.length === 0 ? (
          <text>Runtime has no records.</text>
        ) : (
          projection.runtime.records.map((record) => (
            <RuntimeRow key={record.id} record={record} selected={record.id === runtime?.id} />
          ))
        )
      ) : projection.processes.records.length === 0 ? (
        <text>Processes has no records.</text>
      ) : (
        projection.processes.records.map((record) => (
          <ProcessRow key={record.id} record={record} selected={record.id === processes?.id} />
        ))
      )}
      <text>
        {compact
          ? "q quit | Tab plane | arrows/jk move"
          : "arrows/jk move | Tab plane | Enter open | Esc back | q quit"}
      </text>
    </>
  );
};
