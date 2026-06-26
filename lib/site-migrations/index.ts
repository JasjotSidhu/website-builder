import { websiteSchema } from "@/lib/schemas";
import { normalizeSiteSections } from "@/lib/traits/normalize";
import type { WebsiteData } from "@/lib/types";
import { CURRENT_SITE_SCHEMA_VERSION } from "@/lib/collections/types";
import { migrateV1ToV2 } from "./v1-to-v2-collections";
import type { RawSiteData, SiteMigration } from "./types";

const MIGRATIONS: SiteMigration[] = [migrateV1ToV2].sort((a, b) => a.fromVersion - b.fromVersion);

export function getSiteSchemaVersion(site: RawSiteData): number {
  const version = site.schemaVersion;
  if (typeof version === "number" && Number.isInteger(version) && version > 0) {
    return version;
  }
  return 1;
}

/**
 * Run versioned migrations only. Does not validate or normalize sections.
 * Safe to call on both draft and published JSON.
 */
export function migrateSiteData(raw: RawSiteData): RawSiteData {
  let site: RawSiteData = { ...raw };
  let version = getSiteSchemaVersion(site);

  while (version < CURRENT_SITE_SCHEMA_VERSION) {
    const step = MIGRATIONS.find((entry) => entry.fromVersion === version);
    if (!step) {
      break;
    }
    site = step.migrate(site);
    version = step.toVersion;
  }

  return site;
}

/**
 * Full read pipeline for any site JSON from DB or API.
 *
 * 1. migrateSiteData   — add new top-level keys, bump schemaVersion
 * 2. websiteSchema     — structural validation (lenient optional fields)
 * 3. normalizeSiteSections — section/theme legacy fixes (existing)
 */
export function parseAndMigrateWebsiteData(raw: unknown): WebsiteData {
  const migrated = migrateSiteData(
    typeof raw === "object" && raw !== null ? (raw as RawSiteData) : {},
  );
  const parsed = websiteSchema.parse(migrated) as WebsiteData;
  return normalizeSiteSections(parsed);
}
