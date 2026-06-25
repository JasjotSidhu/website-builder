"use client";

import { useRef } from "react";
import EditorRemoveButton from "@/lib/editor/EditorRemoveButton";
import { useEditMode } from "@/lib/editor/EditModeContext";
import EditableText from "@/lib/editor/EditableText";
import {
  SectionDataProvider,
  useSectionData,
} from "@/lib/editor/SectionDataContext";
import { useSitePages } from "@/lib/editor/SiteContext";
import { resolveLink } from "@/lib/links";
import type { ButtonVariant, LinkValue } from "@/lib/types";
import { SectionHeader } from "./SectionHeader";

const DEFAULT_MAX_BUTTONS = 6;

import { getSiteButtonClassName } from "@/lib/button-styles";

interface ButtonItem {
  label: string;
  link: LinkValue;
  variant?: ButtonVariant;
}

function buttonClassName(variant: ButtonItem["variant"]) {
  return getSiteButtonClassName(variant);
}

function SectionButtonItem({
  button,
  onUpdate,
  onRemove,
  appearance,
  showVariant,
  showRemove,
  onNavigate,
}: {
  button: ButtonItem;
  onUpdate: (patch: Partial<ButtonItem>) => void;
  onRemove: () => void;
  appearance: "hero" | "cta" | "header";
  showVariant: boolean;
  showRemove: boolean;
  onNavigate?: () => void;
}) {
  const { isEditing } = useEditMode();
  const pages = useSitePages();
  const triggerRef = useRef<HTMLDivElement>(null);

  if (!isEditing) {
    const href = resolveLink(button.link, pages);
    return (
      <a href={href} className={buttonClassName(button.variant)} onClick={onNavigate}>
        {button.label}
      </a>
    );
  }

  return (
    <div className="button-item-wrapper">
      {showRemove ? (
        <EditorRemoveButton label="Remove button" compact onClick={onRemove} />
      ) : null}
      <div ref={triggerRef} className={`${buttonClassName(button.variant)} button-item-trigger`}>
        <EditableText
          as="span"
          dataKey="label"
          maxLength={40}
          inheritSectionColor={false}
          colorSourceRef={triggerRef}
          toolbarAnchorRef={triggerRef}
          buttonSettings={{
            variant: button.variant ?? "primary",
            link: button.link,
            pages,
            showVariant,
            onVariantChange: (variant) => onUpdate({ variant }),
            onLinkChange: (link) => onUpdate({ link }),
          }}
        />
      </div>
    </div>
  );
}

export function EditableButton({
  appearance = "hero",
  showVariant = true,
  onNavigate,
}: {
  appearance?: "hero" | "cta" | "header";
  showVariant?: boolean;
  onNavigate?: () => void;
}) {
  const { data, updateFields } = useSectionData();
  const button: ButtonItem = {
    label: String(data.label ?? ""),
    link: (data.link as LinkValue | undefined) ?? { type: "page", pageId: "home" },
    variant: (data.variant as ButtonItem["variant"]) ?? "primary",
  };

  return (
    <SectionButtonItem
      button={button}
      onUpdate={(patch) => updateFields(patch)}
      onRemove={() => {}}
      appearance={appearance}
      showVariant={showVariant}
      showRemove={false}
      onNavigate={onNavigate}
    />
  );
}

export function SectionHeading({ align = "center" }: { align?: "center" | "left" }) {
  return (
    <SectionHeader
      align={align}
      headingAs="h1"
      size="hero"
      className={align === "center" ? "max-w-none" : ""}
    />
  );
}

export function SectionButtons({
  align = "center",
  appearance = "hero",
  maxButtons = DEFAULT_MAX_BUTTONS,
  showVariant = true,
  showAdd = true,
  showRemove = true,
  dataKey = "buttons",
  onNavigate,
}: {
  align?: "center" | "left";
  appearance?: "hero" | "cta" | "header";
  maxButtons?: number;
  showVariant?: boolean;
  showAdd?: boolean;
  showRemove?: boolean;
  dataKey?: string;
  onNavigate?: () => void;
}) {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const buttons = (data[dataKey] as ButtonItem[] | undefined) ?? [];

  const updateButton = (index: number, patch: Partial<ButtonItem>) => {
    const next = [...buttons];
    next[index] = { ...next[index], ...patch };
    updateField(dataKey, next);
  };

  const removeButton = (index: number) => {
    updateField(
      dataKey,
      buttons.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const addButton = () => {
    if (buttons.length >= maxButtons) {
      return;
    }

    updateField(dataKey, [
      ...buttons,
      {
        label: "New button",
        link: { type: "page", pageId: "home" },
        variant: "primary",
      },
    ]);
  };

  return (
    <div
      className={`flex flex-wrap gap-4 ${
        align === "left" ? "justify-start" : "justify-center"
      }`}
    >
      {buttons.map((button, index) => (
        <SectionDataProvider
          key={`button-${index}`}
          data={button as unknown as Record<string, unknown>}
          updateField={(key, value) => updateButton(index, { [key]: value })}
          updateFields={(partial) => updateButton(index, partial)}
        >
          <SectionButtonItem
            button={button}
            onUpdate={(patch) => updateButton(index, patch)}
            onRemove={() => removeButton(index)}
            appearance={appearance}
            showVariant={showVariant}
            showRemove={showRemove}
            onNavigate={onNavigate}
          />
        </SectionDataProvider>
      ))}
      {isEditing && showAdd && buttons.length < maxButtons ? (
        <button type="button" className="button-item-add" onClick={addButton}>
          + Add button
        </button>
      ) : null}
    </div>
  );
}
