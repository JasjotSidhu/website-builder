"use client";

import type { ThemeConfig } from "@/lib/types";
import { useBuilderStore } from "@/store/builderStore";

const FONT_OPTIONS = [
  { label: "Inter / System", heading: "Inter, system-ui, sans-serif", body: "Inter, system-ui, sans-serif" },
  { label: "Georgia / Helvetica", heading: "Georgia, 'Times New Roman', serif", body: "'Helvetica Neue', Arial, sans-serif" },
  { label: "Playfair / Lato", heading: "'Playfair Display', Georgia, serif", body: "Lato, Arial, sans-serif" },
  { label: "Merriweather / Open Sans", heading: "Merriweather, Georgia, serif", body: "'Open Sans', Arial, sans-serif" },
  { label: "Montserrat / Roboto", heading: "Montserrat, Arial, sans-serif", body: "Roboto, Arial, sans-serif" },
  { label: "DM Serif / DM Sans", heading: "'DM Serif Display', Georgia, serif", body: "'DM Sans', Arial, sans-serif" },
];

export default function ThemePanel() {
  const theme = useBuilderStore((state) => state.site.theme);
  const updateTheme = useBuilderStore((state) => state.updateTheme);

  const currentFontIndex = FONT_OPTIONS.findIndex(
    (option) =>
      option.heading === theme.fonts.heading && option.body === theme.fonts.body,
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Theme</h2>
        <p className="text-xs text-gray-500">Global colors and typography</p>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Colors
          </h3>
          {(
            [
              ["primary", "Primary"],
              ["secondary", "Secondary"],
              ["background", "Background"],
              ["text", "Text"],
              ["accent", "Accent"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-700">{label}</span>
              <input
                type="color"
                value={theme.colors[key] ?? "#000000"}
                className="h-9 w-14 cursor-pointer rounded border border-gray-300"
                onChange={(event) =>
                  updateTheme({
                    colors: { ...theme.colors, [key]: event.target.value },
                  })
                }
              />
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Font pairing
          </label>
          <select
            value={currentFontIndex >= 0 ? currentFontIndex : 0}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            onChange={(event) => {
              const option = FONT_OPTIONS[Number(event.target.value)];
              updateTheme({
                fonts: { heading: option.heading, body: option.body },
              });
            }}
          >
            {FONT_OPTIONS.map((option, index) => (
              <option key={option.label} value={index}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Border radius
          </label>
          <select
            value={theme.borderRadius}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            onChange={(event) =>
              updateTheme({
                borderRadius: event.target.value as ThemeConfig["borderRadius"],
              })
            }
          >
            {["none", "sm", "md", "lg", "full"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Spacing
          </label>
          <select
            value={theme.spacing}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            onChange={(event) =>
              updateTheme({
                spacing: event.target.value as ThemeConfig["spacing"],
              })
            }
          >
            {["compact", "comfortable", "spacious"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
