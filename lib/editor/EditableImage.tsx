"use client";

import { useState } from "react";
import { useEditMode } from "./EditModeContext";
import { useSectionData } from "./SectionDataContext";
import ImageUrlPopover from "./ImageUrlPopover";

interface EditableImageProps {
  dataKey: string;
  altKey?: string;
  renderChildren: (
    image: string,
    uploadBtn: React.ReactNode,
    altText: string,
  ) => React.ReactNode;
}

export default function EditableImage({
  dataKey,
  altKey,
  renderChildren,
}: EditableImageProps) {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const image = String(data[dataKey] ?? "");
  const resolvedAltKey = altKey ?? `${dataKey}Alt`;
  const altText = String(data[resolvedAltKey] ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);

  const uploadBtn = isEditing ? (
    <>
      <button
        type="button"
        className="image-upload-btn"
        aria-label="Change image"
        onClick={() => setPickerOpen(true)}
      >
        <CameraIcon />
      </button>
      {pickerOpen ? (
        <ImageUrlPopover
          value={image}
          altValue={altText}
          onSave={(url, alt) => {
            updateField(dataKey, url);
            if (altKey !== undefined || data[resolvedAltKey] !== undefined) {
              updateField(resolvedAltKey, alt);
            }
            setPickerOpen(false);
          }}
          onCancel={() => setPickerOpen(false)}
        />
      ) : null}
    </>
  ) : null;

  return <>{renderChildren(image, uploadBtn, altText)}</>;
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h2l2-3h8l2 3h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function RenderDivImage({
  image,
  altText,
  className,
  children,
}: {
  image: string;
  altText: string;
  className: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={className}
      style={{
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      role="img"
      aria-label={altText}
    >
      {children}
    </div>
  );
}
