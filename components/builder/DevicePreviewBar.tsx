"use client";

import { useBuilderStore, type PreviewDevice } from "@/store/builderStore";

const DEVICES: { id: PreviewDevice; label: string; width: number | null }[] = [
  { id: "mobile", label: "Mobile", width: 375 },
  { id: "tablet", label: "Tablet", width: 768 },
  { id: "desktop", label: "Desktop", width: null },
];

export default function DevicePreviewBar() {
  const previewDevice = useBuilderStore((state) => state.previewDevice);
  const setPreviewDevice = useBuilderStore((state) => state.setPreviewDevice);
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
      <span className="device-preview-bar__size">
        {active.width ? `${active.width}px` : "Full width"}
      </span>
    </div>
  );
}

export function getPreviewMaxWidth(device: PreviewDevice): number | undefined {
  const match = DEVICES.find((entry) => entry.id === device);
  return match?.width ?? undefined;
}
