"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import {
  AlignCenter,
  AlignLeft,
  Bold,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";
import { sanitizeBlogHtml } from "@/lib/blog/html";
import { uploadImageFile } from "@/lib/image-upload";

type ToolbarAction =
  | { kind: "command"; icon: ReactNode; command: string; title: string; value?: string }
  | { kind: "link"; icon: ReactNode; title: string }
  | { kind: "unlink"; icon: ReactNode; title: string }
  | { kind: "image"; icon: ReactNode; title: string }
  | { kind: "separator" };

const ICON_SIZE = 17;
const ICON_STROKE = 1.75;

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { kind: "command", icon: <Bold size={ICON_SIZE} strokeWidth={ICON_STROKE} />, command: "bold", title: "Bold" },
  { kind: "command", icon: <Italic size={ICON_SIZE} strokeWidth={ICON_STROKE} />, command: "italic", title: "Italic" },
  { kind: "command", icon: <Underline size={ICON_SIZE} strokeWidth={ICON_STROKE} />, command: "underline", title: "Underline" },
  { kind: "command", icon: <Strikethrough size={ICON_SIZE} strokeWidth={ICON_STROKE} />, command: "strikeThrough", title: "Strikethrough" },
  { kind: "separator" },
  { kind: "command", icon: <Pilcrow size={ICON_SIZE} strokeWidth={ICON_STROKE} />, command: "formatBlock", value: "p", title: "Paragraph" },
  { kind: "command", icon: <Heading2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />, command: "formatBlock", value: "h2", title: "Heading 2" },
  { kind: "command", icon: <Heading3 size={ICON_SIZE} strokeWidth={ICON_STROKE} />, command: "formatBlock", value: "h3", title: "Heading 3" },
  { kind: "command", icon: <Quote size={ICON_SIZE} strokeWidth={ICON_STROKE} />, command: "formatBlock", value: "blockquote", title: "Quote" },
  { kind: "command", icon: <Minus size={ICON_SIZE} strokeWidth={ICON_STROKE} />, command: "insertHorizontalRule", title: "Divider" },
  { kind: "separator" },
  { kind: "command", icon: <List size={ICON_SIZE} strokeWidth={ICON_STROKE} />, command: "insertUnorderedList", title: "Bullet list" },
  { kind: "command", icon: <ListOrdered size={ICON_SIZE} strokeWidth={ICON_STROKE} />, command: "insertOrderedList", title: "Numbered list" },
  { kind: "separator" },
  { kind: "link", icon: <Link size={ICON_SIZE} strokeWidth={ICON_STROKE} />, title: "Add link" },
  { kind: "unlink", icon: <Link2Off size={ICON_SIZE} strokeWidth={ICON_STROKE} />, title: "Remove link" },
  { kind: "image", icon: <Image size={ICON_SIZE} strokeWidth={ICON_STROKE} />, title: "Insert image" },
  { kind: "separator" },
  { kind: "command", icon: <AlignLeft size={ICON_SIZE} strokeWidth={ICON_STROKE} />, command: "justifyLeft", title: "Align left" },
  { kind: "command", icon: <AlignCenter size={ICON_SIZE} strokeWidth={ICON_STROKE} />, command: "justifyCenter", title: "Align center" },
];

function saveSelection(container: HTMLElement) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) {
    return null;
  }

  return range.cloneRange();
}

function restoreSelection(range: Range | null) {
  if (!range) {
    return;
  }

  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  selection.removeAllRanges();
  selection.addRange(range);
}

export default function BlogRichTextEditor({
  value,
  onChange,
  editorKey,
  placeholder = "Tell your story…",
  variant = "medium",
}: {
  value: string;
  onChange: (html: string) => void;
  editorKey: string;
  placeholder?: string;
  variant?: "default" | "medium";
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMedium = variant === "medium";

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || "";
    }
  }, [editorKey]);

  const handleInput = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? "";
    onChange(sanitizeBlogHtml(html));
  }, [onChange]);

  const runCommand = useCallback(
    async (action: ToolbarAction) => {
      if (action.kind === "separator") {
        return;
      }

      const editor = editorRef.current;
      if (!editor) {
        return;
      }

      const savedRange = saveSelection(editor);
      editor.focus();
      restoreSelection(savedRange);

      if (action.kind === "link") {
        const url = window.prompt("Enter URL");
        if (url) {
          document.execCommand("createLink", false, url);
        }
      } else if (action.kind === "unlink") {
        document.execCommand("unlink");
      } else if (action.kind === "image") {
        fileInputRef.current?.click();
        return;
      } else {
        document.execCommand(action.command, false, action.value);
      }

      handleInput();
    },
    [handleInput],
  );

  const handleImageUpload = useCallback(
    async (file: File) => {
      const editor = editorRef.current;
      if (!editor) {
        return;
      }

      const savedRange = saveSelection(editor);
      editor.focus();
      restoreSelection(savedRange);

      try {
        const url = await uploadImageFile(file);
        document.execCommand("insertImage", false, url);
        handleInput();
      } catch {
        window.alert("Failed to upload image. Try again or paste an image URL.");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [handleInput],
  );

  return (
    <div className={`blog-editor${isMedium ? " blog-editor--medium" : ""}`}>
      <div className="blog-editor__toolbar" role="toolbar" aria-label="Formatting">
        {TOOLBAR_ACTIONS.map((action, index) =>
          action.kind === "separator" ? (
            <span key={`sep-${index}`} className="blog-editor__toolbar-sep" aria-hidden />
          ) : (
            <button
              key={action.title}
              type="button"
              className="blog-editor__toolbar-btn"
              title={action.title}
              aria-label={action.title}
              onMouseDown={(event) => {
                event.preventDefault();
                void runCommand(action);
              }}
            >
              {action.icon}
            </button>
          ),
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleImageUpload(file);
          }
        }}
      />
      <div
        ref={editorRef}
        className="blog-editor__body"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
      />
    </div>
  );
}
