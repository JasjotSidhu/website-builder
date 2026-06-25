"use client";

import { useEffect, useRef, useState } from "react";
import type { LinkValue } from "@/lib/types";
import ButtonSettingsFields from "./ButtonSettingsFields";
import type { SitePageSummary } from "./SiteContext";
import { PopoverActions, PopoverShell } from "./PopoverShell";

import type { ButtonToolbarVariant } from "./button-toolbar-settings";

interface ButtonEditorPopoverProps {
  variant: ButtonToolbarVariant;
  link: LinkValue;
  pages: SitePageSummary[];
  onSave: (value: {
    variant: ButtonToolbarVariant;
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
  const [currentLink, setCurrentLink] = useState(link);

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
      title="Button"
      variant="editor"
      compact
      onClose={onCancel}
      footer={
        <PopoverActions
          onCancel={onCancel}
          onSave={() =>
            onSave({
              variant: buttonVariant,
              link: currentLink,
            })
          }
        />
      }
    >
      <ButtonSettingsFields
        variant={buttonVariant}
        link={currentLink}
        pages={pages}
        onVariantChange={setButtonVariant}
        onLinkChange={setCurrentLink}
      />
    </PopoverShell>
  );
}
