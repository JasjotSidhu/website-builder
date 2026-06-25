"use client";

import { useMemo, useState } from "react";
import { GOOGLE_FONTS_CATALOG } from "@/lib/fonts/google-fonts-catalog";
import { normalizeFontConfig } from "@/lib/fonts/font-utils";
import type { ThemeFontConfig } from "@/lib/types";

interface GoogleFontSelectProps {
  value: unknown;
  onChange: (value: ThemeFontConfig) => void;
  label?: string;
}

export default function GoogleFontSelect({ value, onChange, label }: GoogleFontSelectProps) {
  const normalized = normalizeFontConfig(value);
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return GOOGLE_FONTS_CATALOG;
    }

    return GOOGLE_FONTS_CATALOG.filter((entry) =>
      entry.family.toLowerCase().includes(trimmed),
    );
  }, [query]);

  return (
    <div className="google-font-select">
      {label ? <span className="style-field__label">{label}</span> : null}
      <input
        type="search"
        className="settings-field"
        placeholder="Search Google Fonts"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <select
        className="settings-field"
        value={normalized.googleFontId ?? normalized.family}
        onChange={(event) => {
          const match = GOOGLE_FONTS_CATALOG.find(
            (entry) => entry.family === event.target.value,
          );
          if (!match) {
            return;
          }

          onChange({
            family: match.family,
            googleFontId: match.family,
            weights: match.weights,
            fallback: match.category === "serif" ? "serif" : "sans-serif",
          });
        }}
      >
        {options.map((entry) => (
          <option key={entry.family} value={entry.family}>
            {entry.family}
          </option>
        ))}
      </select>
    </div>
  );
}
