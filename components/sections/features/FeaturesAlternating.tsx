"use client";

import { useEditMode } from "@/lib/editor/EditModeContext";
import EditableImage, { RenderDivImage } from "@/lib/editor/EditableImage";
import EditorRemoveButton from "@/lib/editor/EditorRemoveButton";
import ImageEditSurface from "@/lib/editor/ImageEditSurface";
import EditableText from "@/lib/editor/EditableText";
import { applyItemPatch } from "@/lib/editor/apply-item-patch";
import {
  SectionDataProvider,
  useSectionData,
} from "@/lib/editor/SectionDataContext";
import { SectionHeader } from "../shared/SectionHeader";
import { SectionShell } from "../shared/SectionShell";

export { featuresAlternatingSchema } from "./schema-alternating";
export type { FeaturesAlternatingProps } from "./schema-alternating";

interface AlternatingItem {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

export default function FeaturesAlternating() {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const items = (data.items as AlternatingItem[] | undefined) ?? [];

  return (
    <SectionShell>
      <div className="mx-auto max-w-7xl px-4 @sm:px-6 @lg:px-8">
        <div className="mb-10 flex justify-center @sm:mb-16">
          <SectionHeader align="center" eyebrowFallback="Process" />
        </div>

        <div className="flex flex-col gap-12 @sm:gap-16 @lg:gap-20">
          {items.map((item, index) => {
            const imageFirst = index % 2 === 0;

            const applyItemPatchForIndex = (partial: Record<string, unknown>) => {
              updateField("items", applyItemPatch(items, index, partial));
            };

            return (
              <SectionDataProvider
                key={`alt-feature-${index}`}
                data={item as unknown as Record<string, unknown>}
                updateField={(key, value) => applyItemPatchForIndex({ [key]: value })}
                updateFields={applyItemPatchForIndex}
              >
                <div className="relative grid items-center gap-10 overflow-visible @md:grid-cols-2 @md:gap-14">
                  {isEditing ? (
                    <EditorRemoveButton
                      label="Remove item"
                      onClick={() =>
                        updateField(
                          "items",
                          items.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    />
                  ) : null}
                  {imageFirst ? (
                    <>
                      <FeatureImage />
                      <FeatureText step={index + 1} />
                    </>
                  ) : (
                    <>
                      <FeatureText step={index + 1} />
                      <FeatureImage />
                    </>
                  )}
                </div>
              </SectionDataProvider>
            );
          })}
        </div>

        {isEditing ? (
          <button
            type="button"
            className="button-item-add mx-auto mt-10 block"
            onClick={() =>
              updateField("items", [
                ...items,
                { title: "New step", description: "", image: "", imageAlt: "" },
              ])
            }
          >
            + Add item
          </button>
        ) : null}
      </div>
    </SectionShell>
  );
}

function FeatureText({ step }: { step: number }) {
  return (
    <div className="flex flex-col gap-5">
      <span className="step-badge">Step {String(step).padStart(2, "0")}</span>
      <EditableText
        as="h3"
        dataKey="title"
        maxLength={60}
        className="text-2xl font-semibold tracking-tight @md:text-3xl"
      />
      <EditableText
        as="p"
        dataKey="description"
        maxLength={250}
        className="text-lg leading-relaxed opacity-80"
      />
    </div>
  );
}

function FeatureImage() {
  return (
    <div className="relative">
      <div
        className="absolute -right-3 -top-3 z-0 h-full w-full rounded-[var(--radius)]"
        style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
        aria-hidden
      />
      <EditableImage
        dataKey="image"
        altKey="imageAlt"
        renderChildren={(image, uploadBtn, altText, titleText) => (
          <ImageEditSurface
            uploadBtn={uploadBtn}
            className="relative z-10 aspect-[14/9] w-full rounded-[var(--radius)] bg-gray-100 shadow-xl ring-1 ring-black/10"
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
  );
}
