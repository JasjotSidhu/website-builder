"use client";

import { useState } from "react";
import { useEditMode } from "@/lib/editor/EditModeContext";
import EditableText from "@/lib/editor/EditableText";
import ButtonEditorPopover from "@/lib/editor/ButtonEditorPopover";
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
  return variant === "secondary"
    ? "inline-block rounded-[var(--radius)] border border-[var(--color-primary)] px-6 py-3 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
    : "inline-block rounded-[var(--radius)] bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90";
}

export function SectionHeading({ align = "center" }: { align?: "center" | "left" }) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <div className={`flex flex-col gap-4 ${alignClass}`}>
      <h1
        className={`max-w-3xl text-4xl font-bold leading-tight text-[var(--color-text)] md:text-5xl ${align === "center" ? "text-center" : "text-left"}`}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <EditableText as="span" dataKey="heading" maxLength={120} />
      </h1>
      <p
        className={`max-w-xl text-lg text-[var(--color-text)] opacity-85 ${align === "center" ? "text-center" : "text-left"}`}
      >
        <EditableText as="span" dataKey="subheading" maxLength={300} required={false} />
      </p>
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
  const [open, setOpen] = useState(false);

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
      <button
        type="button"
        className="button-item-remove"
        aria-label="Remove button"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
      >
        ✕
      </button>
      <button
        type="button"
        className={`${buttonClassName(button.variant)} button-item-trigger`}
        onClick={() => setOpen(true)}
      >
        <span
          className="button-item-label"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <EditableText as="span" dataKey="label" maxLength={40} />
        </span>
      </button>
      {open ? (
        <ButtonEditorPopover
          variant={button.variant ?? "primary"}
          link={button.link}
          pages={pages}
          onSave={({ variant, link }) => {
            onUpdate({ variant, link });
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      ) : null}
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
