"use client";

import { useState } from "react";
import SiteSettingsPanel from "./SiteSettingsPanel";
import ThemePanel from "./ThemePanel";

type RightPanelTab = "theme" | "settings";

export default function RightSidebar() {
  const [tab, setTab] = useState<RightPanelTab>("theme");

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
        {tab === "theme" ? <ThemePanel embedded /> : <SiteSettingsPanel />}
      </div>
    </div>
  );
}
