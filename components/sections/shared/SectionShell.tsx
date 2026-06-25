"use client";

import type { ReactNode } from "react";
import { useEditMode } from "@/lib/editor/EditModeContext";
import { useBackgroundStyle, useSpacingStyle, useTextColorStyle } from "@/lib/traits/hooks";

interface SectionShellProps {
  children: ReactNode;
  className?: string;
  withSpacing?: boolean;
}

export function SectionShell({
  children,
  className = "",
  withSpacing = true,
}: SectionShellProps) {
  const { isEditing } = useEditMode();
  const { containerStyle, overlayStyle } = useBackgroundStyle();
  const spacingStyle = withSpacing ? useSpacingStyle() : {};
  const textColor = useTextColorStyle();
  const overflowClass = isEditing ? "overflow-visible" : "overflow-hidden";

  return (
    <section
      className={`relative ${overflowClass} ${className}`.trim()}
      style={{ ...containerStyle, ...spacingStyle, color: textColor }}
    >
      {overlayStyle ? <div style={overlayStyle} /> : null}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
