import type { OverviewPlane } from "./Overview";
import type { ShellProjection } from "./projection";

export type View =
  | { readonly tag: "Overview" }
  | { readonly tag: "AgentDetail"; readonly agentId: string }
  | { readonly tag: "ProcessDetail"; readonly processId: string }
  | { readonly tag: "Timeline"; readonly plane: OverviewPlane; readonly subjectId: string };

export interface NavigationState {
  readonly history: ReadonlyArray<View>;
  readonly view: View;
}

export interface SelectionState {
  readonly processId: string | undefined;
  readonly runtimeId: string | undefined;
}

const hasId = (records: ReadonlyArray<{ readonly id: string }>, id: string) =>
  records.some((record) => record.id === id);

export const validView = (projection: ShellProjection, view: View) => {
  switch (view.tag) {
    case "Overview":
      return true;
    case "AgentDetail":
      return hasId(projection.runtime.records, view.agentId);
    case "ProcessDetail":
      return hasId(projection.processes.records, view.processId);
    case "Timeline":
      return hasId(
        view.plane === "runtime" ? projection.runtime.records : projection.processes.records,
        view.subjectId,
      );
  }
};

const sameView = (left: View, right: View) => JSON.stringify(left) === JSON.stringify(right);

export const navigate = (state: NavigationState, next: View): NavigationState =>
  sameView(state.view, next) ? state : { history: [...state.history, state.view], view: next };

export const back = (state: NavigationState): NavigationState => {
  const previous = state.history[state.history.length - 1];
  return previous === undefined ? state : { history: state.history.slice(0, -1), view: previous };
};

const selectedId = <Record extends { readonly id: string }>(
  records: ReadonlyArray<Record>,
  current: string | undefined,
) => (current !== undefined && hasId(records, current) ? current : records[0]?.id);

export const reconcile = (
  projection: ShellProjection,
  navigation: NavigationState,
  selection: SelectionState,
): { readonly navigation: NavigationState; readonly selection: SelectionState } => {
  const history = navigation.history.filter((view) => validView(projection, view));
  const current = validView(projection, navigation.view)
    ? navigation.view
    : history[history.length - 1];

  return {
    navigation:
      current === undefined
        ? { history: [], view: { tag: "Overview" } }
        : {
            history: current === navigation.view ? history : history.slice(0, -1),
            view: current,
          },
    selection: {
      processId: selectedId(projection.processes.records, selection.processId),
      runtimeId: selectedId(projection.runtime.records, selection.runtimeId),
    },
  };
};
