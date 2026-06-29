"use client";

import EditableImage, { RenderDivImage } from "@/lib/editor/EditableImage";
import ImageEditSurface from "@/lib/editor/ImageEditSurface";
import { SectionShell } from "../shared/SectionShell";
import { SectionHeader } from "../shared/SectionHeader";
import { SectionButtons } from "../shared/SectionContent";

export { heroBackgroundSchema } from "./schema-background";
export type { HeroBackgroundProps } from "./schema-background";

export default function HeroBackground() {
  return (
    <SectionShell className="hero-background">
      <div className="relative flex min-h-[28rem] items-center @lg:min-h-[32rem]">
        <EditableImage
          dataKey="image"
          altKey="imageAlt"
          renderChildren={(image, uploadBtn, altText, titleText) => (
            <ImageEditSurface
              uploadBtn={uploadBtn}
              className="absolute inset-0 bg-[var(--color-title-text)]"
            >
              <RenderDivImage
                image={image}
                altText={altText}
                titleText={titleText}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-black/55" />
            </ImageEditSurface>
          )}
        />

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-4 py-16 text-center @sm:px-6 @lg:px-8">
          <SectionHeader
            align="center"
            eyebrowFallback="Discover"
            headingAs="h1"
            size="hero"
            onDarkSurface
            className="max-w-none"
          />
          <SectionButtons appearance="cta" />
        </div>
      </div>
    </SectionShell>
  );
}
