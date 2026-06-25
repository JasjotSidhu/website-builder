export function normalizePageSlug(input: string): string {
  let slug = input.trim().toLowerCase();
  slug = slug.replace(/\s+/g, "-");
  slug = slug.replace(/[^a-z0-9\-/]/g, "-");
  slug = slug.replace(/-+/g, "-").replace(/\/+/g, "/");

  if (!slug.startsWith("/")) {
    slug = `/${slug}`;
  }

  if (slug.length > 1 && slug.endsWith("/")) {
    slug = slug.slice(0, -1);
  }

  return slug || "/";
}

export function validatePageSlug(
  slug: string,
  existingSlugs: string[],
  currentSlug?: string,
): string | null {
  const normalized = normalizePageSlug(slug);

  if (!normalized.startsWith("/")) {
    return "Slug must start with /.";
  }

  if (!/^\/[a-z0-9\-/]*$/.test(normalized)) {
    return "Use lowercase letters, numbers, and hyphens only.";
  }

  const collision = existingSlugs.some(
    (entry) => entry === normalized && entry !== currentSlug,
  );
  if (collision) {
    return "This slug is already used by another page.";
  }

  return null;
}

export function titleToSlug(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return base ? normalizePageSlug(`/${base}`) : "/new-page";
}
