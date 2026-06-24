"use client";

import { createContext, useContext } from "react";

export const SectionSettingsContext = createContext<Record<string, unknown>>({});

export function SectionSettingsProvider({
  settings,
  children,
}: {
  settings: Record<string, unknown>;
  children: React.ReactNode;
}) {
  return (
    <SectionSettingsContext.Provider value={settings}>
      {children}
    </SectionSettingsContext.Provider>
  );
}

export function useSectionSettings() {
  return useContext(SectionSettingsContext);
}
