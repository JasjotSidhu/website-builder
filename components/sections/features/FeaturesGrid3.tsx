"use client";

import { useEditMode } from "@/lib/editor/EditModeContext";
import EditorRemoveButton from "@/lib/editor/EditorRemoveButton";
import EditableIconPicker from "@/lib/editor/EditableIconPicker";
import EditableText from "@/lib/editor/EditableText";
import { applyItemPatch } from "@/lib/editor/apply-item-patch";
import {
  SectionDataProvider,
  useSectionData,
} from "@/lib/editor/SectionDataContext";
import { useSectionSettings } from "@/lib/traits/context";
import { SectionHeader } from "../shared/SectionHeader";
import { SectionShell } from "../shared/SectionShell";

export { featuresGrid3Schema } from "./schema-grid";
export type { FeaturesGrid3Props } from "./schema-grid";

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

const GRID_COLS_CLASSES: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 @sm:grid-cols-2",
  3: "grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3",
  4: "grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4",
  5: "grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-5",
  6: "grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-6",
};

const GAP_CLASSES: Record<string, string> = {
  sm: "gap-4",
  md: "gap-4 @md:gap-6",
  lg: "gap-4 @md:gap-6 @lg:gap-10",
};

export default function FeaturesGrid3() {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const settings = useSectionSettings();
  const items = (data.items as FeatureItem[] | undefined) ?? [];
  const columns = Number(settings.columns ?? 3);
  const colsClass = GRID_COLS_CLASSES[columns] ?? GRID_COLS_CLASSES[3];
  const gapClass = GAP_CLASSES[String(settings.gap ?? "md")] ?? GAP_CLASSES.md;

  return (
    <SectionShell>
      <div className="mx-auto max-w-7xl px-4 @sm:px-6 @lg:px-8">
        <div className="mb-10 flex justify-center @sm:mb-14">
          <SectionHeader align="center" eyebrowFallback="Features" />
        </div>

        <div className={`grid ${colsClass} ${gapClass}`}>
          {items.map((item, index) => {
            const applyItemPatchForIndex = (partial: Record<string, unknown>) => {
              updateField("items", applyItemPatch(items, index, partial));
            };

            return (
            <SectionDataProvider
              key={`feature-${index}`}
              data={item as unknown as Record<string, unknown>}
              updateField={(key, value) => applyItemPatchForIndex({ [key]: value })}
              updateFields={applyItemPatchForIndex}
            >
              <article className="feature-card group relative">
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
                <EditableIconPicker />
                <EditableText
                  as="h3"
                  dataKey="title"
                  maxLength={40}
                  className="mt-5 text-xl font-semibold"
                  themeTextRole="cardTitle"
                />
                <EditableText
                  as="p"
                  dataKey="description"
                  themeTextRole="card"
                  maxLength={150}
                  className="mt-3 text-[15px] leading-relaxed opacity-80"
                />
              </article>
            </SectionDataProvider>
            );
          })}
        </div>

        {isEditing ? (
          <button
            type="button"
            className="button-item-add mx-auto mt-8 block"
            onClick={() =>
              updateField("items", [
                ...items,
                { icon: "grid", title: "New item", description: "Add a short description" },
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
