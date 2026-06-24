"use client";

import { X } from "lucide-react";
import { useEditMode } from "@/lib/editor/EditModeContext";
import EditableText from "@/lib/editor/EditableText";
import Tooltip from "@/lib/editor/Tooltip";
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
          <SectionHeader align="center" eyebrow="Features" />
        </div>

        <div style={gridStyle}>
          {items.map((item, index) => (
            <SectionDataProvider
              key={`feature-${index}`}
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
              <article className="feature-card group relative">
                {isEditing ? (
                  <Tooltip label="Remove item" side="left">
                    <button
                      type="button"
                      className="absolute right-3 top-3 z-10 flex items-center justify-center rounded-full bg-white/90 px-2 py-1 text-xs text-red-600 shadow-sm hover:bg-red-50"
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
          ))}
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
