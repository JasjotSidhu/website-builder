"use client";

import { useEditMode } from "@/lib/editor/EditModeContext";
import EditableImage, { RenderDivImage } from "@/lib/editor/EditableImage";
import EditableText from "@/lib/editor/EditableText";
import {
  SectionDataProvider,
  useSectionData,
} from "@/lib/editor/SectionDataContext";
import { useBackgroundStyle, useSpacingStyle } from "@/lib/traits/hooks";

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
  const bgStyle = useBackgroundStyle();
  const spacingStyle = useSpacingStyle();

  return (
    <section style={{ ...bgStyle, ...spacingStyle }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2
            className="text-3xl font-bold text-[var(--color-text)] md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <EditableText as="span" dataKey="heading" maxLength={80} />
          </h2>
          <p className="mt-4 text-lg text-[var(--color-text)] opacity-85">
            <EditableText as="span" dataKey="subheading" maxLength={200} required={false} />
          </p>
        </div>

        <div className="flex flex-col gap-16">
          {items.map((item, index) => {
            const imageFirst = index % 2 === 0;

            return (
              <SectionDataProvider
                key={`alt-feature-${index}`}
                data={item as unknown as Record<string, unknown>}
                updateField={(key, value) => {
                  const next = [...items];
                  next[index] = { ...next[index], [key]: value };
                  updateField("items", next);
                }}
              >
                <div className="relative grid items-center gap-8 md:grid-cols-2 md:gap-12">
                  {isEditing ? (
                    <button
                      type="button"
                      className="absolute -top-2 right-0 z-10 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      onClick={() =>
                        updateField(
                          "items",
                          items.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      Remove
                    </button>
                  ) : null}
                  {imageFirst ? (
                    <>
                      <FeatureImage />
                      <FeatureText />
                    </>
                  ) : (
                    <>
                      <FeatureText />
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
            className="mt-8 rounded-[var(--radius)] border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-400"
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
    </section>
  );
}

function FeatureText() {
  return (
    <div className="flex flex-col gap-4">
      <h3
        className="text-2xl font-semibold text-[var(--color-text)]"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <EditableText as="span" dataKey="title" maxLength={60} />
      </h3>
      <p className="text-lg text-[var(--color-text)] opacity-85">
        <EditableText as="span" dataKey="description" maxLength={250} />
      </p>
    </div>
  );
}

function FeatureImage() {
  return (
    <EditableImage
      dataKey="image"
      altKey="imageAlt"
      renderChildren={(image, uploadBtn, altText) => (
        <RenderDivImage
          image={image}
          altText={altText}
          className="aspect-[14/9] w-full rounded-[var(--radius)] bg-gray-100"
        >
          {uploadBtn}
        </RenderDivImage>
      )}
    />
  );
}
