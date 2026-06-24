"use client";

import { type ReactNode } from "react";
import FloatingPopover, { FLOATING_POPOVER_Z_INDEX } from "./FloatingPopover";

export const INLINE_TEXT_TOOLBAR_Z_INDEX = FLOATING_POPOVER_Z_INDEX;

export default function FloatingToolbar({
  anchorEl,
  open,
  wide = false,
  children,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <FloatingPopover
      anchorEl={anchorEl}
      open={open}
      dataAttribute="data-inline-text-toolbar"
      className={`popover popover--toolbar popover--toolbar-floating${wide ? " popover--toolbar-wide" : ""}`}
    >
      {children}
    </FloatingPopover>
  );
}
