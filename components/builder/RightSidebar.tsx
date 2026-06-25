"use client";

import { useBuilderStore } from "@/store/builderStore";
import StylePanel from "./style/StylePanel";
import SiteSettingsPanel from "./SiteSettingsPanel";

export default function RightSidebar() {
  const tab = useBuilderStore((state) => state.rightSidebarTab);
  const setTab = useBuilderStore((state) => state.setRightSidebarTab);

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          className={`right-sidebar-tab ${tab === "theme" ? "right-sidebar-tab--active" : ""}`}
          onClick={() => setTab("theme")}
        >
          Theme
        </button>
        <button
          type="button"
          className={`right-sidebar-tab ${tab === "settings" ? "right-sidebar-tab--active" : ""}`}
          onClick={() => setTab("settings")}
        >
          Settings
        </button>
      </div>
      <div className="min-h-0 flex-1">
        {tab === "theme" ? <StylePanel /> : <SiteSettingsPanel />}
      </div>
    </div>
  );
}
