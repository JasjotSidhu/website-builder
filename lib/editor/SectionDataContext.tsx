"use client";

import { createContext, useContext } from "react";

export interface SectionDataContextValue {
  data: Record<string, unknown>;
  updateField: (key: string, value: unknown) => void;
}

export const SectionDataContext = createContext<SectionDataContextValue | null>(
  null,
);

export function SectionDataProvider({
  data,
  updateField,
  children,
}: SectionDataContextValue & { children: React.ReactNode }) {
  return (
    <SectionDataContext.Provider value={{ data, updateField }}>
      {children}
    </SectionDataContext.Provider>
  );
}

export function useSectionData() {
  const context = useContext(SectionDataContext);
  if (!context) {
    throw new Error("useSectionData must be used within SectionDataProvider");
  }
  return context;
}

export function useOptionalSectionData() {
  return useContext(SectionDataContext);
}
