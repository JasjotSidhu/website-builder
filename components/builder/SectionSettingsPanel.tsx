"use client";

import { useEffect, useMemo, useState } from "react";
import type { SectionVariant } from "@/lib/registry";
import { PopoverActions, PopoverField, PopoverShell } from "@/lib/editor/PopoverShell";
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
  customClass?: string;
  onCustomClassChange?: (value: string) => void;
  popoverRef?: React.Ref<HTMLDivElement>;
  headerContent?: React.ReactNode;
  additionalTabs?: { id: string; label: string; content: React.ReactNode }[];
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

type SettingsTabId = TraitCategory | "custom" | string;

export default function SectionSettingsPanel({
  title = "Section settings",
  settings,
  variant,
  onUpdate,
  onClose,
  customClass = "",
  onCustomClassChange,
  popoverRef,
  headerContent,
  additionalTabs,
}: SectionSettingsPanelProps) {
  const traitTabs = useMemo(
    () => buildSettingsTabs(variant, settings),
    [variant, settings],
  );
  const tabs = useMemo(() => {
    const next = traitTabs.map((tab) => ({
      id: tab.id as SettingsTabId,
      label: tab.label,
      traitIds: tab.traitIds,
    }));

    if (additionalTabs) {
      for (const tab of additionalTabs) {
        next.unshift({ id: tab.id, label: tab.label, traitIds: [] });
      }
    }

    if (onCustomClassChange) {
      next.push({ id: "custom", label: "Custom", traitIds: [] });
    }
    return next;
  }, [traitTabs, onCustomClassChange, additionalTabs]);

  const [activeTab, setActiveTab] = useState<SettingsTabId>(
    tabs[0]?.id ?? "background",
  );
  const [draftCustomClass, setDraftCustomClass] = useState(customClass);

  useEffect(() => {
    setDraftCustomClass(customClass);
  }, [customClass]);

  useEffect(() => {
    if (activeTab === "custom") {
      setDraftCustomClass(customClass);
    }
  }, [activeTab, customClass]);

  useEffect(() => {
    if (tabs.length > 0 && !tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const activeTabData = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const activeAdditionalTab = additionalTabs?.find((tab) => tab.id === activeTab);
  const customClassDirty = draftCustomClass.trim() !== customClass.trim();

  const handleSaveCustomClass = () => {
    onCustomClassChange?.(draftCustomClass);
  };

  const handleCancelCustomClass = () => {
    setDraftCustomClass(customClass);
  };

  return (
    <PopoverShell
      ref={popoverRef}
      title={title}
      variant="settings"
      hideHeader
      onClose={onClose}
      onMouseDown={(event) => event.stopPropagation()}
      footer={
        activeTab === "custom" && onCustomClassChange ? (
          <PopoverActions
            onCancel={handleCancelCustomClass}
            onSave={handleSaveCustomClass}
            saveDisabled={!customClassDirty}
          />
        ) : undefined
      }
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

      {headerContent ? <div className="border-b border-gray-100 px-4 py-3">{headerContent}</div> : null}

      {tabs.length === 0 ? (
        <p className="popover-empty">No settings for this section.</p>
      ) : activeAdditionalTab ? (
        <div
          className="settings-tab-panel"
          role="tabpanel"
          aria-label={activeAdditionalTab.label}
        >
          {activeAdditionalTab.content}
        </div>
      ) : activeTab === "custom" ? (
        <div className="settings-tab-panel" role="tabpanel" aria-label="Custom">
          <section className="popover__section">
            <PopoverField
              label="Custom CSS classes"
              hint="Applied to the section wrapper. Separate multiple classes with spaces."
            >
              <input
                type="text"
                className="popover-input"
                value={draftCustomClass}
                placeholder="e.g. my-section pt-8"
                onChange={(event) => setDraftCustomClass(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && customClassDirty) {
                    handleSaveCustomClass();
                  }
                }}
              />
            </PopoverField>
          </section>
        </div>
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
