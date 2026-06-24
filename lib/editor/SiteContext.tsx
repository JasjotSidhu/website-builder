"use client";

import { createContext, useContext } from "react";

export interface SitePageSummary {
  id: string;
  title: string;
  slug: string;
}

export const SiteContext = createContext<{ pages: SitePageSummary[] }>({
  pages: [],
});

export function SiteProvider({
  pages,
  children,
}: {
  pages: SitePageSummary[];
  children: React.ReactNode;
}) {
  return <SiteContext.Provider value={{ pages }}>{children}</SiteContext.Provider>;
}

export function useSitePages() {
  return useContext(SiteContext).pages;
}
