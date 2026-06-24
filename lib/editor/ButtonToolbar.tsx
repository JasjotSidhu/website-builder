"use client";

import ButtonSettingsFields from "./ButtonSettingsFields";
import type { ButtonToolbarSettings } from "./button-toolbar-settings";
import FloatingToolbar from "./FloatingToolbar";

export default function ButtonToolbar({
  anchorEl,
  settings,
}: {
  anchorEl: HTMLElement | null;
  settings: ButtonToolbarSettings;
}) {
  return (
    <FloatingToolbar anchorEl={anchorEl} open={Boolean(anchorEl)} wide>
      <div role="toolbar" aria-label="Button settings">
        <div className="popover-toolbar-topbar">
          <span className="popover-toolbar-title">Button</span>
        </div>
        <div className="popover-toolbar-panel">
          <ButtonSettingsFields
            variant={settings.variant}
            link={settings.link}
            pages={settings.pages}
            onVariantChange={settings.onVariantChange}
            onLinkChange={settings.onLinkChange}
          />
        </div>
      </div>
    </FloatingToolbar>
  );
}
