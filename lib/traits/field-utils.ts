import type { TraitFieldConfig } from "./types";

export function isTraitFieldVisible(
  field: TraitFieldConfig,
  settings: Record<string, unknown>,
): boolean {
  if (!field.showIf) {
    return true;
  }

  return settings[field.showIf.key] === field.showIf.equals;
}
