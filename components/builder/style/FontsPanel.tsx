"use client";

import GoogleFontSelect from "@/components/builder/GoogleFontSelect";
import { useBuilderStore } from "@/store/builderStore";
import type { ThemeFontConfig } from "@/lib/types";

const FONT_PAIRINGS: { label: string; heading: ThemeFontConfig; body: ThemeFontConfig }[] = [
  {
    label: "Playfair + Inter",
    heading: { family: "Playfair Display", googleFontId: "Playfair Display", weights: "400;600;700", fallback: "serif" },
    body: { family: "Inter", googleFontId: "Inter", weights: "400;500;600;700", fallback: "sans-serif" },
  },
  {
    label: "DM Serif + DM Sans",
    heading: { family: "DM Serif Display", googleFontId: "DM Serif Display", weights: "400", fallback: "serif" },
    body: { family: "DM Sans", googleFontId: "DM Sans", weights: "400;500;700", fallback: "sans-serif" },
  },
  {
    label: "Fraunces + Source Sans 3",
    heading: { family: "Fraunces", googleFontId: "Fraunces", weights: "600;700", fallback: "serif" },
    body: { family: "Source Sans 3", googleFontId: "Source Sans 3", weights: "400;600", fallback: "sans-serif" },
  },
  {
    label: "Sora + Manrope",
    heading: { family: "Sora", googleFontId: "Sora", weights: "600;700", fallback: "sans-serif" },
    body: { family: "Manrope", googleFontId: "Manrope", weights: "400;600", fallback: "sans-serif" },
  },
];

export default function FontsPanel() {
  const theme = useBuilderStore((state) => state.site.theme);
  const updateTheme = useBuilderStore((state) => state.updateTheme);

  return (
    <div className="style-panel">
      <section className="style-panel__section">
        <h3 className="style-panel__title">Quick pairings</h3>
        <div className="style-pairing-list">
          {FONT_PAIRINGS.map((pairing) => (
            <button
              key={pairing.label}
              type="button"
              className="style-pairing-btn"
              onClick={() =>
                updateTheme({
                  fonts: { heading: pairing.heading, body: pairing.body },
                  presetId: undefined,
                })
              }
            >
              {pairing.label}
            </button>
          ))}
        </div>
      </section>

      <section className="style-panel__section">
        <h3 className="style-panel__title">Heading font</h3>
        <div className="style-panel__field-group">
          <GoogleFontSelect
            value={theme.fonts.heading}
            onChange={(heading) =>
              updateTheme({ fonts: { ...theme.fonts, heading }, presetId: undefined })
            }
          />
        </div>
      </section>

      <section className="style-panel__section">
        <h3 className="style-panel__title">Body font</h3>
        <div className="style-panel__field-group">
          <GoogleFontSelect
            value={theme.fonts.body}
            onChange={(body) => updateTheme({ fonts: { ...theme.fonts, body }, presetId: undefined })}
          />
        </div>
      </section>

      <p className="style-panel__hint">
        Section settings can override these fonts for individual sections. Per-text overrides in the editor still take priority.
      </p>
    </div>
  );
}
