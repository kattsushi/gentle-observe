import { useAtomValue } from "@effect/atom-react";
import { useKeyboard } from "@opentui/react";
import type { Atom } from "effect/unstable/reactivity/Atom";

import type { ShellProjection } from "./ui/projection";

export interface AppProps {
  readonly onQuit: () => void;
  readonly projection: Atom<ShellProjection>;
}

export const App = (props: AppProps) => {
  const projection = useAtomValue(props.projection);

  useKeyboard((key) => {
    if (key.name === "q") props.onQuit();
  });

  const sourceLabel = (source: Pick<ShellProjection["runtime"], "health" | "provenance">) =>
    `${source.health === "missing" ? "unavailable" : source.health} | ${
      source.provenance.kind === "unavailable" ? "source unavailable" : source.provenance.kind
    }`;

  return (
    <box flexDirection="column" padding={1}>
      {projection.demo ? <text>DEMO DATA</text> : undefined}
      <text>Runtime: {sourceLabel(projection.runtime)}</text>
      <text>Processes: {sourceLabel(projection.processes)}</text>
      <text>q quit</text>
    </box>
  );
};
