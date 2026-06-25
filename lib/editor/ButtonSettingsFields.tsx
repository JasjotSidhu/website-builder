"use client";

import type { LinkValue } from "@/lib/types";
import PopoverSegmented from "./PopoverSegmented";
import type { SitePageSummary } from "./SiteContext";
import { PopoverField } from "./PopoverShell";

import type { ButtonToolbarVariant } from "./button-toolbar-settings";

export interface ButtonSettingsFieldsProps {
  variant: ButtonToolbarVariant;
  link: LinkValue;
  pages: SitePageSummary[];
  onVariantChange: (variant: ButtonToolbarVariant) => void;
  onLinkChange: (link: LinkValue) => void;
  showVariant?: boolean;
}

export default function ButtonSettingsFields({
  variant,
  link,
  pages,
  onVariantChange,
  onLinkChange,
  showVariant = true,
}: ButtonSettingsFieldsProps) {
  const navType = link.type;
  const pageId = link.type === "page" ? link.pageId : pages[0]?.id ?? "";
  const href = link.type === "url" ? link.href : "";

  return (
    <div className="popover-toolbar-stack">
      {showVariant !== false ? (
        <PopoverSegmented
          label="Style"
          layout="stacked"
          value={variant}
          options={[
            { value: "primary", label: "Primary" },
            { value: "secondary", label: "Secondary" },
            { value: "outline", label: "Outline" },
            { value: "light", label: "Light" },
          ]}
          onChange={(value) => onVariantChange(value as ButtonToolbarVariant)}
        />
      ) : null}

      <PopoverSegmented
        label="Link type"
        value={navType}
        options={[
          { value: "page", label: "Page" },
          { value: "url", label: "URL" },
        ]}
        onChange={(value) => {
          if (value === "page") {
            onLinkChange({ type: "page", pageId: pages[0]?.id ?? "home" });
            return;
          }
          onLinkChange({ type: "url", href: "" });
        }}
      />

      {navType === "page" ? (
        <PopoverField label="Page" inline>
          <select
            className="popover-input popover-input--inline-select"
            value={pageId}
            onChange={(event) =>
              onLinkChange({ type: "page", pageId: event.target.value })
            }
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
            onChange={(event) => onLinkChange({ type: "url", href: event.target.value })}
            placeholder="https://..."
          />
        </PopoverField>
      )}
    </div>
  );
}
