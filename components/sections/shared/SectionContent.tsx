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
import type { LinkValue } from "@/lib/types";

const MAX_BUTTONS = 6;

interface ButtonItem {
  label: string;
  link: LinkValue;
  variant?: "primary" | "secondary";
}

function buttonClassName(variant: ButtonItem["variant"]) {
  return variant === "secondary" ? "hero-button hero-button--secondary" : "hero-button hero-button--primary";
}

export function SectionHeading({ align = "center" }: { align?: "center" | "left" }) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <div className={`flex flex-col gap-4 ${alignClass}`}>
      <EditableText
        as="h1"
        dataKey="heading"
        maxLength={120}
        className={`max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl ${align === "center" ? "text-center" : "text-left"}`}
      />
      <EditableText
        as="p"
        dataKey="subheading"
        maxLength={300}
        required={false}
        className={`max-w-xl text-lg leading-relaxed opacity-90 ${align === "center" ? "text-center" : "text-left"}`}
      />
    </div>
  );
}

function HeroButtonItem({
  button,
  onUpdate,
  onRemove,
}: {
  button: ButtonItem;
  onUpdate: (patch: Partial<ButtonItem>) => void;
  onRemove: () => void;
}) {
  const { isEditing } = useEditMode();
  const pages = useSitePages();
  const triggerRef = useRef<HTMLDivElement>(null);

  if (!isEditing) {
    const href = resolveLink(button.link, pages);
    return (
      <a href={href} className={buttonClassName(button.variant)}>
        {button.label}
      </a>
    );
  }

  return (
    <div className="button-item-wrapper">
      <EditorRemoveButton label="Remove button" compact onClick={onRemove} />
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
            onVariantChange: (variant) => onUpdate({ variant }),
            onLinkChange: (link) => onUpdate({ link }),
          }}
        />
      </div>
    </div>
  );
}

export function SectionButtons({ align = "center" }: { align?: "center" | "left" }) {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const buttons = (data.buttons as ButtonItem[] | undefined) ?? [];

  const updateButton = (index: number, patch: Partial<ButtonItem>) => {
    const next = [...buttons];
    next[index] = { ...next[index], ...patch };
    updateField("buttons", next);
  };

  const removeButton = (index: number) => {
    updateField(
      "buttons",
      buttons.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const addButton = () => {
    if (buttons.length >= MAX_BUTTONS) {
      return;
    }

    updateField("buttons", [
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
      className={`flex flex-wrap gap-4 ${align === "left" ? "justify-start" : "justify-center"}`}
    >
      {buttons.map((button, index) => (
        <SectionDataProvider
          key={`button-${index}`}
          data={button as unknown as Record<string, unknown>}
          updateField={(key, value) => updateButton(index, { [key]: value })}
          updateFields={(partial) => updateButton(index, partial)}
        >
          <HeroButtonItem
            button={button}
            onUpdate={(patch) => updateButton(index, patch)}
            onRemove={() => removeButton(index)}
          />
        </SectionDataProvider>
      ))}
      {isEditing && buttons.length < MAX_BUTTONS ? (
        <button type="button" className="button-item-add" onClick={addButton}>
          + Add button
        </button>
      ) : null}
    </div>
  );
}
