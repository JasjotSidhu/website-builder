"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

const GAP = 8;
const VIEWPORT_PADDING = 12;
export const FLOATING_POPOVER_Z_INDEX = 10000;

export type FloatingPlacement = "auto" | "below" | "above";
export type FloatingAlign = "start" | "end";

function computePosition(
  anchorEl: HTMLElement,
  popoverEl: HTMLElement,
  placement: FloatingPlacement,
  align: FloatingAlign,
) {
  const anchorRect = anchorEl.getBoundingClientRect();
  const popoverHeight = popoverEl.offsetHeight;
  const popoverWidth = popoverEl.offsetWidth;

  let top: number;
  if (placement === "below") {
    top = anchorRect.bottom + GAP;
  } else if (placement === "above") {
    top = anchorRect.top - popoverHeight - GAP;
  } else {
    top = anchorRect.top - popoverHeight - GAP;
    if (top < VIEWPORT_PADDING) {
      top = anchorRect.bottom + GAP;
    }
  }

  top = Math.min(top, window.innerHeight - popoverHeight - VIEWPORT_PADDING);
  top = Math.max(VIEWPORT_PADDING, top);

  let left = align === "end" ? anchorRect.right - popoverWidth : anchorRect.left;
  if (left + popoverWidth > window.innerWidth - VIEWPORT_PADDING) {
    left = window.innerWidth - popoverWidth - VIEWPORT_PADDING;
  }
  left = Math.max(VIEWPORT_PADDING, left);

  return { top, left };
}

export default function FloatingPopover({
  anchorEl,
  open,
  children,
  className = "",
  placement = "auto",
  align = "start",
  dataAttribute = "data-floating-popover",
  zIndex = FLOATING_POPOVER_Z_INDEX,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  children: ReactNode;
  className?: string;
  placement?: FloatingPlacement;
  align?: FloatingAlign;
  dataAttribute?: string;
  zIndex?: number;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const popover = popoverRef.current;
    if (!open || !anchorEl || !popover) {
      return;
    }

    const update = () => {
      const { top, left } = computePosition(anchorEl, popover, placement, align);
      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;
      popover.style.visibility = "visible";
    };

    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(popover);

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorEl, children, placement, align]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={popoverRef}
      {...{ [dataAttribute]: true }}
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex,
        visibility: "hidden",
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
