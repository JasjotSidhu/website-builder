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
import { useGridStyle } from "@/lib/traits/hooks";
import { SectionHeader } from "../shared/SectionHeader";
import { SectionShell } from "../shared/SectionShell";

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

  return (
    <SectionShell>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 flex justify-center">
          <SectionHeader align="center" eyebrowFallback="Features" />
        </div>

        <div style={gridStyle}>
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
                />
                <EditableText
                  as="p"
                  dataKey="description"
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
                { icon: "grid", title: "New item", description: "" },
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
