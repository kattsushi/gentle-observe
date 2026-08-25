import type { ReactNode } from "react";

import type { ShellProjection } from "./projection";

export interface AppShellProps {
  readonly children: ReactNode;
  readonly projection: ShellProjection;
}

const sourceLabel = (source: Pick<ShellProjection["runtime"], "health" | "provenance">) =>
  `${source.health === "missing" ? "unavailable" : source.health} | ${
    source.provenance.kind === "unavailable" ? "source unavailable" : source.provenance.kind
  }`;

export const AppShell = ({ children, projection }: AppShellProps) => (
  <box flexDirection="column">
    {projection.demo ? <text>DEMO DATA</text> : undefined}
    <text>Runtime: {sourceLabel(projection.runtime)}</text>
    <text>Processes: {sourceLabel(projection.processes)} | q quit</text>
    {children}
  </box>
);
