"use client";

import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import GoogleFontsLoader from "@/components/shared/GoogleFontsLoader";
import { normalizeFontConfig } from "@/lib/fonts/font-utils";
import { normalizeTheme } from "@/lib/theme-defaults";
import { buildThemeCssVariables } from "@/lib/theme-utils";
import type { ThemeConfig, ThemeFontConfig } from "@/lib/types";

const PREVIEW_RENDER_WIDTH = 1200;

interface SectionLibraryPreviewFrameProps {
  theme: ThemeConfig;
  fonts?: ThemeFontConfig[];
  children: ReactNode;
}

function collectThemeFonts(theme: ThemeConfig): ThemeFontConfig[] {
  return [
    normalizeFontConfig(theme.fonts.heading),
    normalizeFontConfig(theme.fonts.body),
  ];
}

export default function SectionLibraryPreviewFrame({
  theme,
  fonts,
  children,
}: SectionLibraryPreviewFrameProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);
  const resolvedFonts = useMemo(() => fonts ?? collectThemeFonts(theme), [fonts, theme]);
  const normalizedTheme = useMemo(() => normalizeTheme(theme), [theme]);
  const previewThemeStyle = buildThemeCssVariables(normalizedTheme, { embed: true });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const updateScale = () => {
      const viewportWidth = viewport.clientWidth;
      setScale(viewportWidth > 0 ? viewportWidth / PREVIEW_RENDER_WIDTH : 0.25);
    };

    updateScale();

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(updateScale);
    });
    observer.observe(viewport);

    return () => observer.disconnect();
  }, [children, theme]);

  return (
    <div className="section-library-preview">
      <div
        ref={viewportRef}
        className="section-library-preview-viewport"
        style={{ backgroundColor: normalizedTheme.colors.background }}
      >
        <div
          className="section-library-preview-scale"
          style={{
            width: PREVIEW_RENDER_WIDTH,
            transform: `translateX(-50%) scale(${scale})`,
          }}
        >
          <div
            className="section-library-preview-content @container site-theme-root section-typography"
            style={{
              ...previewThemeStyle,
              width: PREVIEW_RENDER_WIDTH,
            }}
            data-btn-hover-effect={theme.buttons?.hoverEffect ?? "lift"}
          >
            <GoogleFontsLoader fonts={resolvedFonts} />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
