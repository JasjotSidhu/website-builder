"use client";

import { forwardRef, type ReactNode } from "react";

export interface PopoverShellProps {
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "editor" | "settings" | "toolbar";
  className?: string;
  role?: string;
  "aria-label"?: string;
  onMouseDown?: (event: React.MouseEvent) => void;
  compact?: boolean;
  hideHeader?: boolean;
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3.5 3.5l7 7M10.5 3.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const PopoverShell = forwardRef<HTMLDivElement, PopoverShellProps>(
  function PopoverShell(
    {
      title,
      subtitle,
      onClose,
      children,
      footer,
      variant = "editor",
      className = "",
      role = "dialog",
      "aria-label": ariaLabel,
      onMouseDown,
      compact = false,
      hideHeader = false,
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={`popover popover--${variant}${compact ? " popover--compact" : ""}${hideHeader ? " popover--headerless" : ""} ${className}`.trim()}
        role={role}
        aria-label={ariaLabel ?? title ?? "Settings"}
        onMouseDown={onMouseDown}
      >
        {!hideHeader ? <div className="popover__arrow" aria-hidden /> : null}
        {!hideHeader ? (
          <div className="popover__header">
            <div className="popover__header-text">
              {title ? <h3 className="popover__title">{title}</h3> : null}
              {subtitle && !compact ? <p className="popover__subtitle">{subtitle}</p> : null}
            </div>
            {onClose ? (
              <button
                type="button"
                className="popover__close"
                onClick={onClose}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="popover__body">{children}</div>
        {footer ? <div className="popover__footer">{footer}</div> : null}
      </div>
    );
  },
);

PopoverShell.displayName = "PopoverShell";

export function PopoverField({
  label,
  hint,
  children,
  inline = false,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  inline?: boolean;
}) {
  return (
    <label className={`popover-field${inline ? " popover-field--inline" : ""}`}>
      <span className="popover-field__label">{label}</span>
      {hint ? <span className="popover-field__hint">{hint}</span> : null}
      {children}
    </label>
  );
}

export function PopoverActions({
  onCancel,
  onSave,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  saveDisabled,
}: {
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  saveDisabled?: boolean;
}) {
  return (
    <>
      <button type="button" className="popover-btn popover-btn--ghost" onClick={onCancel}>
        {cancelLabel}
      </button>
      <button
        type="button"
        className="popover-btn popover-btn--primary"
        onClick={onSave}
        disabled={saveDisabled}
      >
        {saveLabel}
      </button>
    </>
  );
}
