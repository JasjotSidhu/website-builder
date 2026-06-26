"use client";

import { Link2 } from "lucide-react";
import { useEditMode } from "@/lib/editor/EditModeContext";
import Tooltip from "@/lib/editor/Tooltip";

export default function SharedContentBanner({ label }: { label: string }) {
  const { isEditing } = useEditMode();

  if (!isEditing) {
    return null;
  }

  return (
    <Tooltip
      label={`Edits to these ${label} sync to every page using this list.`}
      side="right"
      align="start"
      multiline
    >
      <span className="section-shared-tag" role="status">
        <Link2 size={10} strokeWidth={2.5} aria-hidden />
        Shared across site
      </span>
    </Tooltip>
  );
}
