import type { TraitDefinition } from "./types";

export const traitRegistry: Record<string, TraitDefinition> = {
  grid: {
    id: "grid",
    label: "Grid layout",
    fields: [
      { key: "columns", label: "Columns", type: "number", min: 1, max: 6, step: 1 },
      {
        key: "gap",
        label: "Gap",
        type: "select",
        options: [
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
        ],
      },
    ],
    defaultValues: { columns: 3, gap: "md" },
  },
  overlay: {
    id: "overlay",
    label: "Background overlay",
    fields: [
      { key: "overlayColor", label: "Overlay color", type: "color" },
      { key: "opacity", label: "Opacity", type: "slider", min: 0, max: 1, step: 0.05 },
    ],
    defaultValues: { overlayColor: "#000000", opacity: 0.4 },
  },
  background: {
    id: "background",
    label: "Background",
    fields: [{ key: "backgroundColor", label: "Background color", type: "color" }],
    defaultValues: { backgroundColor: "#ffffff" },
  },
  spacing: {
    id: "spacing",
    label: "Section spacing",
    fields: [
      {
        key: "paddingY",
        label: "Vertical padding",
        type: "select",
        options: [
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
          { value: "xl", label: "Extra large" },
        ],
      },
    ],
    defaultValues: { paddingY: "md" },
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
