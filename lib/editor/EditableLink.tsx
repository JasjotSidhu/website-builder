"use client";

import { useEffect, useRef, useState } from "react";
import type { LinkValue } from "@/lib/types";
import { defaultLink } from "@/lib/links";
import { useEditMode } from "./EditModeContext";
import { useSectionData } from "./SectionDataContext";
import { useSitePages } from "./SiteContext";
import LinkEditorPopover from "./LinkEditorPopover";
import { resolveLink } from "@/lib/links";

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
    <span className={`editable-link ${className ?? ""}`.trim()} role="presentation">
      <button type="button" className="editable-link-trigger" onClick={() => setOpen(true)}>
        {children}
      </button>
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
