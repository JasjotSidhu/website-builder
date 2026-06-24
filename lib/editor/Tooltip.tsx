"use client";

import type { ReactNode } from "react";

export default function Tooltip({
  label,
  side = "bottom",
  children,
}: {
  label: string;
  side?: "top" | "bottom" | "left" | "right";
  children: ReactNode;
}) {
  return (
    <span className={`ui-tooltip ui-tooltip--${side}`}>
      {children}
      <span className="ui-tooltip__bubble" role="tooltip">
        {label}
      </span>
    </span>
  );
}
