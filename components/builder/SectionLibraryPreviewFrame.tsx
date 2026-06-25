"use client";

import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import GoogleFontsLoader from "@/components/shared/GoogleFontsLoader";
import { normalizeFontConfig } from "@/lib/fonts/font-utils";
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

function measureScaledSectionHeight(content: HTMLElement, scale: number): number {
  const sectionRoot = content.querySelector("section, header, footer");
  const measured =
    sectionRoot instanceof HTMLElement
      ? sectionRoot.offsetHeight
      : content.scrollHeight;

  return Math.ceil(measured * scale);
}

export default function SectionLibraryPreviewFrame({
  theme,
  fonts,
  children,
}: SectionLibraryPreviewFrameProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const resolvedFonts = useMemo(() => fonts ?? collectThemeFonts(theme), [fonts, theme]);
  const previewThemeStyle = buildThemeCssVariables(theme, { embed: true });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const scaleEl = scaleRef.current;
    const content = contentRef.current;
    if (!viewport || !scaleEl || !content) {
      return;
    }

    const updateMetrics = () => {
      const viewportWidth = viewport.clientWidth;
      const scale = viewportWidth > 0 ? viewportWidth / PREVIEW_RENDER_WIDTH : 0.25;
      scaleEl.style.transform = `translateX(-50%) scale(${scale})`;
      setViewportHeight(measureScaledSectionHeight(content, scale));
    };

    updateMetrics();

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(updateMetrics);
    });
    observer.observe(viewport);
    observer.observe(content);

    return () => observer.disconnect();
  }, [children, theme]);

  return (
    <div className="section-library-preview">
      <div
        ref={viewportRef}
        className="section-library-preview-viewport"
        style={viewportHeight > 0 ? { height: viewportHeight } : undefined}
      >
        <div
          ref={scaleRef}
          className="section-library-preview-scale"
          style={{ width: PREVIEW_RENDER_WIDTH }}
        >
          <div
            ref={contentRef}
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
