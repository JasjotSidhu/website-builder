"use client";

import { X } from "lucide-react";
import Tooltip from "./Tooltip";

export default function EditorRemoveButton({
  label,
  onClick,
  compact = false,
}: {
  label: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <span
      className={`editor-remove-btn-wrap${compact ? " editor-remove-btn-wrap--compact" : ""}`}
    >
      <Tooltip label={label} side="left">
        <button type="button" className="editor-remove-btn" aria-label={label} onClick={onClick}>
          <X size={14} strokeWidth={2} aria-hidden />
        </button>
      </Tooltip>
    </span>
  );
}
