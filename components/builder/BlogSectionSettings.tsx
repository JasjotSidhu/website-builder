"use client";

import type { BlogDisplayMode } from "@/lib/blog/posts";
import { PopoverField } from "@/lib/editor/PopoverShell";
import { useBuilderStore } from "@/store/builderStore";

export default function BlogSectionSettings({
  sectionId,
  sectionProps,
}: {
  sectionId: string;
  sectionProps: Record<string, unknown>;
}) {
  const patchSectionProps = useBuilderStore((state) => state.patchSectionProps);

  const displayMode = (sectionProps.displayMode as BlogDisplayMode | undefined) ?? "limit";
  const postLimit = Number(sectionProps.postLimit ?? 3);

  return (
    <section className="popover__section">
      <PopoverField
        label="Posts to show"
        hint={
          displayMode === "featured"
            ? "Mark posts as featured from the Blog page in your site dashboard."
            : "Blog content is managed from the Blog page in your site dashboard."
        }
      >
        <select
          className="popover-input"
          value={displayMode}
          onChange={(event) =>
            patchSectionProps(sectionId, {
              displayMode: event.target.value as BlogDisplayMode,
            })
          }
        >
          <option value="featured">Featured posts</option>
          <option value="limit">Limited list</option>
          <option value="all">All posts</option>
        </select>
      </PopoverField>

      {displayMode === "limit" ? (
        <PopoverField label="Number of posts">
          <input
            type="number"
            min={1}
            max={24}
            className="popover-input"
            value={postLimit}
            onChange={(event) =>
              patchSectionProps(sectionId, {
                postLimit: Math.max(1, Number(event.target.value) || 3),
              })
            }
          />
        </PopoverField>
      ) : null}
    </section>
  );
}
