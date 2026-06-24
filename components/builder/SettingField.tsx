"use client";

import type { TraitFieldConfig } from "@/lib/traits/types";

interface SettingFieldProps {
  field: TraitFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function SettingField({ field, value, onChange }: SettingFieldProps) {
  if (field.type === "number") {
    return (
      <label className="settings-field">
        <span>{field.label}</span>
        <input
          type="number"
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
    return (
      <label className="settings-field">
        <span>{field.label}</span>
        <select
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
      <label className="settings-field settings-field--color">
        <span>{field.label}</span>
        <input
          type="color"
          value={String(value ?? "#000000")}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    );
  }

  return (
    <label className="settings-field">
      <span>
        {field.label} ({Number(value ?? field.min).toFixed(2)})
      </span>
      <input
        type="range"
        min={field.min}
        max={field.max}
        step={field.step}
        value={Number(value ?? field.min)}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
