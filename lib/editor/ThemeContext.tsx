"use client";

import { createContext, useContext } from "react";
import { DEFAULT_THEME } from "@/lib/theme-defaults";
import type { ThemeConfig } from "@/lib/types";

const ThemeContext = createContext<ThemeConfig>(DEFAULT_THEME);

export function ThemeProvider({
  theme,
  children,
}: {
  theme: ThemeConfig;
  children: React.ReactNode;
}) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useSiteTheme() {
  return useContext(ThemeContext);
}
