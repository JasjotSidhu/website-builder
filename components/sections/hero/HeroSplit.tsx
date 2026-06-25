"use client";

import EditableImage, { RenderDivImage } from "@/lib/editor/EditableImage";
import ImageEditSurface from "@/lib/editor/ImageEditSurface";
import { useReversedLayout } from "@/lib/traits/hooks";
import { SectionShell } from "../shared/SectionShell";
import { SectionHeader } from "../shared/SectionHeader";
import { SectionButtons } from "../shared/SectionContent";

export { heroSplitSchema } from "./schema-split";
export type { HeroSplitProps } from "./schema-split";

export default function HeroSplit() {
  const reversed = useReversedLayout();

  return (
    <SectionShell>
      <div
        className={`mx-auto flex max-w-6xl flex-col gap-14 px-6 @lg:flex-row @lg:items-center ${
          reversed ? "@lg:flex-row-reverse" : ""
        }`}
      >
        <div className="flex flex-1 flex-col gap-6">
          <SectionHeader
            align="left"
            eyebrowFallback="Our studio"
            headingAs="h1"
            size="hero"
            className="max-w-none"
          />
          <SectionButtons align="left" />
        </div>

        <div className="relative flex-1 @lg:pl-4">
          <div
            className="absolute -left-4 -top-4 h-24 w-24 rounded-[var(--radius)] border-2 border-[var(--color-primary)]/20"
            aria-hidden
          />
          <EditableImage
            dataKey="image"
            altKey="imageAlt"
            renderChildren={(image, uploadBtn, altText, titleText) => (
              <ImageEditSurface
                uploadBtn={uploadBtn}
                className="relative z-10 aspect-[4/3] w-full rounded-[var(--radius)] bg-gray-100 shadow-2xl ring-1 ring-black/10"
              >
                <RenderDivImage
                  image={image}
                  altText={altText}
                  titleText={titleText}
                  className="h-full w-full"
                />
              </ImageEditSurface>
            )}
          />
        </div>
      </div>
    </SectionShell>
  );
}
