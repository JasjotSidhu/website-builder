import type { LinkValue } from "./types";

export function resolveLink(
  link: LinkValue,
  pages: { id: string; slug: string }[],
): string {
  if (link.type === "url") {
    return link.href;
  }

  const page = pages.find((entry) => entry.id === link.pageId);
  return page?.slug ?? "#";
}

export const defaultLink: LinkValue = { type: "page", pageId: "home" };
