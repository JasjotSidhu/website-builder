export type ThemeTextRole = "section" | "title" | "body" | "card" | "cardTitle";

const THEME_TEXT_VARS: Record<Exclude<ThemeTextRole, "section">, string> = {
  title: "var(--color-title-text)",
  body: "var(--color-body-text)",
  card: "var(--color-card-text)",
  cardTitle: "var(--color-card-title-text)",
};

export function getThemeTextColorVar(role?: ThemeTextRole): string | undefined {
  if (!role || role === "section") {
    return undefined;
  }

  return THEME_TEXT_VARS[role];
}
