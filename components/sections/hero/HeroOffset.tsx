"use client";

import EditableImage, { RenderDivImage } from "@/lib/editor/EditableImage";
import ImageEditSurface from "@/lib/editor/ImageEditSurface";
import { SectionShell } from "../shared/SectionShell";
import { SectionHeader } from "../shared/SectionHeader";
import { SectionButtons } from "../shared/SectionContent";

export { heroOffsetSchema } from "./schema-offset";
export type { HeroOffsetProps } from "./schema-offset";

export default function HeroOffset() {
  return (
    <SectionShell>
      <div className="mx-auto max-w-6xl px-4 @sm:px-6 @lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 @lg:grid-cols-2 @lg:gap-16">
          <div className="flex flex-col gap-6 @lg:py-8">
            <SectionHeader
              align="left"
              eyebrowFallback="Studio"
              headingAs="h1"
              size="hero"
              className="max-w-none"
            />
            <SectionButtons align="left" />
          </div>

          <div className="relative @lg:-mr-8">
            <div
              className="absolute -right-4 -top-4 -z-10 h-full w-full rounded-[calc(var(--radius)+12px)] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
              aria-hidden
            />
            <EditableImage
              dataKey="image"
              altKey="imageAlt"
              renderChildren={(image, uploadBtn, altText, titleText) => (
                <ImageEditSurface
                  uploadBtn={uploadBtn}
                  className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius)] bg-[color-mix(in_srgb,var(--color-body-text)_8%,transparent)] shadow-2xl ring-1 ring-black/10 @lg:aspect-[3/4]"
                >
                  <RenderDivImage
                    image={image}
                    altText={altText}
                    titleText={titleText}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </ImageEditSurface>
              )}
            />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
