"use client";

import EditableImage, { RenderDivImage } from "@/lib/editor/EditableImage";
import ImageEditSurface from "@/lib/editor/ImageEditSurface";
import EditableText from "@/lib/editor/EditableText";
import { useSectionData } from "@/lib/editor/SectionDataContext";

interface EditableLogoProps {
  textClassName?: string;
  imageClassName?: string;
  maxLength?: number;
}

export default function EditableLogo({
  textClassName = "text-lg font-semibold",
  imageClassName = "h-10 w-auto object-contain",
  maxLength = 40,
}: EditableLogoProps) {
  const { data } = useSectionData();
  const logo = data as { type?: "text" | "image"; value?: string };
  const type = logo.type ?? "text";

  if (type === "image") {
    return (
      <EditableImage
        dataKey="value"
        renderChildren={(image, uploadBtn) => (
          <ImageEditSurface uploadBtn={uploadBtn} compact className="inline-flex">
            <RenderDivImage image={image} altText="" className={imageClassName} />
          </ImageEditSurface>
        )}
      />
    );
  }

  return (
    <EditableText
      as="span"
      dataKey="value"
      maxLength={maxLength}
      className={`${textClassName} [font-family:var(--font-heading)]`}
    />
  );
}
