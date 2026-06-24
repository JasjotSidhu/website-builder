"use client";

import type { CSSProperties } from "react";
import { useSectionSettings } from "./context";

const GAP_MAP = { sm: "1rem", md: "1.5rem", lg: "2.5rem" } as const;
const SPACING_MAP = { sm: "2rem", md: "4rem", lg: "6rem", xl: "8rem" } as const;

export interface BackgroundStyles {
  containerStyle: CSSProperties;
  overlayStyle?: CSSProperties;
}

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

export function useBackgroundStyle(): BackgroundStyles {
  const settings = useSectionSettings();
  const type = String(settings.type ?? "solid");

  if (type === "gradient") {
    const angle = Number(settings.gradientAngle ?? 135);
    const from = String(settings.gradientFrom ?? "#ffffff");
    const to = String(settings.gradientTo ?? "#f0f0f0");

    return {
      containerStyle: {
        background: `linear-gradient(${angle}deg, ${from}, ${to})`,
      },
    };
  }

  if (type === "image") {
    const image = String(settings.image ?? "");
    const overlayColor = String(settings.overlayColor ?? "#000000");
    const overlayOpacity = Number(settings.overlayOpacity ?? 0.4);

    return {
      containerStyle: {
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      },
      overlayStyle: image
        ? {
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }
        : undefined,
    };
  }

  return {
    containerStyle: {
      backgroundColor: String(settings.color ?? "#ffffff"),
    },
  };
}

export function useTextColorStyle(): string {
  const settings = useSectionSettings();

  return String(settings.textColor ?? "#111111");
}

export function useSpacingStyle(): CSSProperties {
  const settings = useSectionSettings();
  const py = SPACING_MAP[settings.paddingY as keyof typeof SPACING_MAP] ?? "4rem";

  return {
    paddingTop: py,
    paddingBottom: py,
  };
}

export function useReversedLayout(): boolean {
  const settings = useSectionSettings();

  return Boolean(settings.reversed);
}
