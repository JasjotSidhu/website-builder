"use client";

import { Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createPreviewObjectUrl,
  readImageFileAsDataUrl,
} from "@/lib/image-upload";
import FloatingPopover from "./FloatingPopover";
import { PopoverActions, PopoverField, PopoverShell } from "./PopoverShell";

interface ImageUrlPopoverProps {
  anchorEl: HTMLElement | null;
  value: string;
  altValue?: string;
  titleValue?: string;
  showSeoFields?: boolean;
  onSave: (url: string, alt: string, title: string) => void;
  onCancel: () => void;
}

export default function ImageUrlPopover({
  anchorEl,
  value,
  altValue = "",
  titleValue = "",
  showSeoFields = true,
  onSave,
  onCancel,
}: ImageUrlPopoverProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filePickerBusyRef = useRef(false);
  const isUploadingRef = useRef(false);
  const previewObjectUrlRef = useRef<string | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(value);
  const [previewSrc, setPreviewSrc] = useState(value);
  const [alt, setAlt] = useState(altValue);
  const [title, setTitle] = useState(titleValue);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const clearPreviewObjectUrl = useCallback(() => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    urlInputRef.current?.focus();
  }, []);

  useEffect(() => {
    isUploadingRef.current = isUploading;
  }, [isUploading]);

  useEffect(() => clearPreviewObjectUrl, [clearPreviewObjectUrl]);

  const handleCancel = useCallback(() => {
    clearPreviewObjectUrl();
    onCancel();
  }, [clearPreviewObjectUrl, onCancel]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (filePickerBusyRef.current || isUploadingRef.current) {
        return;
      }

      const target = event.target as Node;
      if (shellRef.current?.contains(target)) {
        return;
      }
      if (anchorEl?.contains(target)) {
        return;
      }
      if ((target as Element).closest?.("[data-image-popover]")) {
        return;
      }
      handleCancel();
    };

    const timeout = window.setTimeout(() => {
      document.addEventListener("pointerdown", handlePointerDown);
    }, 0);

    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [anchorEl, handleCancel]);

  const openFilePicker = () => {
    if (isUploading) {
      return;
    }

    filePickerBusyRef.current = true;
    fileInputRef.current?.click();

    const handleWindowFocus = () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.setTimeout(() => {
        filePickerBusyRef.current = false;
      }, 400);
    };

    window.addEventListener("focus", handleWindowFocus);
  };

  const handleFile = async (file: File | undefined) => {
    filePickerBusyRef.current = false;

    if (!file) {
      return;
    }

    clearPreviewObjectUrl();
    setIsUploading(true);
    setUploadError(null);

    const objectUrl = createPreviewObjectUrl(file);
    previewObjectUrlRef.current = objectUrl;
    setPreviewSrc(objectUrl);

    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      clearPreviewObjectUrl();
      setUrl(dataUrl);
      setPreviewSrc(dataUrl);
    } catch (error) {
      clearPreviewObjectUrl();
      setPreviewSrc(url);
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (isUploading || !url.trim()) {
      return;
    }
    onSave(url.trim(), alt.trim(), title.trim());
  };

  const showPreview = Boolean(previewSrc);

  const popover = (
    <PopoverShell
      ref={shellRef}
      title="Image"
      variant="editor"
      compact
      className="popover--editor-floating"
      onClose={handleCancel}
      onMouseDown={(event) => event.stopPropagation()}
      footer={
        <PopoverActions
          onCancel={handleCancel}
          onSave={handleSave}
          saveDisabled={isUploading || !url.trim()}
          saveLabel={isUploading ? "Uploading…" : "Save"}
        />
      }
    >
      <div className="popover-image-form">
        {showPreview ? (
          <div className="popover-image-preview popover-image-preview--xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt=""
              className="popover-image-preview__img"
            />
          </div>
        ) : null}

        <div className="popover-image-upload">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,.jpg,.jpeg,.png,.gif,.webp,.svg"
            className="popover-image-upload__input"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              void handleFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            className={`popover-image-upload__dropzone${isUploading ? " popover-image-upload__dropzone--loading" : ""}`}
            disabled={isUploading}
            onClick={openFilePicker}
            onDragOver={(event) => {
              event.preventDefault();
              event.currentTarget.classList.add("popover-image-upload__dropzone--active");
            }}
            onDragLeave={(event) => {
              event.currentTarget.classList.remove("popover-image-upload__dropzone--active");
            }}
            onDrop={(event) => {
              event.preventDefault();
              event.currentTarget.classList.remove("popover-image-upload__dropzone--active");
              void handleFile(event.dataTransfer.files?.[0]);
            }}
          >
            <Upload size={16} strokeWidth={1.75} aria-hidden />
            <span>{isUploading ? "Uploading…" : "Drop image or browse"}</span>
          </button>
          {uploadError ? (
            <p className="popover-image-upload__error" role="alert">
              {uploadError}
            </p>
          ) : null}
        </div>

        <p className="popover-image-upload__hint">or paste a URL</p>

        <PopoverField label="URL">
          <input
            ref={urlInputRef}
            type="text"
            value={url}
            className="popover-input"
            placeholder="https://... or uploaded image"
            onChange={(event) => {
              const next = event.target.value;
              setUrl(next);
              setPreviewSrc(next);
              setUploadError(null);
            }}
          />
        </PopoverField>

        {showSeoFields ? (
          <>
            <PopoverField label="Alt text">
              <input
                type="text"
                value={alt}
                className="popover-input"
                placeholder="Image description"
                onChange={(event) => setAlt(event.target.value)}
              />
            </PopoverField>
            <PopoverField label="Title" hint="Shown on hover; helps SEO">
              <input
                type="text"
                value={title}
                className="popover-input"
                placeholder="Optional title"
                onChange={(event) => setTitle(event.target.value)}
              />
            </PopoverField>
          </>
        ) : null}
      </div>
    </PopoverShell>
  );

  return (
    <FloatingPopover
      anchorEl={anchorEl}
      open
      placement="below"
      align="end"
      dataAttribute="data-image-popover"
      className="popover-floating-anchor"
    >
      {popover}
    </FloatingPopover>
  );
}
