"use client";

import EditableImage, { RenderDivImage } from "@/lib/editor/EditableImage";
import {
  useBackgroundStyle,
  useOverlayStyle,
  useSpacingStyle,
} from "@/lib/traits/hooks";
import { SectionButtons, SectionHeading } from "../shared/SectionContent";

export { heroCenteredSchema } from "./schema-centered";
export type { HeroCenteredProps } from "./schema-centered";

export default function HeroCentered() {
  const bgStyle = useBackgroundStyle();
  const spacingStyle = useSpacingStyle();
  const overlayStyle = useOverlayStyle();

  return (
    <section style={{ ...bgStyle, ...spacingStyle }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6">
        <SectionHeading align="center" />
        <SectionButtons />
        <div className="relative mt-4 w-full max-w-4xl">
          <EditableImage
            dataKey="image"
            altKey="imageAlt"
            renderChildren={(image, uploadBtn, altText) => (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius)] bg-gray-100">
                <RenderDivImage
                  image={image}
                  altText={altText}
                  className="h-full w-full"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={overlayStyle}
                />
                <div className="absolute right-2 top-2">{uploadBtn}</div>
              </div>
            )}
          />
        </div>
      </div>
    </section>
  );
}
