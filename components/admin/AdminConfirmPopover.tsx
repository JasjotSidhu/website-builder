"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import FloatingPopover from "@/lib/editor/FloatingPopover";

interface AdminConfirmPopoverProps {
  title: string;
  description: string;
  confirmLabel?: string;
  pending?: boolean;
  disabled?: boolean;
  placement?: "top" | "bottom";
  onConfirm: () => boolean | Promise<boolean>;
  trigger: (open: () => void) => ReactNode;
}

export default function AdminConfirmPopover({
  title,
  description,
  confirmLabel = "Delete",
  pending = false,
  disabled = false,
  placement = "top",
  onConfirm,
  trigger,
}: AdminConfirmPopoverProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (wrapRef.current?.contains(target)) {
        return;
      }
      if ((target as Element).closest?.("[data-admin-confirm-popover]")) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleConfirm() {
    const confirmed = await onConfirm();
    if (confirmed) {
      setOpen(false);
    }
  }

  function openPopover() {
    if (!disabled && !pending) {
      setOpen(true);
    }
  }

  return (
    <div className="admin-confirm-wrap" ref={wrapRef}>
      {trigger(openPopover)}
      <FloatingPopover
        anchorEl={open ? wrapRef.current : null}
        open={open}
        placement={placement === "bottom" ? "below" : "auto"}
        align="end"
        dataAttribute="data-admin-confirm-popover"
        className="admin-confirm-popover"
        zIndex={10000}
      >
        <div role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <h3 id={titleId} className="admin-confirm-popover__title">
            {title}
          </h3>
          <p className="admin-confirm-popover__description">{description}</p>
          <div className="admin-confirm-popover__actions">
            <button
              type="button"
              className="admin-confirm-btn admin-confirm-btn--ghost"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-confirm-btn admin-confirm-btn--danger"
              disabled={pending}
              onClick={() => void handleConfirm()}
            >
              {pending ? "Deleting…" : confirmLabel}
            </button>
          </div>
        </div>
      </FloatingPopover>
    </div>
  );
}
