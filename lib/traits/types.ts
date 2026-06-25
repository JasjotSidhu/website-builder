export type TraitCategory = "background" | "typography" | "layout" | "fonts";

export interface ShowIfRule {
  key: string;
  equals: unknown;
}

type TraitFieldBase = {
  key: string;
  label: string;
  showIf?: ShowIfRule;
};

export type TraitFieldConfig =
  | (TraitFieldBase & {
      type: "number";
      min?: number;
      max?: number;
      step?: number;
    })
  | (TraitFieldBase & {
      type: "select";
      options: { value: string; label: string }[];
    })
  | (TraitFieldBase & { type: "color" })
  | (TraitFieldBase & {
      type: "slider";
      min: number;
      max: number;
      step?: number;
    })
  | (TraitFieldBase & { type: "toggle" })
  | (TraitFieldBase & { type: "image" })
  | (TraitFieldBase & { type: "googleFont" });

export interface TraitDefinition {
  id: string;
  label: string;
  category: TraitCategory;
  fields: TraitFieldConfig[];
  defaultValues: Record<string, unknown>;
}
