"use client";

import { createContext, useContext } from "react";

export interface SitePageSummary {
  id: string;
  title: string;
  slug: string;
}

export interface SiteContextValue {
  pages: SitePageSummary[];
  websiteSlug?: string;
  websiteId?: string;
}

export const SiteContext = createContext<SiteContextValue>({
  pages: [],
});

export function SiteProvider({
  pages,
  websiteSlug,
  websiteId,
  children,
}: {
  pages: SitePageSummary[];
  websiteSlug?: string;
  websiteId?: string;
  children: React.ReactNode;
}) {
  return (
    <SiteContext.Provider value={{ pages, websiteSlug, websiteId }}>{children}</SiteContext.Provider>
  );
}

export function useSitePages() {
  return useContext(SiteContext).pages;
}

export function useSiteContext() {
  return useContext(SiteContext);
}
