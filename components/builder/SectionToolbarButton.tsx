"use client";

import Tooltip from "@/lib/editor/Tooltip";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowUp,
  Bookmark,
  Copy,
  EyeOff,
  RefreshCw,
  Settings,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";

const TOOLBAR_ICON_PROPS = {
  size: 16,
  strokeWidth: 1.75,
  absoluteStrokeWidth: true,
} as const;

export function SectionToolbarButton({
  title,
  onClick,
  disabled,
  variant = "default",
  children,
  buttonRef,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
  children: ReactNode;
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <Tooltip label={title} side="bottom">
      <button
        ref={buttonRef}
        type="button"
        aria-label={title}
        disabled={disabled}
        className={`section-toolbar-btn${variant === "danger" ? " section-toolbar-btn--danger" : ""}`}
        onClick={onClick}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function ToolbarIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="section-toolbar-icon" aria-hidden>
      <Icon {...TOOLBAR_ICON_PROPS} />
    </span>
  );
}

export function IconSettings() {
  return <ToolbarIcon icon={Settings} />;
}

export function IconReplace() {
  return <ToolbarIcon icon={RefreshCw} />;
}

export function IconDuplicate() {
  return <ToolbarIcon icon={Copy} />;
}

export function IconHide() {
  return <ToolbarIcon icon={EyeOff} />;
}

export function IconArrowUp() {
  return <ToolbarIcon icon={ArrowUp} />;
}

export function IconArrowDown() {
  return <ToolbarIcon icon={ArrowDown} />;
}

export function IconDelete() {
  return <ToolbarIcon icon={Trash2} />;
}

export function IconSave() {
  return <ToolbarIcon icon={Bookmark} />;
}
