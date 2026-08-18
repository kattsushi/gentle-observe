import { useKeyboard, useRenderer } from "@opentui/solid";

import type { ShellProjection } from "./ui/projection";

export interface AppProps {
  readonly onQuit?: () => void;
  readonly projection: ShellProjection;
}

export const App = (props: AppProps) => {
  const renderer = useRenderer();
  const quit = () => {
    if (renderer.isDestroyed) return;
    renderer.destroy();
  };

  useKeyboard((key) => {
    if (key.name === "q") {
      if (props.onQuit === undefined) quit();
      else props.onQuit();
    }
  });

  const sourceLabel = (source: Pick<ShellProjection["runtime"], "health" | "provenance">) =>
    `${source.health === "missing" ? "unavailable" : source.health} | ${
      source.provenance.kind === "unavailable" ? "source unavailable" : source.provenance.kind
    }`;

  return (
    <box flexDirection="column" padding={1}>
      {props.projection.demo ? <text>DEMO DATA</text> : undefined}
      <text>Runtime: {sourceLabel(props.projection.runtime)}</text>
      <text>Processes: {sourceLabel(props.projection.processes)}</text>
      <text>q quit</text>
    </box>
  );
};
