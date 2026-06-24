"use client";

import { useEffect, useMemo, useState } from "react";
import type { SectionVariant } from "@/lib/registry";
import { PopoverShell } from "@/lib/editor/PopoverShell";
import { isTraitFieldVisible } from "@/lib/traits/field-utils";
import { traitRegistry } from "@/lib/traits/registry";
import { buildSettingsTabs } from "@/lib/traits/settings-tabs";
import type { TraitCategory } from "@/lib/traits/types";
import { SettingField } from "./SettingField";

interface SectionSettingsPanelProps {
  title?: string;
  settings: Record<string, unknown>;
  variant: SectionVariant;
  onUpdate: (partial: Record<string, unknown>) => void;
  onClose: () => void;
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3.5 3.5l7 7M10.5 3.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TraitFields({
  traitIds,
  settings,
  onUpdate,
}: {
  traitIds: string[];
  settings: Record<string, unknown>;
  onUpdate: (partial: Record<string, unknown>) => void;
}) {
  return (
    <>
      {traitIds.map((traitId) => {
        const trait = traitRegistry[traitId];
        if (!trait) {
          return null;
        }

        const visibleFields = trait.fields.filter((field) =>
          isTraitFieldVisible(field, settings),
        );

        if (visibleFields.length === 0) {
          return null;
        }

        return (
          <section key={traitId} className="popover__section">
            <h4 className="popover__section-title">{trait.label}</h4>
            {visibleFields.map((field) => (
              <SettingField
                key={field.key}
                field={field}
                value={settings[field.key]}
                onChange={(value) => onUpdate({ [field.key]: value })}
              />
            ))}
          </section>
        );
      })}
    </>
  );
}

export default function SectionSettingsPanel({
  title = "Section settings",
  settings,
  variant,
  onUpdate,
  onClose,
}: SectionSettingsPanelProps) {
  const tabs = useMemo(
    () => buildSettingsTabs(variant, settings),
    [variant, settings],
  );
  const [activeTab, setActiveTab] = useState<TraitCategory>(
    tabs[0]?.id ?? "background",
  );

  useEffect(() => {
    if (tabs.length > 0 && !tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const activeTabData = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <PopoverShell
      title={title}
      variant="settings"
      hideHeader
      onClose={onClose}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="popover__topbar">
        {tabs.length > 1 ? (
          <div className="settings-tabs" role="tablist" aria-label="Settings categories">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`settings-tabs__btn${activeTab === tab.id ? " settings-tabs__btn--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="popover__topbar-title">{title}</span>
        )}
        <button type="button" className="popover__close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
      </div>

      {tabs.length === 0 ? (
        <p className="popover-empty">No settings for this section.</p>
      ) : (
        <div className="settings-tab-panel" role="tabpanel" aria-label={activeTabData?.label}>
          {activeTabData ? (
            <TraitFields
              traitIds={activeTabData.traitIds}
              settings={settings}
              onUpdate={onUpdate}
            />
          ) : null}
        </div>
      )}
    </PopoverShell>
  );
}
