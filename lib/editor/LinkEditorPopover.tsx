"use client";

import { useEffect, useRef, useState } from "react";
import type { LinkValue } from "@/lib/types";
import PopoverSegmented from "./PopoverSegmented";
import type { SitePageSummary } from "./SiteContext";
import { PopoverActions, PopoverField, PopoverShell } from "./PopoverShell";

interface LinkEditorPopoverProps {
  value: LinkValue;
  pages: SitePageSummary[];
  onSave: (value: LinkValue) => void;
  onCancel: () => void;
}

export default function LinkEditorPopover({
  value,
  pages,
  onSave,
  onCancel,
}: LinkEditorPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [navType, setNavType] = useState<"page" | "url">(value.type);
  const [pageId, setPageId] = useState(
    value.type === "page" ? value.pageId : pages[0]?.id ?? "",
  );
  const [href, setHref] = useState(value.type === "url" ? value.href : "");

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onCancel]);

  return (
    <PopoverShell
      ref={ref}
      title="Link"
      variant="editor"
      compact
      onClose={onCancel}
      footer={
        <PopoverActions
          onCancel={onCancel}
          onSave={() =>
            onSave(
              navType === "page"
                ? { type: "page", pageId }
                : { type: "url", href },
            )
          }
        />
      }
    >
      <PopoverSegmented
        label="Link type"
        value={navType}
        options={[
          { value: "page", label: "Page" },
          { value: "url", label: "URL" },
        ]}
        onChange={(value) => setNavType(value as "page" | "url")}
      />

      {navType === "page" ? (
        <PopoverField label="Page" inline>
          <select
            className="popover-input popover-input--inline-select"
            value={pageId}
            onChange={(event) => setPageId(event.target.value)}
          >
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title}
              </option>
            ))}
          </select>
        </PopoverField>
      ) : (
        <PopoverField label="URL">
          <input
            type="url"
            className="popover-input"
            value={href}
            onChange={(event) => setHref(event.target.value)}
            placeholder="https://..."
          />
        </PopoverField>
      )}
    </PopoverShell>
  );
}
