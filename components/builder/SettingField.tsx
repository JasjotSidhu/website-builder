"use client";

import { useState } from "react";
import ColorSwatchInput from "@/lib/editor/ColorSwatchInput";
import ImageUrlPopover from "@/lib/editor/ImageUrlPopover";
import PopoverSegmented from "@/lib/editor/PopoverSegmented";
import PopoverSwitch from "@/lib/editor/PopoverSwitch";
import { toColorInputValue } from "@/lib/color-utils";
import type { TraitFieldConfig } from "@/lib/traits/types";

interface SettingFieldProps {
  field: TraitFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

function getSegmentedOptions(field: TraitFieldConfig & { type: "select" }) {
  if (field.options.length > 4) {
    return null;
  }

  const shortLabels = field.options.map((option) => ({
    value: option.value,
    label:
      option.label.length <= 6
        ? option.label
        : option.value.toUpperCase().slice(0, 3),
  }));

  return shortLabels;
}

export function SettingField({ field, value, onChange }: SettingFieldProps) {
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [imageAnchorEl, setImageAnchorEl] = useState<HTMLElement | null>(null);

  if (field.type === "number") {
    return (
      <label className="popover-field popover-field--inline">
        <span className="popover-field__label">{field.label}</span>
        <input
          type="number"
          className="popover-input popover-input--num"
          min={field.min}
          max={field.max}
          step={field.step}
          value={Number(value ?? field.min ?? 0)}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </label>
    );
  }

  if (field.type === "select") {
    const segmentedOptions = getSegmentedOptions(field);
    if (segmentedOptions) {
      return (
        <PopoverSegmented
          label={field.label}
          value={String(value ?? field.options[0]?.value ?? "")}
          options={segmentedOptions}
          onChange={onChange}
        />
      );
    }

    return (
      <label className="popover-field popover-field--inline">
        <span className="popover-field__label">{field.label}</span>
        <select
          className="popover-input popover-input--inline-select"
          value={String(value ?? field.options[0]?.value ?? "")}
          onChange={(event) => onChange(event.target.value)}
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "color") {
    return (
      <div className="popover-field popover-field--inline">
        <span className="popover-field__label">{field.label}</span>
        <ColorSwatchInput value={toColorInputValue(value)} onChange={onChange} />
      </div>
    );
  }

  if (field.type === "toggle") {
    return (
      <PopoverSwitch
        label={field.label}
        checked={Boolean(value)}
        onChange={onChange}
      />
    );
  }

  if (field.type === "image") {
    const imageUrl = String(value ?? "");

    return (
      <div className="popover-field popover-field--stacked">
        <span className="popover-field__label">{field.label}</span>
        <div className="popover-image-field popover-image-field--compact">
          {imageUrl ? (
            <div
              className="popover-image-preview popover-image-preview--xs"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          ) : (
            <div className="popover-image-preview popover-image-preview--xs popover-image-preview--empty">
              No image
            </div>
          )}
          <div className="popover-image-actions">
            <button
              ref={setImageAnchorEl}
              type="button"
              className="popover-btn popover-btn--xs"
              onClick={() => setImagePopoverOpen(true)}
            >
              {imageUrl ? "Change" : "Add"}
            </button>
            {imageUrl ? (
              <button
                type="button"
                className="popover-btn popover-btn--ghost popover-btn--xs"
                onClick={() => onChange("")}
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
        {imagePopoverOpen ? (
          <ImageUrlPopover
            anchorEl={imageAnchorEl}
            value={imageUrl}
            showSeoFields={false}
            onSave={(url) => {
              onChange(url);
              setImagePopoverOpen(false);
            }}
            onCancel={() => setImagePopoverOpen(false)}
          />
        ) : null}
      </div>
    );
  }

  return (
    <label className="popover-field popover-field--stacked">
      <span className="popover-field__label">
        {field.label}{" "}
        <span className="popover-field__value">{Number(value ?? field.min).toFixed(2)}</span>
      </span>
      <input
        type="range"
        className="popover-range"
        min={field.min}
        max={field.max}
        step={field.step}
        value={Number(value ?? field.min)}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
