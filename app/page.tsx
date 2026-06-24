import { SiteRenderer } from "@/lib/renderer";
import { websiteSchema } from "@/lib/schemas";
import { normalizeSiteSections } from "@/lib/traits/normalize";
import sampleSite from "@/data/sample-site.json";
import type { WebsiteData } from "@/lib/types";

export default function HomePage() {
  const site = normalizeSiteSections(websiteSchema.parse(sampleSite) as WebsiteData);

  return <SiteRenderer site={site} slug="/" />;
}
