import type { ReactNode } from "react";

import { Columns } from "@/components/ui/columns";
import { Stack } from "@/components/ui/stack";

import type { ShellProjection } from "./projection";

export interface AppShellProps {
  readonly children: ReactNode;
  readonly compact: boolean;
  readonly projection: ShellProjection;
}

const sourceLabel = (source: Pick<ShellProjection["runtime"], "health" | "provenance">) =>
  `${source.health === "missing" ? "unavailable" : source.health} | ${
    source.provenance.kind === "unavailable" ? "source unavailable" : source.provenance.kind
  }`;

export const AppShell = ({ children, compact, projection }: AppShellProps) => (
  <Stack>
    {projection.demo ? <text>DEMO DATA</text> : undefined}
    {compact ? (
      <>
        <text>Runtime: {sourceLabel(projection.runtime)}</text>
        <text>Processes: {sourceLabel(projection.processes)} | q quit</text>
      </>
    ) : (
      <Columns>
        <text>Runtime: {sourceLabel(projection.runtime)}</text>
        <text>Processes: {sourceLabel(projection.processes)} | q quit</text>
      </Columns>
    )}
    {children}
  </Stack>
);
