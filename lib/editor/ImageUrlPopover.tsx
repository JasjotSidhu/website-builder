"use client";

import { useEffect, useRef } from "react";

interface ImageUrlPopoverProps {
  value: string;
  altValue?: string;
  onSave: (url: string, alt: string) => void;
  onCancel: () => void;
}

export default function ImageUrlPopover({
  value,
  altValue = "",
  onSave,
  onCancel,
}: ImageUrlPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    urlRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onCancel]);

  return (
    <div ref={ref} className="editor-popover" role="dialog" aria-label="Edit image">
      <label className="editor-popover-label">
        Image URL
        <input
          ref={urlRef}
          type="url"
          defaultValue={value}
          className="editor-popover-input"
          placeholder="https://..."
        />
      </label>
      <label className="editor-popover-label">
        Alt text
        <input
          type="text"
          defaultValue={altValue}
          className="editor-popover-input"
          placeholder="Describe the image"
        />
      </label>
      <div className="editor-popover-actions">
        <button type="button" className="editor-popover-btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="editor-popover-btn editor-popover-btn--primary"
          onClick={() => {
            const url = urlRef.current?.value ?? "";
            const altInput = ref.current?.querySelector<HTMLInputElement>(
              'input[type="text"]',
            );
            onSave(url, altInput?.value ?? "");
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
