"use client";

import { useEffect, useRef } from "react";
import { useEditMode } from "./EditModeContext";
import { useSectionData } from "./SectionDataContext";

type EditableTag = "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div";

interface EditableTextProps {
  dataKey: string;
  maxLength: number;
  required?: boolean;
  as?: EditableTag;
  className?: string;
}

export default function EditableText({
  dataKey,
  maxLength,
  required = true,
  as: Tag = "span",
  className,
}: EditableTextProps) {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const value = String(data[dataKey] ?? "");
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isEditing && ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [isEditing, value]);

  if (!isEditing) {
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <Tag
      ref={ref as never}
      className={`${className ?? ""} editable-field ${
        required && !value.trim() ? "editable-field--empty" : ""
      }`.trim()}
      contentEditable
      suppressContentEditableWarning
      onInput={(event) => {
        const text = event.currentTarget.textContent ?? "";
        if (text.length > maxLength) {
          event.currentTarget.textContent = text.slice(0, maxLength);
        }
        updateField(dataKey, event.currentTarget.textContent ?? "");
      }}
      onBlur={(event) => updateField(dataKey, event.currentTarget.textContent ?? "")}
    >
      {value}
    </Tag>
  );
}
