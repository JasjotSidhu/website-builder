export type TraitFieldConfig =
  | { key: string; label: string; type: "number"; min?: number; max?: number; step?: number }
  | {
      key: string;
      label: string;
      type: "select";
      options: { value: string; label: string }[];
    }
  | { key: string; label: string; type: "color" }
  | { key: string; label: string; type: "slider"; min: number; max: number; step?: number };

export interface TraitDefinition {
  id: string;
  label: string;
  fields: TraitFieldConfig[];
  defaultValues: Record<string, unknown>;
}
