"use client";

import { useEditMode } from "@/lib/editor/EditModeContext";

interface LogoTypeToggleProps {
  type: "text" | "image";
  onChange: (type: "text" | "image") => void;
}

export default function LogoTypeToggle({ type, onChange }: LogoTypeToggleProps) {
  const { isEditing } = useEditMode();

  if (!isEditing) {
    return null;
  }

  return (
    <div className="logo-type-toggle" role="group" aria-label="Logo type">
      <button
        type="button"
        className={`logo-type-toggle__btn${type === "text" ? " logo-type-toggle__btn--active" : ""}`}
        onClick={() => onChange("text")}
      >
        Text
      </button>
      <button
        type="button"
        className={`logo-type-toggle__btn${type === "image" ? " logo-type-toggle__btn--active" : ""}`}
        onClick={() => onChange("image")}
      >
        Image
      </button>
    </div>
  );
}
