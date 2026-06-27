"use client";

import type { LinkValue } from "@/lib/types";
import LinkSettingsFields from "./LinkSettingsFields";
import PopoverSegmented from "./PopoverSegmented";
import type { SitePageSummary } from "./SiteContext";

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

      <LinkSettingsFields link={link} pages={pages} onChange={onLinkChange} />
    </div>
  );
}
