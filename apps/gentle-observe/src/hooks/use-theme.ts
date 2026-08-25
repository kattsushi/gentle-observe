// Source: https://termcn.dev/r/opentui/use-theme.json
// Upstream commit: 628dd0bf88ba191907661a0fe80491be08302781
// SPDX-License-Identifier: MIT
import * as React from "react";

import { defaultTheme } from "@/lib/terminal-themes/default";
import type { Theme, ThemeContextValue } from "@/components/ui/types";

export const ThemeContext = React.createContext<ThemeContextValue>({
  setTheme: () => {
    // The default context keeps useTheme provider-optional.
  },
  theme: defaultTheme,
});

export const useTheme = (): Theme => React.useContext(ThemeContext).theme;

export const useThemeUpdater = (): ((theme: Theme) => void) =>
  React.useContext(ThemeContext).setTheme;
