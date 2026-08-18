import { useAtomValue } from "@effect/atom-react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useEffect, useRef, useState } from "react";
import type { Atom } from "effect/unstable/reactivity/Atom";

import { AppShell } from "./ui/AppShell";
import { AgentDetail } from "./ui/AgentDetail";
import { detailForTimeline, selectedDetail, timelineForView } from "./ui/navigation";
import { Overview, selectedRecord, selectedRouteRecord, type OverviewPlane } from "./ui/Overview";
import { layoutFor } from "./ui/layout";
import type { ShellProjection } from "./ui/projection";
import { back, navigate, reconcile, type NavigationState, type SelectionState } from "./ui/state";
import { ProcessDetail } from "./ui/ProcessDetail";
import { Timeline } from "./ui/Timeline";

export interface AppProps {
  readonly onQuit: () => void;
  readonly projection: Atom<ShellProjection>;
}

const nextId = <Record extends { readonly id: string }>(
  records: ReadonlyArray<Record>,
  currentId: string | undefined,
  direction: -1 | 1,
) => {
  const current = records.findIndex((record) => record.id === currentId);
  return records[Math.max(0, Math.min(records.length - 1, current + direction))]?.id;
};

const is = (key: { readonly name: string; readonly sequence: string }, value: string) =>
  key.name === value || key.sequence === value;

export const App = (props: AppProps) => {
  const projection = useAtomValue(props.projection);
  const { height, width } = useTerminalDimensions();
  const [plane, setPlane] = useState<OverviewPlane>("runtime");
  const [selection, setSelection] = useState<SelectionState>({
    processId: undefined,
    runtimeId: undefined,
  });
  const [navigation, setNavigation] = useState<NavigationState>({
    history: [],
    view: { tag: "Overview" },
  });
  const quit = useRef(false);
  const selectedId = plane === "runtime" ? selection.runtimeId : selection.processId;
  const record = selectedRecord(projection, plane, selectedId);

  useEffect(() => {
    setSelection((current) => reconcile(projection, navigation, current).selection);
    setNavigation((current) => reconcile(projection, current, selection).navigation);
  }, [projection]);

  const forward = (next: NavigationState["view"] | undefined) => {
    if (next !== undefined) setNavigation((current) => navigate(current, next));
  };

  useKeyboard((key) => {
    if (is(key, "q") && !quit.current) {
      quit.current = true;
      props.onQuit();
      return;
    }
    if (key.name === "escape" || key.sequence === "\u001b") {
      setNavigation((current) => back(current));
      return;
    }
    if (is(key, "1")) {
      forward({ tag: "Overview" });
      return;
    }
    if (is(key, "2")) {
      forward(timelineForView(projection, navigation.view, plane, selectedId));
      return;
    }
    if (is(key, "3")) {
      forward(selectedDetail(projection, "runtime", selection.runtimeId));
      return;
    }
    if (is(key, "5")) {
      forward(selectedDetail(projection, "processes", selection.processId));
      return;
    }
    if (navigation.view.tag === "Overview") {
      if (is(key, "tab")) {
        setPlane((current) => (current === "runtime" ? "processes" : "runtime"));
        return;
      }
      if (is(key, "return") || is(key, "linefeed") || is(key, "kpenter")) {
        forward(selectedDetail(projection, plane, record?.id));
        return;
      }
      const direction =
        is(key, "down") || is(key, "j") ? 1 : is(key, "up") || is(key, "k") ? -1 : undefined;
      if (direction === undefined) return;
      if (plane === "runtime") {
        setSelection((current) => ({
          ...current,
          runtimeId: nextId(projection.runtime.records, record?.id, direction),
        }));
      } else {
        setSelection((current) => ({
          ...current,
          processId: nextId(projection.processes.records, record?.id, direction),
        }));
      }
      return;
    }
    if (
      navigation.view.tag === "Timeline" &&
      (is(key, "return") || is(key, "linefeed") || is(key, "kpenter"))
    ) {
      forward(detailForTimeline(navigation.view));
    }
  });

  const view = navigation.view;
  const agent =
    view.tag === "AgentDetail"
      ? projection.runtime.records.find((candidate) => candidate.id === view.agentId)
      : undefined;
  const process =
    view.tag === "ProcessDetail"
      ? projection.processes.records.find((candidate) => candidate.id === view.processId)
      : undefined;
  const timeline =
    view.tag === "Timeline"
      ? selectedRouteRecord(projection, view.plane, view.subjectId)
      : undefined;

  return (
    <AppShell projection={projection}>
      {view.tag === "AgentDetail" && agent !== undefined ? (
        <AgentDetail projection={projection} record={agent} />
      ) : view.tag === "ProcessDetail" && process !== undefined ? (
        <ProcessDetail
          compact={layoutFor(width, height).compact}
          projection={projection}
          record={process}
        />
      ) : view.tag === "Timeline" && timeline !== undefined ? (
        <Timeline plane={view.plane} projection={projection} record={timeline} />
      ) : (
        <Overview
          compact={layoutFor(width, height).compact}
          plane={plane}
          processId={selection.processId}
          projection={projection}
          runtimeId={selection.runtimeId}
        />
      )}
    </AppShell>
  );
};
