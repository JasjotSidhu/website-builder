"use client";

import { useEffect, useRef, useState } from "react";
import type { LinkValue } from "@/lib/types";
import type { SitePageSummary } from "./SiteContext";

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
    <div ref={ref} className="editor-popover" role="dialog" aria-label="Edit link">
      <label className="editor-popover-label">
        On click navigate to
        <select
          className="editor-popover-input"
          value={navType}
          onChange={(event) => setNavType(event.target.value as "page" | "url")}
        >
          <option value="page">Another page</option>
          <option value="url">External URL</option>
        </select>
      </label>

      {navType === "page" ? (
        <label className="editor-popover-label">
          Select page
          <select
            className="editor-popover-input"
            value={pageId}
            onChange={(event) => setPageId(event.target.value)}
          >
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="editor-popover-label">
          URL
          <input
            type="url"
            className="editor-popover-input"
            value={href}
            onChange={(event) => setHref(event.target.value)}
            placeholder="https://..."
          />
        </label>
      )}

      <div className="editor-popover-actions">
        <button type="button" className="editor-popover-btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="editor-popover-btn editor-popover-btn--primary"
          onClick={() =>
            onSave(
              navType === "page"
                ? { type: "page", pageId }
                : { type: "url", href },
            )
          }
        >
          Save
        </button>
      </div>
    </div>
  );
}
