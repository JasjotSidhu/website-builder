import type { ButtonVariant } from "./types";

export function normalizeButtonVariant(variant: unknown): ButtonVariant {
  if (variant === "ghost") {
    return "light";
  }
  if (variant === "primary" || variant === "secondary" || variant === "outline" || variant === "light") {
    return variant;
  }
  return "primary";
}

export function getSiteButtonClassName(
  variant: ButtonVariant | undefined,
  extraClass = "",
): string {
  const resolvedVariant = normalizeButtonVariant(variant);
  return ["site-button", `site-button--${resolvedVariant}`, extraClass].filter(Boolean).join(" ");
}
