"use client";

import { useBuilderStore, type StyleSubTab } from "@/store/builderStore";
import ButtonsPanel from "./ButtonsPanel";
import CardsPanel from "./CardsPanel";
import FontsPanel from "./FontsPanel";
import ThemesPanel from "./ThemesPanel";

const TABS: { id: StyleSubTab; label: string }[] = [
  { id: "themes", label: "Themes" },
  { id: "fonts", label: "Fonts" },
  { id: "buttons", label: "Buttons" },
  { id: "cards", label: "Cards" },
];

export default function StylePanel() {
  const subTab = useBuilderStore((state) => state.styleSubTab);
  const setSubTab = useBuilderStore((state) => state.setStyleSubTab);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Style</h2>
        <p className="text-xs text-gray-500">Global theme, fonts, buttons, and cards</p>
      </div>
      <div className="style-subtabs" role="tablist" aria-label="Style categories">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={subTab === tab.id}
            className={`style-subtab${subTab === tab.id ? " style-subtab--active" : ""}`}
            onClick={() => setSubTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {subTab === "themes" ? <ThemesPanel /> : null}
        {subTab === "fonts" ? <FontsPanel /> : null}
        {subTab === "buttons" ? <ButtonsPanel /> : null}
        {subTab === "cards" ? <CardsPanel /> : null}
      </div>
    </div>
  );
}
