/* @jsxImportSource @opentui/react */
// Source: https://termcn.dev/r/opentui/stack.json
// Upstream commit: 628dd0bf88ba191907661a0fe80491be08302781
// SPDX-License-Identifier: MIT
import type { BoxProps } from "@opentui/react";
import type { ReactNode } from "react";

export interface StackProps {
  direction?: "vertical" | "horizontal";
  gap?: number;
  children: ReactNode;
  width?: BoxProps["width"];
  height?: BoxProps["height"];
  alignItems?: "flex-start" | "center" | "flex-end";
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
}

export const Stack = ({
  direction = "vertical",
  gap = 0,
  children,
  width,
  height,
  alignItems,
  justifyContent,
}: StackProps) => (
  <box
    flexDirection={direction === "vertical" ? "column" : "row"}
    gap={gap}
    width={width}
    height={height}
    alignItems={alignItems}
    justifyContent={justifyContent}
  >
    {children}
  </box>
);
