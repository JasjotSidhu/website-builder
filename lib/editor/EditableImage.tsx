"use client";

import { Camera } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Tooltip from "./Tooltip";
import { useEditMode } from "./EditModeContext";
import { useSectionData } from "./SectionDataContext";
import ImageUrlPopover from "./ImageUrlPopover";

interface EditableImageProps {
  dataKey: string;
  altKey?: string;
  titleKey?: string;
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
  renderChildren,
}: EditableImageProps) {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const image = String(data[dataKey] ?? "");
  const resolvedAltKey = altKey ?? `${dataKey}Alt`;
  const resolvedTitleKey = titleKey ?? `${dataKey}Title`;
  const altText = String(data[resolvedAltKey] ?? "");
  const titleText = String(data[resolvedTitleKey] ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleCancel = useCallback(() => setPickerOpen(false), []);

  const handleSave = useCallback(
    (url: string, alt: string, title: string) => {
      updateField(dataKey, url);
      if (altKey !== undefined || data[resolvedAltKey] !== undefined) {
        updateField(resolvedAltKey, alt);
      }
      updateField(resolvedTitleKey, title);
      setPickerOpen(false);
    },
    [altKey, data, dataKey, resolvedAltKey, resolvedTitleKey, updateField],
  );

  const uploadBtn = isEditing ? (
    <>
      <Tooltip label="Change image" side="left">
        <button
          ref={anchorRef}
          type="button"
          className="image-upload-btn"
          aria-label="Change image"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            setPickerOpen(true);
          }}
        >
          <Camera size={16} strokeWidth={1.75} aria-hidden />
        </button>
      </Tooltip>
      {pickerOpen ? (
        <ImageUrlPopover
          anchorEl={anchorRef.current}
          value={image}
          altValue={altText}
          titleValue={titleText}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : null}
    </>
  ) : null;

  return <>{renderChildren(image, uploadBtn, altText, titleText)}</>;
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
