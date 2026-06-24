"use client";

import EditableImage, { RenderDivImage } from "@/lib/editor/EditableImage";
import ImageEditSurface from "@/lib/editor/ImageEditSurface";
import { SectionShell } from "../shared/SectionShell";
import { SectionEyebrow } from "../shared/SectionEyebrow";
import { SectionButtons, SectionHeading } from "../shared/SectionContent";

export { heroCenteredSchema } from "./schema-centered";
export type { HeroCenteredProps } from "./schema-centered";

export default function HeroCentered() {
  return (
    <SectionShell>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6">
        <div className="flex flex-col items-center gap-6">
          <SectionEyebrow fallback="Welcome" />
          <SectionHeading align="center" />
          <SectionButtons />
        </div>

        <div className="relative mt-2 w-full max-w-4xl">
          <div
            className="absolute -inset-3 rounded-[calc(var(--radius)+8px)] opacity-40 blur-2xl"
            style={{ background: "var(--color-primary)" }}
          />
          <EditableImage
            dataKey="image"
            altKey="imageAlt"
            renderChildren={(image, uploadBtn, altText, titleText) => (
              <ImageEditSurface
                uploadBtn={uploadBtn}
                className="aspect-[16/9] w-full rounded-[var(--radius)] bg-gray-100 shadow-2xl ring-1 ring-black/10"
              >
                <RenderDivImage
                  image={image}
                  altText={altText}
                  titleText={titleText}
                  className="absolute inset-0 h-full w-full"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/20" />
              </ImageEditSurface>
            )}
          />
        </div>
      </div>
    </SectionShell>
  );
}
