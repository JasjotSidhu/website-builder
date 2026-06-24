"use client";

import { Settings } from "lucide-react";
import { useState } from "react";
import type { LinkValue } from "@/lib/types";
import { defaultLink, resolveLink } from "@/lib/links";
import Tooltip from "./Tooltip";
import { useEditMode } from "./EditModeContext";
import { useSectionData } from "./SectionDataContext";
import { useSitePages } from "./SiteContext";
import LinkEditorPopover from "./LinkEditorPopover";

interface EditableLinkProps {
  dataKey: string;
  children: React.ReactNode;
  className?: string;
}

export default function EditableLink({
  dataKey,
  children,
  className,
}: EditableLinkProps) {
  const { isEditing } = useEditMode();
  const pages = useSitePages();
  const { data, updateField } = useSectionData();
  const link = (data[dataKey] as LinkValue | undefined) ?? defaultLink;
  const [open, setOpen] = useState(false);

  if (!isEditing) {
    const href = resolveLink(link, pages);
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <span className={`editable-link ${className ?? ""}`.trim()}>
      {children}
      <Tooltip label="Edit link" side="top">
        <button
          type="button"
          className="editable-link-configure"
          aria-label="Edit link"
          onClick={() => setOpen(true)}
        >
          <Settings size={10} strokeWidth={2} aria-hidden />
        </button>
      </Tooltip>
      {open ? (
        <LinkEditorPopover
          value={link}
          pages={pages}
          onSave={(value) => {
            updateField(dataKey, value);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      ) : null}
    </span>
  );
}

export function EditableLinkAnchor({
  dataKey,
  children,
  className,
}: EditableLinkProps) {
  return (
    <EditableLink dataKey={dataKey} className={className}>
      {children}
    </EditableLink>
  );
}
