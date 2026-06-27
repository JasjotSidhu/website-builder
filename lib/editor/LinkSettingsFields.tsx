"use client";

import type { LinkValue } from "@/lib/types";
import PopoverSegmented from "./PopoverSegmented";
import type { SitePageSummary } from "./SiteContext";
import { PopoverField } from "./PopoverShell";

export interface LinkSettingsFieldsProps {
  link: LinkValue;
  pages: SitePageSummary[];
  onChange: (link: LinkValue) => void;
  compact?: boolean;
}

export default function LinkSettingsFields({
  link,
  pages,
  onChange,
  compact = false,
}: LinkSettingsFieldsProps) {
  const navType = link.type;
  const pageId = link.type === "page" ? link.pageId : pages[0]?.id ?? "";
  const href = link.type === "url" ? link.href : "";
  const stackClass = compact ? "header-settings__field-stack" : "popover-toolbar-stack";

  return (
    <div className={stackClass}>
      <PopoverSegmented
        label="Link type"
        layout={compact ? "inline" : "stacked"}
        value={navType}
        options={[
          { value: "page", label: "Page" },
          { value: "url", label: "URL" },
        ]}
        onChange={(value) => {
          if (value === "page") {
            onChange({ type: "page", pageId: pages[0]?.id ?? "home" });
            return;
          }
          onChange({ type: "url", href: "" });
        }}
      />

      {navType === "page" ? (
        <PopoverField label="Page" inline={compact}>
          <select
            className={compact ? "header-settings__select" : "popover-input popover-input--inline-select"}
            value={pageId}
            onChange={(event) => onChange({ type: "page", pageId: event.target.value })}
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
            className={compact ? "header-settings__input" : "popover-input"}
            value={href}
            onChange={(event) => onChange({ type: "url", href: event.target.value })}
            placeholder="https://..."
          />
        </PopoverField>
      )}
    </div>
  );
}
