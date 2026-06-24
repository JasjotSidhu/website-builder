export const TAG_OPTIONS = [
  { value: "h1", label: "H1" },
  { value: "h2", label: "H2" },
  { value: "h3", label: "H3" },
  { value: "h4", label: "H4" },
  { value: "p", label: "P" },
  { value: "span", label: "Span" },
] as const;

export const FONT_OPTIONS = [
  { value: "", label: "Inherited" },
  { value: "var(--font-heading)", label: "Heading font" },
  { value: "var(--font-body)", label: "Body font" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "'Helvetica Neue', Helvetica, sans-serif", label: "Helvetica" },
  { value: "'Courier New', monospace", label: "Monospace" },
] as const;

export const HIGHLIGHT_FONT_OPTIONS = FONT_OPTIONS.filter((option) => option.value !== "");

export function getFontOptionLabel(value?: string) {
  if (!value) {
    return "Inherited";
  }
  return FONT_OPTIONS.find((option) => option.value === value)?.label ?? "Custom";
}

export function getHighlightFontOptionLabel(value?: string) {
  if (!value) {
    return "Select font";
  }
  return HIGHLIGHT_FONT_OPTIONS.find((option) => option.value === value)?.label ?? "Custom";
}
