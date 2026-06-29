"use client";

import { useEditMode } from "@/lib/editor/EditModeContext";
import EditorRemoveButton from "@/lib/editor/EditorRemoveButton";
import EditableText from "@/lib/editor/EditableText";
import { applyItemPatch } from "@/lib/editor/apply-item-patch";
import {
  SectionDataProvider,
  useSectionData,
} from "@/lib/editor/SectionDataContext";
import { SectionShell } from "../shared/SectionShell";
import { SectionHeader } from "../shared/SectionHeader";
import { SectionButtons } from "../shared/SectionContent";

export { heroStatsSchema } from "./schema-stats";
export type { HeroStatsProps } from "./schema-stats";

interface StatItem {
  value: string;
  label: string;
}

export default function HeroStats() {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const stats = (data.stats as StatItem[] | undefined) ?? [];

  return (
    <SectionShell>
      <div className="mx-auto max-w-5xl px-4 @sm:px-6 @lg:px-8">
        <div className="flex flex-col items-center gap-8 text-center">
          <SectionHeader
            align="center"
            eyebrowFallback="Results"
            headingAs="h1"
            size="hero"
            className="max-w-none"
          />
          <SectionButtons />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 border-t border-[color-mix(in_srgb,var(--color-body-text)_12%,transparent)] pt-12 @sm:grid-cols-3">
          {stats.map((stat, index) => {
            const applyItemPatchForIndex = (partial: Record<string, unknown>) => {
              updateField("stats", applyItemPatch(stats, index, partial));
            };

            return (
              <SectionDataProvider
                key={`stat-${index}`}
                data={stat as unknown as Record<string, unknown>}
                updateField={(key, value) => applyItemPatchForIndex({ [key]: value })}
                updateFields={applyItemPatchForIndex}
              >
                <div className="hero-stat group relative">
                  {isEditing ? (
                    <EditorRemoveButton
                      label="Remove stat"
                      onClick={() =>
                        updateField(
                          "stats",
                          stats.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    />
                  ) : null}
                  <EditableText
                    as="p"
                    dataKey="value"
                    maxLength={12}
                    className="text-4xl font-bold tracking-tight @md:text-5xl"
                    themeTextRole="title"
                  />
                  <EditableText
                    as="p"
                    dataKey="label"
                    maxLength={40}
                    className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] opacity-75"
                    themeTextRole="body"
                  />
                </div>
              </SectionDataProvider>
            );
          })}
        </div>

        {isEditing && stats.length < 4 ? (
          <button
            type="button"
            className="button-item-add mx-auto mt-8 block"
            onClick={() =>
              updateField("stats", [
                ...stats,
                { value: "99%", label: "New metric" },
              ])
            }
          >
            + Add stat
          </button>
        ) : null}
      </div>
    </SectionShell>
  );
}
