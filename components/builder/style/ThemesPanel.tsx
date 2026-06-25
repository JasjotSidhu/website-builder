"use client";

import { BUILT_IN_THEME_PRESETS } from "@/data/theme-presets";
import { useBuilderStore } from "@/store/builderStore";
import { useState } from "react";

function ThemeSwatches({
  colors,
}: {
  colors: { primary: string; background: string; titleText: string };
}) {
  return (
    <div className="style-theme-swatches" aria-hidden>
      <span style={{ background: colors.primary }} />
      <span style={{ background: colors.background }} />
      <span style={{ background: colors.titleText }} />
    </div>
  );
}

export default function ThemesPanel() {
  const theme = useBuilderStore((state) => state.site.theme);
  const customThemes = useBuilderStore((state) => state.site.customThemes ?? []);
  const updateTheme = useBuilderStore((state) => state.updateTheme);
  const applyThemePreset = useBuilderStore((state) => state.applyThemePreset);
  const saveCustomTheme = useBuilderStore((state) => state.saveCustomTheme);
  const removeCustomTheme = useBuilderStore((state) => state.removeCustomTheme);
  const [saveName, setSaveName] = useState(theme.customName ?? "My theme");
  const [showSave, setShowSave] = useState(false);

  return (
    <div className="style-panel">
      <section className="style-panel__section">
        <h3 className="style-panel__title">Built-in color themes</h3>
        <div className="style-theme-grid">
          {BUILT_IN_THEME_PRESETS.map((preset) => {
            const isActive = theme.presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={`style-theme-card${isActive ? " style-theme-card--active" : ""}`}
                onClick={() => applyThemePreset(preset.id, "built-in")}
              >
                <ThemeSwatches colors={preset.theme.colors} />
                <span className="style-theme-card__name">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="style-panel__section">
        <div className="style-panel__section-header">
          <h3 className="style-panel__title">My themes</h3>
          <button
            type="button"
            className="style-panel__link-btn"
            onClick={() => setShowSave((open) => !open)}
          >
            Save current
          </button>
        </div>
        {showSave ? (
          <div className="style-save-theme">
            <input
              type="text"
              className="settings-field"
              value={saveName}
              maxLength={60}
              placeholder="Theme name"
              onChange={(event) => setSaveName(event.target.value)}
            />
            <button
              type="button"
              className="editor-popover-btn editor-popover-btn--primary"
              disabled={!saveName.trim()}
              onClick={() => {
                saveCustomTheme(saveName);
                setShowSave(false);
              }}
            >
              Save
            </button>
          </div>
        ) : null}
        {customThemes.length === 0 ? (
          <p className="style-panel__hint">Save your current color palette to reuse later. Fonts, buttons, and cards stay unchanged when switching themes.</p>
        ) : (
          <div className="style-theme-grid">
            {customThemes.map((preset) => {
              const isActive = theme.presetId === preset.id;
              return (
                <div key={preset.id} className={`style-theme-card-wrap${isActive ? " style-theme-card-wrap--active" : ""}`}>
                  <button
                    type="button"
                    className={`style-theme-card${isActive ? " style-theme-card--active" : ""}`}
                    onClick={() => applyThemePreset(preset.id, "custom")}
                  >
                    <ThemeSwatches colors={preset.theme.colors} />
                    <span className="style-theme-card__name">{preset.name}</span>
                  </button>
                  <button
                    type="button"
                    className="style-theme-card__remove"
                    aria-label={`Remove ${preset.name}`}
                    onClick={() => removeCustomTheme(preset.id)}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="style-panel__section">
        <h3 className="style-panel__title">Customize colors</h3>

        <div className="style-panel__field-group">
          <p className="style-panel__group-label">Brand</p>
          {(
            [
              ["primary", "Primary"],
              ["secondary", "Secondary"],
              ["accent", "Accent"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="style-color-row">
              <span>{label}</span>
              <input
                type="color"
                value={theme.colors[key] ?? "#000000"}
                onChange={(event) =>
                  updateTheme({
                    colors: { ...theme.colors, [key]: event.target.value },
                    presetId: undefined,
                  })
                }
              />
            </label>
          ))}
        </div>

        <div className="style-panel__field-group">
          <p className="style-panel__group-label">Page text</p>
          {(
            [
              ["background", "Page background"],
              ["titleText", "Title text"],
              ["bodyText", "Body text"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="style-color-row">
              <span>{label}</span>
              <input
                type="color"
                value={theme.colors[key] ?? "#000000"}
                onChange={(event) =>
                  updateTheme({
                    colors: { ...theme.colors, [key]: event.target.value },
                    presetId: undefined,
                  })
                }
              />
            </label>
          ))}
        </div>

        <div className="style-panel__field-group">
          <p className="style-panel__group-label">Layout</p>
          <label className="style-field">
            <span className="style-field__label">Border radius</span>
            <select
              className="settings-field"
              value={theme.borderRadius}
              onChange={(event) =>
                updateTheme({
                  borderRadius: event.target.value as typeof theme.borderRadius,
                  presetId: undefined,
                })
              }
            >
              {["none", "sm", "md", "lg", "full"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="style-field">
            <span className="style-field__label">Section spacing</span>
            <select
              className="settings-field"
              value={theme.spacing}
              onChange={(event) =>
                updateTheme({
                  spacing: event.target.value as typeof theme.spacing,
                  presetId: undefined,
                })
              }
            >
              {["compact", "comfortable", "spacious"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
    </div>
  );
}
