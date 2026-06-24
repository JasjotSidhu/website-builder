export function toColorInputValue(value: unknown, fallback = "#000000"): string {
  const color = String(value ?? fallback).trim();
  if (!color || color.startsWith("var(")) {
    return fallback;
  }

  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return color;
  }

  const short = color.match(/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/);
  if (short) {
    const [, r, g, b] = short;
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return fallback;
}

export function rgbToHex(color: string): string | null {
  const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!match) {
    return null;
  }

  const [, r, g, b] = match;
  return `#${[r, g, b]
    .map((channel) => Number(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function resolveColorForPicker(value: string | undefined, fallback: string): string {
  if (!value || value === "inherit") {
    return toColorInputValue(fallback, "#000000");
  }

  if (value.startsWith("rgb")) {
    return rgbToHex(value) ?? toColorInputValue(fallback, "#000000");
  }

  return toColorInputValue(value, fallback);
}
