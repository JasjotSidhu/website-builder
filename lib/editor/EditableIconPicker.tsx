"use client";

import { useRef, useState } from "react";
import { FeatureIcon } from "@/components/sections/features/FeatureIcon";
import { useEditMode } from "@/lib/editor/EditModeContext";
import { useSectionData } from "@/lib/editor/SectionDataContext";
import IconPickerPopover from "./IconPickerPopover";

export default function EditableIconPicker() {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const icon = String(data.icon ?? "grid");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  if (!isEditing) {
    return (
      <div className="feature-icon-wrap">
        <FeatureIcon name={icon} />
      </div>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`feature-icon-wrap feature-icon-wrap--editable${
          open ? " feature-icon-wrap--open" : ""
        }`}
        aria-label="Choose icon"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        <FeatureIcon name={icon} />
      </button>
      <IconPickerPopover
        anchorEl={triggerRef.current}
        open={open}
        value={icon}
        onSelect={(iconId) => updateField("icon", iconId)}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
