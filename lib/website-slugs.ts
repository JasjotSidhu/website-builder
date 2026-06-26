const WEBSITE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const RESERVED_SLUGS = new Set([
  "api",
  "dashboard",
  "login",
  "signup",
  "builder",
  "w",
  "admin",
  "www",
]);

export function slugifyWebsiteName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function validateWebsiteSlug(slug: string): string | null {
  const normalized = slug.trim().toLowerCase();

  if (!normalized) {
    return "Website URL slug is required.";
  }

  if (!WEBSITE_SLUG_PATTERN.test(normalized)) {
    return "Use lowercase letters, numbers, and hyphens only.";
  }

  if (RESERVED_SLUGS.has(normalized)) {
    return "This URL slug is reserved.";
  }

  return null;
}

export async function ensureUniqueWebsiteSlug(
  baseSlug: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = baseSlug || "website";
  let suffix = 1;

  while (await isTaken(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}
