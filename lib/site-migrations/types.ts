import type { WebsiteData } from "@/lib/types";

/** Raw JSON from DB before version detection */
export type RawSiteData = Record<string, unknown>;

export type SiteMigration = {
  fromVersion: number;
  toVersion: number;
  migrate: (site: RawSiteData) => RawSiteData;
};

export type MigratedWebsiteData = WebsiteData & {
  schemaVersion: number;
  collections: NonNullable<WebsiteData["collections"]>;
};
