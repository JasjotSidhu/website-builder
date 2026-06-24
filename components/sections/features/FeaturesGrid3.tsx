"use client";

import { useEditMode } from "@/lib/editor/EditModeContext";
import EditableText from "@/lib/editor/EditableText";
import {
  SectionDataProvider,
  useSectionData,
} from "@/lib/editor/SectionDataContext";
import {
  useBackgroundStyle,
  useGridStyle,
  useSpacingStyle,
} from "@/lib/traits/hooks";
import { FeatureIcon } from "./FeatureIcon";

export { featuresGrid3Schema } from "./schema-grid";
export type { FeaturesGrid3Props } from "./schema-grid";

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export default function FeaturesGrid3() {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const items = (data.items as FeatureItem[] | undefined) ?? [];
  const gridStyle = useGridStyle();
  const bgStyle = useBackgroundStyle();
  const spacingStyle = useSpacingStyle();

  return (
    <section style={{ ...bgStyle, ...spacingStyle }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
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

        <div style={gridStyle}>
          {items.map((item, index) => (
            <SectionDataProvider
              key={`feature-${index}`}
              data={item as unknown as Record<string, unknown>}
              updateField={(key, value) => {
                const next = [...items];
                next[index] = { ...next[index], [key]: value };
                updateField("items", next);
              }}
            >
              <article className="relative rounded-[var(--radius)] bg-[var(--color-background)] p-6 shadow-sm ring-1 ring-black/5">
                {isEditing ? (
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
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
                <FeatureIcon name={item.icon} />
                <h3
                  className="mt-4 text-xl font-semibold text-[var(--color-text)]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <EditableText as="span" dataKey="title" maxLength={40} />
                </h3>
                <p className="mt-2 text-[var(--color-text)] opacity-85">
                  <EditableText as="span" dataKey="description" maxLength={150} />
                </p>
              </article>
            </SectionDataProvider>
          ))}
        </div>

        {isEditing ? (
          <button
            type="button"
            className="mt-6 rounded-[var(--radius)] border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-400"
            onClick={() =>
              updateField("items", [
                ...items,
                { icon: "grid", title: "New item", description: "" },
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
