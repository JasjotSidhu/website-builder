"use client";

import type { ReactNode } from "react";

export default function ImageEditSurface({
  children,
  uploadBtn,
  className = "",
  compact = false,
  overlay = false,
}: {
  children: ReactNode;
  uploadBtn?: ReactNode;
  className?: string;
  compact?: boolean;
  overlay?: boolean;
}) {
  return (
    <div className={`image-edit-surface${className ? ` ${className}` : ""}`}>
      {children}
      {uploadBtn ? (
        <div
          className={[
            "image-edit-surface__toolbar",
            compact ? "image-edit-surface__toolbar--compact" : "",
            overlay ? "image-edit-surface__toolbar--overlay" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {uploadBtn}
        </div>
      ) : null}
    </div>
  );
}
