"use client";

import { PanelLeft, PanelLeftClose } from "lucide-react";
import { useBuilderStore, type PreviewDevice } from "@/store/builderStore";

const DEVICES: { id: PreviewDevice; label: string; width: number | null }[] = [
  { id: "mobile", label: "Mobile", width: 375 },
  { id: "tablet", label: "Tablet", width: 768 },
  { id: "desktop", label: "Desktop", width: null },
];

export default function DevicePreviewBar() {
  const previewDevice = useBuilderStore((state) => state.previewDevice);
  const setPreviewDevice = useBuilderStore((state) => state.setPreviewDevice);
  const sidebarsVisible = useBuilderStore((state) => state.sidebarsVisible);
  const toggleSidebarsVisible = useBuilderStore((state) => state.toggleSidebarsVisible);
  const active = DEVICES.find((device) => device.id === previewDevice) ?? DEVICES[2];

  return (
    <div className="device-preview-bar">
      <span className="device-preview-bar__label">Preview</span>
      <div className="device-preview-bar__tabs" role="tablist" aria-label="Device preview width">
        {DEVICES.map((device) => (
          <button
            key={device.id}
            type="button"
            role="tab"
            aria-selected={previewDevice === device.id}
            className={`device-preview-bar__tab${
              previewDevice === device.id ? " device-preview-bar__tab--active" : ""
            }`}
            onClick={() => setPreviewDevice(device.id)}
          >
            {device.label}
          </button>
        ))}
      </div>
      <div className="device-preview-bar__actions">
        <div className="device-preview-bar__tabs" role="group" aria-label="Sidebar visibility">
          <button
            type="button"
            className={`device-preview-bar__tab device-preview-bar__tab--with-icon${
              !sidebarsVisible ? " device-preview-bar__tab--active" : ""
            }`}
            onClick={toggleSidebarsVisible}
            aria-pressed={!sidebarsVisible}
            aria-label={sidebarsVisible ? "Hide sidebars" : "Show sidebars"}
            title={sidebarsVisible ? "Hide sidebars" : "Show sidebars"}
          >
            {sidebarsVisible ? (
              <PanelLeftClose size={14} strokeWidth={1.75} aria-hidden />
            ) : (
              <PanelLeft size={14} strokeWidth={1.75} aria-hidden />
            )}
            <span className="device-preview-bar__panels-label">
              {sidebarsVisible ? "Hide panels" : "Show panels"}
            </span>
          </button>
        </div>
        <span className="device-preview-bar__size">
          {active.width ? `${active.width}px` : "Full width"}
        </span>
      </div>
    </div>
  );
}

export function getPreviewMaxWidth(device: PreviewDevice): number | undefined {
  const match = DEVICES.find((entry) => entry.id === device);
  return match?.width ?? undefined;
}
