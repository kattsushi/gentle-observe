import type { OverviewPlane } from "./Overview";
import type { ShellProjection } from "./projection";
import type { View } from "./state";

const recordId = (projection: ShellProjection, plane: OverviewPlane, id: string | undefined) =>
  (plane === "runtime" ? projection.runtime.records : projection.processes.records).find(
    (record) => record.id === id,
  )?.id;

export const selectedTimeline = (
  projection: ShellProjection,
  plane: OverviewPlane,
  id: string | undefined,
): View | undefined => {
  const subjectId = recordId(projection, plane, id);
  return subjectId === undefined ? undefined : { tag: "Timeline", plane, subjectId };
};

export const selectedDetail = (
  projection: ShellProjection,
  plane: OverviewPlane,
  id: string | undefined,
): View | undefined => {
  const subjectId = recordId(projection, plane, id);
  if (subjectId === undefined) return undefined;
  return plane === "runtime"
    ? { tag: "AgentDetail", agentId: subjectId }
    : { tag: "ProcessDetail", processId: subjectId };
};

export const timelineForView = (
  projection: ShellProjection,
  view: View,
  plane: OverviewPlane,
  selectedId: string | undefined,
) => {
  switch (view.tag) {
    case "AgentDetail":
      return selectedTimeline(projection, "runtime", view.agentId);
    case "ProcessDetail":
      return selectedTimeline(projection, "processes", view.processId);
    case "Timeline":
      return view;
    case "Overview":
      return selectedTimeline(projection, plane, selectedId);
  }
};

export const detailForTimeline = (view: View): View | undefined =>
  view.tag !== "Timeline"
    ? undefined
    : view.plane === "runtime"
      ? { tag: "AgentDetail", agentId: view.subjectId }
      : { tag: "ProcessDetail", processId: view.subjectId };
