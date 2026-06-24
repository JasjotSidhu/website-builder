"use client";

import { useEffect, useRef, useState } from "react";
import type { LinkValue } from "@/lib/types";
import type { SitePageSummary } from "./SiteContext";

interface ButtonEditorPopoverProps {
  variant: "primary" | "secondary";
  link: LinkValue;
  pages: SitePageSummary[];
  onSave: (value: {
    variant: "primary" | "secondary";
    link: LinkValue;
  }) => void;
  onCancel: () => void;
}

export default function ButtonEditorPopover({
  variant,
  link,
  pages,
  onSave,
  onCancel,
}: ButtonEditorPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [buttonVariant, setButtonVariant] = useState(variant);
  const [navType, setNavType] = useState<"page" | "url">(link.type);
  const [pageId, setPageId] = useState(
    link.type === "page" ? link.pageId : pages[0]?.id ?? "",
  );
  const [href, setHref] = useState(link.type === "url" ? link.href : "");

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
    <div ref={ref} className="editor-popover" role="dialog" aria-label="Edit button">
      <label className="editor-popover-label">
        Button type
        <select
          className="editor-popover-input"
          value={buttonVariant}
          onChange={(event) =>
            setButtonVariant(event.target.value as "primary" | "secondary")
          }
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
        </select>
      </label>

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
            onSave({
              variant: buttonVariant,
              link:
                navType === "page"
                  ? { type: "page", pageId }
                  : { type: "url", href },
            })
          }
        >
          Save
        </button>
      </div>
    </div>
  );
}
