"use client";

import { resolveColorForPicker, rgbToHex } from "@/lib/color-utils";

interface ColorSwatchInputProps {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  fallback?: string;
}

export default function ColorSwatchInput({
  value,
  onChange,
  title,
  fallback = "#000000",
}: ColorSwatchInputProps) {
  const safeValue = resolveColorForPicker(value, fallback);
  const displayColor =
    value && !value.startsWith("var(")
      ? value.startsWith("rgb")
        ? rgbToHex(value) ?? safeValue
        : value
      : safeValue;

  return (
    <label className="popover-color-swatch-btn" title={title}>
      <input
        type="color"
        className="popover-color-swatch-input"
        value={safeValue}
        onChange={(event) => onChange(event.target.value)}
      />
      <span
        className="popover-color-swatch"
        style={{ background: displayColor }}
        aria-hidden
      />
    </label>
  );
}
