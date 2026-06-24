"use client";

import EditableImage, { RenderDivImage } from "@/lib/editor/EditableImage";
import { useBackgroundStyle, useSpacingStyle } from "@/lib/traits/hooks";
import { SectionButtons, SectionHeading } from "../shared/SectionContent";

export { heroSplitSchema } from "./schema-split";
export type { HeroSplitProps } from "./schema-split";

export default function HeroSplit() {
  const bgStyle = useBackgroundStyle();
  const spacingStyle = useSpacingStyle();

  return (
    <section style={{ ...bgStyle, ...spacingStyle }}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
        <div>
          <SectionHeading align="left" />
          <div className="mt-8">
            <SectionButtons align="left" />
          </div>
        </div>
        <div className="relative">
          <EditableImage
            dataKey="image"
            altKey="imageAlt"
            renderChildren={(image, uploadBtn, altText) => (
              <RenderDivImage
                image={image}
                altText={altText}
                className="aspect-[4/3] w-full rounded-[var(--radius)] bg-gray-100"
              >
                {uploadBtn}
              </RenderDivImage>
            )}
          />
        </div>
      </div>
    </section>
  );
}
