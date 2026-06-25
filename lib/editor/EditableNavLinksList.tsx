"use client";

import EditorRemoveButton from "@/lib/editor/EditorRemoveButton";
import EditableNavLink from "@/lib/editor/EditableNavLink";
import { useEditMode } from "@/lib/editor/EditModeContext";
import {
  SectionDataProvider,
  useSectionData,
} from "@/lib/editor/SectionDataContext";
import { useSitePages } from "@/lib/editor/SiteContext";
import type { LinkValue } from "@/lib/types";

interface NavLinkItem {
  label: string;
  link: LinkValue;
}

interface EditableNavLinksListProps {
  dataKey?: string;
  className?: string;
  itemClassName?: string;
  layout?: "row" | "column";
  maxLinks?: number;
  onNavigate?: () => void;
}

export default function EditableNavLinksList({
  dataKey = "links",
  className = "",
  itemClassName = "",
  layout = "row",
  maxLinks = 8,
  onNavigate,
}: EditableNavLinksListProps) {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const pages = useSitePages();
  const links = (data[dataKey] as NavLinkItem[] | undefined) ?? [];

  const defaultPageId = pages[0]?.id ?? "home";

  const updateLink = (index: number, patch: Partial<NavLinkItem>) => {
    const next = [...links];
    next[index] = { ...next[index], ...patch };
    updateField(dataKey, next);
  };

  const removeLink = (index: number) => {
    updateField(
      dataKey,
      links.filter((_, itemIndex) => index !== itemIndex),
    );
  };

  const addLink = () => {
    if (links.length >= maxLinks) {
      return;
    }

    updateField(dataKey, [
      ...links,
      {
        label: "New link",
        link: { type: "page", pageId: defaultPageId },
      },
    ]);
  };

  const containerClass =
    layout === "row"
      ? `flex flex-wrap items-center gap-8 ${className}`
      : `flex flex-col gap-4 ${className}`;

  return (
    <div className={containerClass}>
      {links.map((link, index) => (
        <div key={`nav-link-${index}`} className="nav-link-item">
          {isEditing ? (
            <EditorRemoveButton
              label="Remove link"
              compact
              onClick={() => removeLink(index)}
            />
          ) : null}
          <SectionDataProvider
            data={link as unknown as Record<string, unknown>}
            updateField={(key, value) => updateLink(index, { [key]: value })}
            updateFields={(partial) => updateLink(index, partial)}
          >
            <EditableNavLink className={itemClassName} onNavigate={onNavigate} />
          </SectionDataProvider>
        </div>
      ))}
      {isEditing && links.length < maxLinks ? (
        <button type="button" className="button-item-add nav-link-add" onClick={addLink}>
          + Add link
        </button>
      ) : null}
    </div>
  );
}
