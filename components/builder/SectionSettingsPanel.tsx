"use client";

import type { SectionInstance } from "@/lib/types";
import type { SectionVariant } from "@/lib/registry";
import { traitRegistry } from "@/lib/traits/registry";
import { useBuilderStore } from "@/store/builderStore";
import { SettingField } from "./SettingField";

interface SectionSettingsPanelProps {
  section: SectionInstance;
  variant: SectionVariant;
  onClose: () => void;
}

export default function SectionSettingsPanel({
  section,
  variant,
  onClose,
}: SectionSettingsPanelProps) {
  const updateSectionSettings = useBuilderStore((state) => state.updateSectionSettings);

  return (
    <div className="settings-popover" role="dialog" aria-label="Section settings">
      <div className="settings-popover-header">
        <h3 className="settings-popover-title">Section settings</h3>
        <button type="button" className="settings-popover-close" onClick={onClose}>
          ✕
        </button>
      </div>
      {variant.traits.length === 0 ? (
        <p className="settings-popover-empty">No settings for this section.</p>
      ) : (
        variant.traits.map((traitId) => {
          const trait = traitRegistry[traitId];
          if (!trait) {
            return null;
          }

          return (
            <fieldset key={traitId} className="settings-group">
              <legend>{trait.label}</legend>
              {trait.fields.map((field) => (
                <SettingField
                  key={field.key}
                  field={field}
                  value={section.settings[field.key]}
                  onChange={(value) =>
                    updateSectionSettings(section.id, { [field.key]: value })
                  }
                />
              ))}
            </fieldset>
          );
        })
      )}
    </div>
  );
}
