import { useAtomValue } from "@effect/atom-react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useEffect, useRef, useState } from "react";
import type { Atom } from "effect/unstable/reactivity/Atom";

import { AppShell } from "./ui/AppShell";
import { Overview, selectedRecord, selectedRouteRecord, type OverviewPlane } from "./ui/Overview";
import { layoutFor } from "./ui/layout";
import type { ShellProjection } from "./ui/projection";

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

export const App = (props: AppProps) => {
  const projection = useAtomValue(props.projection);
  const { height, width } = useTerminalDimensions();
  const [plane, setPlane] = useState<OverviewPlane>("runtime");
  const [runtimeId, setRuntimeId] = useState<string>();
  const [processId, setProcessId] = useState<string>();
  const [detail, setDetail] = useState(false);
  const quit = useRef(false);
  const selectedId = plane === "runtime" ? runtimeId : processId;
  const record = selectedRecord(projection, plane, selectedId);
  const routeRecord = selectedRouteRecord(projection, plane, selectedId);

  useEffect(() => {
    setRuntimeId((currentId) =>
      projection.runtime.records.some((record) => record.id === currentId)
        ? currentId
        : projection.runtime.records[0]?.id,
    );
  }, [projection.runtime.records]);

  useEffect(() => {
    setProcessId((currentId) =>
      projection.processes.records.some((record) => record.id === currentId)
        ? currentId
        : projection.processes.records[0]?.id,
    );
  }, [projection.processes.records]);

  useEffect(() => {
    if (detail && routeRecord === undefined) setDetail(false);
  }, [detail, routeRecord]);

  useKeyboard((key) => {
    if (key.name === "q" && !quit.current) {
      quit.current = true;
      props.onQuit();
      return;
    }
    if (detail) {
      if (key.name === "escape" || key.sequence === "\u001b") setDetail(false);
      return;
    }
    if (key.name === "tab" || key.sequence === "\t") {
      setPlane((current) => (current === "runtime" ? "processes" : "runtime"));
      return;
    }
    if (
      key.name === "return" ||
      key.name === "linefeed" ||
      key.name === "kpenter" ||
      key.sequence === "\r" ||
      key.sequence === "\n"
    ) {
      if (record !== undefined) setDetail(true);
      return;
    }
    const direction =
      key.name === "down" || key.name === "j"
        ? 1
        : key.name === "up" || key.name === "k"
          ? -1
          : undefined;
    if (direction === undefined) return;

    if (plane === "runtime") {
      setRuntimeId(nextId(projection.runtime.records, record?.id, direction));
    } else {
      setProcessId(nextId(projection.processes.records, record?.id, direction));
    }
  });

  return (
    <AppShell projection={projection}>
      {detail && routeRecord !== undefined ? (
        <>
          <text>Detail view is not available in this build.</text>
          <text>
            {plane === "runtime" ? "Runtime" : "Processes"} | {routeRecord.id}
          </text>
          <text>Esc back | q quit</text>
        </>
      ) : (
        <Overview
          compact={layoutFor(width, height).compact}
          plane={plane}
          processId={processId}
          projection={projection}
          runtimeId={runtimeId}
        />
      )}
    </AppShell>
  );
};
