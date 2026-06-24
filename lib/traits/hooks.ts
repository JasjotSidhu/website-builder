"use client";

import type { CSSProperties } from "react";
import { useSectionSettings } from "./context";

const GAP_MAP = { sm: "1rem", md: "1.5rem", lg: "2.5rem" } as const;
const SPACING_MAP = { sm: "2rem", md: "4rem", lg: "6rem", xl: "8rem" } as const;

export function useGridStyle(): CSSProperties {
  const settings = useSectionSettings();
  const columns = Number(settings.columns ?? 3);
  const gap = GAP_MAP[settings.gap as keyof typeof GAP_MAP] ?? "1.5rem";

  return {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap,
  };
}

export function useOverlayStyle(): CSSProperties {
  const settings = useSectionSettings();

  return {
    backgroundColor: String(settings.overlayColor ?? "#000000"),
    opacity: Number(settings.opacity ?? 0.4),
  };
}

export function useBackgroundStyle(): CSSProperties {
  const settings = useSectionSettings();

  return {
    backgroundColor: String(settings.backgroundColor ?? "#ffffff"),
  };
}

export function useSpacingStyle(): CSSProperties {
  const settings = useSectionSettings();
  const py = SPACING_MAP[settings.paddingY as keyof typeof SPACING_MAP] ?? "4rem";

  return {
    paddingTop: py,
    paddingBottom: py,
  };
}
