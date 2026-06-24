"use client";

import { useEditMode } from "@/lib/editor/EditModeContext";
import { useSectionData } from "@/lib/editor/SectionDataContext";
import { FeatureIcon } from "@/components/sections/features/FeatureIcon";

const ICON_OPTIONS = ["layers", "palette", "sparkle", "target", "compass", "grid"] as const;

export default function EditableIconPicker() {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const icon = String(data.icon ?? "grid");

  if (!isEditing) {
    return (
      <div className="feature-icon-wrap">
        <FeatureIcon name={icon} />
      </div>
    );
  }

  const cycleIcon = () => {
    const currentIndex = ICON_OPTIONS.indexOf(icon as (typeof ICON_OPTIONS)[number]);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % ICON_OPTIONS.length;
    updateField("icon", ICON_OPTIONS[nextIndex]);
  };

  return (
    <button
      type="button"
      className="feature-icon-wrap feature-icon-wrap--editable"
      aria-label="Change icon"
      onClick={cycleIcon}
    >
      <FeatureIcon name={icon} />
    </button>
  );
}
