"use client";

import { useEditMode } from "@/lib/editor/EditModeContext";
import EditorRemoveButton from "@/lib/editor/EditorRemoveButton";
import EditableText from "@/lib/editor/EditableText";
import {
  SectionDataProvider,
  useSectionData,
} from "@/lib/editor/SectionDataContext";
import { useGridStyle } from "@/lib/traits/hooks";
import { SectionHeader } from "../shared/SectionHeader";
import { SectionShell } from "../shared/SectionShell";
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

  return (
    <SectionShell>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 flex justify-center">
          <SectionHeader align="center" eyebrowFallback="Features" />
        </div>

        <div style={gridStyle}>
          {items.map((item, index) => {
            const applyItemPatch = (partial: Record<string, unknown>) => {
              const next = [...items];
              const itemData = { ...next[index] };
              for (const [key, value] of Object.entries(partial)) {
                if (value === undefined || value === "") {
                  delete itemData[key as keyof typeof itemData];
                } else {
                  itemData[key as keyof typeof itemData] = value as never;
                }
              }
              next[index] = itemData;
              updateField("items", next);
            };

            return (
            <SectionDataProvider
              key={`feature-${index}`}
              data={item as unknown as Record<string, unknown>}
              updateField={(key, value) => applyItemPatch({ [key]: value })}
              updateFields={applyItemPatch}
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
                <div className="feature-icon-wrap">
                  <FeatureIcon name={item.icon} />
                </div>
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
