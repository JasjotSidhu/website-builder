"use client";

import { useEffect, useRef, useState } from "react";
import { PopoverActions, PopoverField, PopoverShell } from "@/lib/editor/PopoverShell";
import { useCloseOnOutsideClick } from "@/lib/hooks/use-close-on-outside-click";

interface SaveSectionPopoverProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  defaultName?: string;
  onSave: (name: string) => void;
  onClose: () => void;
}

export default function SaveSectionPopover({
  anchorRef,
  defaultName = "",
  onSave,
  onClose,
}: SaveSectionPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(defaultName);

  useCloseOnOutsideClick(true, onClose, popoverRef, anchorRef);

  useEffect(() => {
    setName(defaultName);
  }, [defaultName]);

  return (
    <PopoverShell
      ref={popoverRef}
      title="Save section"
      variant="editor"
      onClose={onClose}
      onMouseDown={(event) => event.stopPropagation()}
      footer={
        <PopoverActions
          onCancel={onClose}
          onSave={() => onSave(name)}
          saveLabel="Save"
          saveDisabled={!name.trim()}
        />
      }
    >
      <PopoverField label="Section name" hint="Shown in the saved sections library.">
        <input
          type="text"
          className="popover-input"
          value={name}
          maxLength={80}
          placeholder="e.g. Pricing block"
          autoFocus
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && name.trim()) {
              onSave(name);
            }
          }}
        />
      </PopoverField>
    </PopoverShell>
  );
}
