"use client";

import { useBuilderStore } from "@/store/builderStore";
import { getSiteButtonClassName } from "@/lib/button-styles";
import { buildThemeCssVariables } from "@/lib/theme-utils";
import type { ButtonStyleConfig } from "@/lib/types";

export default function ButtonsPanel() {
  const theme = useBuilderStore((state) => state.site.theme);
  const updateTheme = useBuilderStore((state) => state.updateTheme);
  const buttons = theme.buttons;

  const updateButtons = (partial: Partial<ButtonStyleConfig>) => {
    updateTheme({
      buttons: { ...buttons, ...partial },
      presetId: undefined,
    });
  };

  return (
    <div className="style-panel">
      <section className="style-panel__section">
        <h3 className="style-panel__title">Preview</h3>
        <div
          className="style-button-preview site-theme-root"
          style={buildThemeCssVariables(theme, { embed: true })}
          data-btn-hover-effect={buttons.hoverEffect}
        >
          <button type="button" className={getSiteButtonClassName("primary")}>
            Primary button
          </button>
          <button type="button" className={getSiteButtonClassName("secondary")}>
            Secondary
          </button>
          <button type="button" className={getSiteButtonClassName("outline")}>
            Outline
          </button>
          <button type="button" className={getSiteButtonClassName("light")}>
            Light
          </button>
        </div>
      </section>

      <section className="style-panel__section">
        <div className="style-panel__field-group">
          <label className="style-field">
            <span className="style-field__label">Font size</span>
            <select
              className="settings-field"
              value={buttons.fontSize}
              onChange={(event) => updateButtons({ fontSize: event.target.value as ButtonStyleConfig["fontSize"] })}
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </label>

          <label className="style-field">
            <span className="style-field__label">Font weight</span>
            <select
              className="settings-field"
              value={buttons.fontWeight}
              onChange={(event) =>
                updateButtons({ fontWeight: Number(event.target.value) as ButtonStyleConfig["fontWeight"] })
              }
            >
              <option value={500}>Medium (500)</option>
              <option value={600}>Semibold (600)</option>
              <option value={700}>Bold (700)</option>
            </select>
          </label>

          <label className="style-field">
            <span className="style-field__label">Padding</span>
            <select
              className="settings-field"
              value={buttons.padding}
              onChange={(event) => updateButtons({ padding: event.target.value as ButtonStyleConfig["padding"] })}
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </label>

          <label className="style-field">
            <span className="style-field__label">Border radius</span>
            <select
              className="settings-field"
              value={buttons.borderRadius}
              onChange={(event) =>
                updateButtons({ borderRadius: event.target.value as ButtonStyleConfig["borderRadius"] })
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

          <label className="style-field">
            <span className="style-field__label">Hover effect</span>
            <select
              className="settings-field"
              value={buttons.hoverEffect}
              onChange={(event) =>
                updateButtons({ hoverEffect: event.target.value as ButtonStyleConfig["hoverEffect"] })
              }
            >
              <option value="lift">Lift</option>
              <option value="darken">Darken</option>
              <option value="outline-fill">Outline fill</option>
              <option value="none">None</option>
            </select>
          </label>

          <label className="style-field style-field--row">
            <span className="style-field__label">Shadow</span>
            <input
              type="checkbox"
              checked={buttons.shadow}
              onChange={(event) => updateButtons({ shadow: event.target.checked })}
            />
          </label>

          <label className="style-field">
            <span className="style-field__label">Default variant for new buttons</span>
            <select
              className="settings-field"
              value={buttons.defaultVariant}
              onChange={(event) =>
                updateButtons({ defaultVariant: event.target.value as ButtonStyleConfig["defaultVariant"] })
              }
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
              <option value="light">Light</option>
            </select>
          </label>
        </div>
      </section>

      <p className="style-panel__hint">
        These styles apply to all buttons across hero, CTA, and header sections.
      </p>
    </div>
  );
}
