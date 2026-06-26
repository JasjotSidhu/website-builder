"use client";

import type { ReactNode } from "react";

export default function Tooltip({
  label,
  side = "bottom",
  align = "center",
  multiline = false,
  children,
}: {
  label: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  multiline?: boolean;
  children: ReactNode;
}) {
  const alignClass = align === "center" ? "" : ` ui-tooltip--align-${align}`;

  return (
    <span
      className={`ui-tooltip ui-tooltip--${side}${multiline ? " ui-tooltip--multiline" : ""}${alignClass}`}
    >
      {children}
      <span className="ui-tooltip__bubble" role="tooltip">
        {label}
      </span>
    </span>
  );
}
