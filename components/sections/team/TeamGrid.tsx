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
import { useSectionSettings } from "@/lib/traits/context";
import { SectionHeader } from "../shared/SectionHeader";
import { SectionShell } from "../shared/SectionShell";

export { teamGridSchema } from "./schema";
export type { TeamGridProps } from "./schema";

interface TeamMemberItem {
  id?: string;
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
}

const GRID_COLS_CLASSES: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 @sm:grid-cols-2",
  3: "grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3",
  4: "grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4",
};

const GAP_CLASSES: Record<string, string> = {
  sm: "gap-4",
  md: "gap-4 @md:gap-6",
  lg: "gap-4 @md:gap-6 @lg:gap-10",
};

export default function TeamGrid() {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const settings = useSectionSettings();
  const members = (data.members as TeamMemberItem[] | undefined) ?? [];
  const columns = Number(settings.columns ?? 3);
  const colsClass = GRID_COLS_CLASSES[columns] ?? GRID_COLS_CLASSES[3];
  const gapClass = GAP_CLASSES[String(settings.gap ?? "md")] ?? GAP_CLASSES.md;

  return (
    <SectionShell>
      <div className="mx-auto max-w-7xl px-4 @sm:px-6 @lg:px-8">
        <div className="mb-10 flex justify-center @sm:mb-14">
          <SectionHeader align="center" eyebrowFallback="Team" />
        </div>

        {isEditing && members.length === 0 ? (
          <p className="list-section-empty">No team members yet — add one below</p>
        ) : null}

        <div className={`grid ${colsClass} ${gapClass}`}>
          {members.map((item, index) => {
            const applyItemPatchForIndex = (partial: Record<string, unknown>) => {
              updateField("members", applyItemPatch(members, index, partial));
            };

            return (
              <SectionDataProvider
                key={item.id ?? `team-${index}`}
                data={item as unknown as Record<string, unknown>}
                updateField={(key, value) => applyItemPatchForIndex({ [key]: value })}
                updateFields={applyItemPatchForIndex}
              >
                <article className="team-card group relative flex h-full flex-col text-center">
                  {isEditing ? (
                    <EditorRemoveButton
                      label="Remove team member"
                      onClick={() =>
                        updateField(
                          "members",
                          members.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    />
                  ) : null}
                  <EditableImage
                    dataKey="avatar"
                    showTooltip={false}
                    renderChildren={(image, uploadBtn) => (
                      <ImageEditSurface
                        uploadBtn={uploadBtn}
                        overlay
                        className="team-avatar-surface mx-auto h-24 w-24 rounded-full"
                      >
                        {image ? (
                          <RenderDivImage
                            image={image}
                            altText=""
                            className="h-full w-full rounded-full object-cover ring-4 ring-white shadow-md"
                          />
                        ) : (
                          <div className="avatar-initials avatar-initials--lg shadow-md ring-4 ring-white">
                            {(item.name ?? "?")[0]}
                          </div>
                        )}
                      </ImageEditSurface>
                    )}
                  />
                  <h3 className="mt-5 text-lg font-semibold">
                    <EditableText as="span" dataKey="name" maxLength={40} themeTextRole="cardTitle" />
                  </h3>
                  <p className="mt-1 text-sm font-medium opacity-70">
                    <EditableText as="span" dataKey="role" maxLength={60} themeTextRole="card" />
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed opacity-75">
                    <EditableText as="span" dataKey="bio" maxLength={200} themeTextRole="card" />
                  </p>
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
              updateField("members", [
                ...members,
                { name: "Name", role: "Role", bio: "Short bio" },
              ])
            }
          >
            + Add member
          </button>
        ) : null}
      </div>
    </SectionShell>
  );
}
