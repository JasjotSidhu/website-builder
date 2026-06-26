"use client";

import { Camera } from "lucide-react";
import { useCallback, useState } from "react";
import Tooltip from "./Tooltip";
import { useEditMode } from "./EditModeContext";
import { useSectionData } from "./SectionDataContext";
import ImageUrlPopover from "./ImageUrlPopover";

interface EditableImageProps {
  dataKey: string;
  altKey?: string;
  titleKey?: string;
  compact?: boolean;
  showTooltip?: boolean;
  renderChildren: (
    image: string,
    uploadBtn: React.ReactNode,
    altText: string,
    titleText: string,
  ) => React.ReactNode;
}

export default function EditableImage({
  dataKey,
  altKey,
  titleKey,
  compact = false,
  showTooltip = true,
  renderChildren,
}: EditableImageProps) {
  const { isEditing } = useEditMode();
  const { data, updateFields } = useSectionData();
  const image = String(data[dataKey] ?? "");
  const resolvedAltKey = altKey ?? `${dataKey}Alt`;
  const resolvedTitleKey = titleKey ?? `${dataKey}Title`;
  const altText = String(data[resolvedAltKey] ?? "");
  const titleText = String(data[resolvedTitleKey] ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleCancel = useCallback(() => setPickerOpen(false), []);

  const handleSave = useCallback(
    (url: string, alt: string, title: string) => {
      const partial: Record<string, unknown> = {
        [dataKey]: url,
        [resolvedTitleKey]: title,
      };

      if (altKey !== undefined || data[resolvedAltKey] !== undefined) {
        partial[resolvedAltKey] = alt;
      }

      updateFields(partial);
      setPickerOpen(false);
    },
    [altKey, data, dataKey, resolvedAltKey, resolvedTitleKey, updateFields],
  );

  const uploadButton = (
    <button
      ref={setAnchorEl}
      type="button"
      className={`image-upload-btn${compact ? " image-upload-btn--sm" : ""}`}
      aria-label="Change image"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        setPickerOpen(true);
      }}
    >
      <Camera size={compact ? 12 : 16} strokeWidth={1.75} aria-hidden />
    </button>
  );

  const uploadBtn = isEditing
    ? showTooltip
      ? (
          <Tooltip label="Change image" side="top">
            {uploadButton}
          </Tooltip>
        )
      : uploadButton
    : null;

  return (
    <>
      {renderChildren(image, uploadBtn, altText, titleText)}
      {pickerOpen ? (
        <ImageUrlPopover
          anchorEl={anchorEl}
          value={image}
          altValue={altText}
          titleValue={titleText}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : null}
    </>
  );
}

export function RenderDivImage({
  image,
  altText,
  titleText,
  className,
  children,
}: {
  image: string;
  altText: string;
  titleText?: string;
  className: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`render-div-image ${className}`.trim()} title={titleText || undefined}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image.slice(0, 64)}
          src={image}
          alt={altText}
          className="render-div-image__img"
          draggable={false}
        />
      ) : null}
      {children}
    </div>
  );
}
