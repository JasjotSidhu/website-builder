import type { TraitCategory, TraitDefinition } from "./types";

export const traitCategoryTabs: { id: TraitCategory; label: string }[] = [
  { id: "layout", label: "Design" },
  { id: "background", label: "Background" },
  { id: "typography", label: "Colors" },
];

export const traitRegistry: Record<string, TraitDefinition> = {
  grid: {
    id: "grid",
    label: "Grid",
    category: "layout",
    fields: [
      { key: "columns", label: "Columns", type: "number", min: 1, max: 6, step: 1 },
      {
        key: "gap",
        label: "Gap",
        type: "select",
        options: [
          { value: "sm", label: "S" },
          { value: "md", label: "M" },
          { value: "lg", label: "L" },
        ],
      },
    ],
    defaultValues: { columns: 3, gap: "md" },
  },
  background: {
    id: "background",
    label: "Background",
    category: "background",
    fields: [
      {
        key: "type",
        label: "Background type",
        type: "select",
        options: [
          { value: "solid", label: "Solid" },
          { value: "gradient", label: "Gradient" },
          { value: "image", label: "Image" },
        ],
      },
      {
        key: "color",
        label: "Color",
        type: "color",
        showIf: { key: "type", equals: "solid" },
      },
      {
        key: "gradientFrom",
        label: "Gradient start",
        type: "color",
        showIf: { key: "type", equals: "gradient" },
      },
      {
        key: "gradientTo",
        label: "Gradient end",
        type: "color",
        showIf: { key: "type", equals: "gradient" },
      },
      {
        key: "gradientAngle",
        label: "Gradient angle",
        type: "number",
        min: 0,
        max: 360,
        step: 5,
        showIf: { key: "type", equals: "gradient" },
      },
      {
        key: "image",
        label: "Background image",
        type: "image",
        showIf: { key: "type", equals: "image" },
      },
      {
        key: "overlayColor",
        label: "Overlay color",
        type: "color",
        showIf: { key: "type", equals: "image" },
      },
      {
        key: "overlayOpacity",
        label: "Overlay opacity",
        type: "slider",
        min: 0,
        max: 1,
        step: 0.05,
        showIf: { key: "type", equals: "image" },
      },
    ],
    defaultValues: {
      type: "solid",
      color: "#ffffff",
      gradientFrom: "#ffffff",
      gradientTo: "#f0f0f0",
      gradientAngle: 135,
      image: "",
      overlayColor: "#000000",
      overlayOpacity: 0.4,
    },
  },
  textColor: {
    id: "textColor",
    label: "Text",
    category: "typography",
    fields: [{ key: "textColor", label: "Default text color", type: "color" }],
    defaultValues: { textColor: "#111111" },
  },
  spacing: {
    id: "spacing",
    label: "Section",
    category: "layout",
    fields: [
      {
        key: "paddingY",
        label: "Vertical padding",
        type: "select",
        options: [
          { value: "sm", label: "S" },
          { value: "md", label: "M" },
          { value: "lg", label: "L" },
          { value: "xl", label: "XL" },
        ],
      },
    ],
    defaultValues: { paddingY: "md" },
  },
  reversible: {
    id: "reversible",
    label: "Layout",
    category: "layout",
    fields: [{ key: "reversed", label: "Reverse columns", type: "toggle" }],
    defaultValues: { reversed: false },
  },
};

export function buildDefaultSettings(traitIds: string[]): Record<string, unknown> {
  return traitIds.reduce<Record<string, unknown>>((acc, id) => {
    const trait = traitRegistry[id];
    if (!trait) {
      return acc;
    }
    return { ...acc, ...trait.defaultValues };
  }, {});
}

export function buildVariantSettings(
  traitIds: string[],
  settingsDefaults?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...buildDefaultSettings(traitIds),
    ...(settingsDefaults ?? {}),
  };
}
