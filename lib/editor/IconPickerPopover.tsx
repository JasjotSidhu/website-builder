"use client";

import { useEffect, useRef } from "react";
import { FeatureIcon } from "@/components/sections/features/FeatureIcon";
import {
  FEATURE_ICON_IDS,
  FEATURE_ICON_LABELS,
  type FeatureIconId,
} from "@/lib/feature-icons";
import { buildThemeCssVariables } from "@/lib/theme-utils";
import { useSiteTheme } from "@/lib/editor/ThemeContext";
import FloatingPopover from "./FloatingPopover";
import { PopoverShell } from "./PopoverShell";

interface IconPickerPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  value: string;
  onSelect: (iconId: FeatureIconId) => void;
  onClose: () => void;
}

export default function IconPickerPopover({
  anchorEl,
  open,
  value,
  onSelect,
  onClose,
}: IconPickerPopoverProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const theme = useSiteTheme();
  const themeStyle = buildThemeCssVariables(theme, { embed: true });

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (shellRef.current?.contains(target)) {
        return;
      }
      if (anchorEl?.contains(target)) {
        return;
      }
      if ((target as Element).closest?.("[data-icon-picker-popover]")) {
        return;
      }
      onClose();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onClose, anchorEl]);

  return (
    <FloatingPopover
      anchorEl={anchorEl}
      open={open}
      className="icon-picker-popover"
      placement="below"
      align="start"
      dataAttribute="data-icon-picker-popover"
    >
      <PopoverShell
        ref={shellRef}
        title="Choose icon"
        variant="editor"
        compact
        onClose={onClose}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div
          className="icon-picker-theme-root site-theme-root"
          style={themeStyle}
        >
          <div className="icon-picker-grid" role="listbox" aria-label="Icons">
            {FEATURE_ICON_IDS.map((iconId) => {
              const isSelected = value === iconId;

              return (
                <button
                  key={iconId}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  aria-label={FEATURE_ICON_LABELS[iconId]}
                  className={`icon-picker-option${isSelected ? " icon-picker-option--active" : ""}`}
                  onClick={() => {
                    onSelect(iconId);
                    onClose();
                  }}
                >
                  <span className="icon-picker-option__icon">
                    <FeatureIcon name={iconId} size={20} />
                  </span>
                  <span className="icon-picker-option__label">{FEATURE_ICON_LABELS[iconId]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </PopoverShell>
    </FloatingPopover>
  );
}
