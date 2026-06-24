"use client";

import { X } from "lucide-react";
import { useEditMode } from "@/lib/editor/EditModeContext";
import EditableImage, { RenderDivImage } from "@/lib/editor/EditableImage";
import EditableText from "@/lib/editor/EditableText";
import Tooltip from "@/lib/editor/Tooltip";
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
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 flex justify-center">
          <SectionHeader align="center" eyebrow="Process" />
        </div>

        <div className="flex flex-col gap-20">
          {items.map((item, index) => {
            const imageFirst = index % 2 === 0;

            return (
              <SectionDataProvider
                key={`alt-feature-${index}`}
                data={item as unknown as Record<string, unknown>}
                updateField={(key, value) => {
                  const next = [...items];
                  const itemData = { ...next[index] };
                  if (value === undefined || value === "") {
                    delete itemData[key as keyof typeof itemData];
                  } else {
                    itemData[key as keyof typeof itemData] = value as never;
                  }
                  next[index] = itemData;
                  updateField("items", next);
                }}
              >
                <div className="relative grid items-center gap-10 md:grid-cols-2 md:gap-14">
                  {isEditing ? (
                    <Tooltip label="Remove item" side="left">
                      <button
                        type="button"
                        className="absolute -top-3 right-0 z-10 flex items-center justify-center rounded-full bg-white px-2 py-1 text-xs text-red-600 shadow-sm hover:bg-red-50"
                        aria-label="Remove item"
                        onClick={() =>
                          updateField(
                            "items",
                            items.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                      >
                        <X size={12} strokeWidth={2} aria-hidden />
                      </button>
                    </Tooltip>
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
        className="text-2xl font-semibold tracking-tight md:text-3xl"
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
          <RenderDivImage
            image={image}
            altText={altText}
            titleText={titleText}
            className="relative z-10 aspect-[14/9] w-full rounded-[var(--radius)] bg-gray-100 object-cover shadow-xl ring-1 ring-black/10"
          >
            {uploadBtn}
          </RenderDivImage>
        )}
      />
    </div>
  );
}
