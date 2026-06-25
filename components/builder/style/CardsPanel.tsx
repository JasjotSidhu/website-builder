"use client";

import { FeatureIcon } from "@/components/sections/features/FeatureIcon";
import { useBuilderStore } from "@/store/builderStore";
import { buildThemeCssVariables } from "@/lib/theme-utils";
import type { CardStyleConfig } from "@/lib/types";

const CARD_COLOR_FIELDS = [
  { key: "background" as const, label: "Card background" },
  { key: "titleColor" as const, label: "Card title color" },
  { key: "textColor" as const, label: "Card text color" },
  { key: "borderColor" as const, label: "Card border color" },
  { key: "iconColor" as const, label: "Card icon color" },
];

export default function CardsPanel() {
  const theme = useBuilderStore((state) => state.site.theme);
  const updateTheme = useBuilderStore((state) => state.updateTheme);
  const resetCardsToThemeDefault = useBuilderStore((state) => state.resetCardsToThemeDefault);
  const cards = theme.cards;

  const updateCards = (partial: Partial<CardStyleConfig>) => {
    updateTheme({
      cards: { ...cards, ...partial },
      presetId: undefined,
    });
  };

  return (
    <div className="style-panel">
      <section className="style-panel__section">
        <h3 className="style-panel__title">Preview</h3>
        <div
          className="style-card-preview site-theme-root"
          style={buildThemeCssVariables(theme, { embed: true })}
        >
          <article className="feature-card">
            <div className="feature-icon-wrap">
              <FeatureIcon name="grid" />
            </div>
            <h4 className="mt-4 text-base font-semibold">Card title</h4>
            <p className="mt-2 text-sm leading-relaxed opacity-80">
              Supporting card text for feature and testimonial sections.
            </p>
          </article>
        </div>
      </section>

      <section className="style-panel__section">
        <div className="style-panel__section-header">
          <p className="style-panel__group-label" style={{ margin: 0 }}>
            Colors
          </p>
          <button
            type="button"
            className="style-panel__link-btn"
            onClick={() => resetCardsToThemeDefault()}
          >
            Reset to theme
          </button>
        </div>
        <div className="style-panel__field-group">
          {CARD_COLOR_FIELDS.map(({ key, label }) => (
            <label key={key} className="style-color-row">
              <span>{label}</span>
              <input
                type="color"
                value={String(cards[key])}
                onChange={(event) => updateCards({ [key]: event.target.value })}
              />
            </label>
          ))}
        </div>

        <label className="style-field">
          <span className="style-field__label">Card border radius</span>
          <select
            className="settings-field"
            value={cards.borderRadius}
            onChange={(event) =>
              updateCards({ borderRadius: event.target.value as CardStyleConfig["borderRadius"] })
            }
          >
            <option value="inherit">Match theme</option>
            <option value="none">None</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="full">Pill</option>
          </select>
        </label>
      </section>

      <p className="style-panel__hint">
        Card colors match the selected theme by default. Customize them here, or use Reset to theme to
        re-apply the current theme palette. Border radius is kept when resetting.
      </p>
    </div>
  );
}
