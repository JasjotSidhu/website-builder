"use client";

import type { ReactNode } from "react";

interface AdminIconActionProps {
  label: string;
  disabled?: boolean;
  danger?: boolean;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}

export default function AdminIconAction({
  label,
  disabled,
  danger,
  href,
  onClick,
  children,
}: AdminIconActionProps) {
  const className = danger ? "admin-icon-btn admin-icon-btn--danger" : "admin-icon-btn";

  const content = (
    <>
      {children}
      <span className="admin-icon-btn__tooltip">{label}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <a href={href} className={className} aria-label={label} download>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      title={disabled ? label : undefined}
      disabled={disabled}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
