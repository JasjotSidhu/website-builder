"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { rgbToHex } from "@/lib/color-utils";
import type { ButtonToolbarSettings } from "./button-toolbar-settings";
import ButtonToolbar from "./ButtonToolbar";
import { useEditMode } from "./EditModeContext";
import InlineTextToolbar from "./InlineTextToolbar";
import { hasRichTextMarkup, sanitizeRichTextHtml } from "./rich-text";
import { useSectionData } from "./SectionDataContext";
import { useTextColorStyle } from "@/lib/traits/hooks";

type EditableTag = "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div";

const BLOCK_TAGS = new Set<EditableTag>(["p", "h1", "h2", "h3", "h4", "div"]);

interface EditableTextProps {
  dataKey: string;
  maxLength: number;
  required?: boolean;
  as?: EditableTag;
  className?: string;
  /** When false, text color comes from parent styles (e.g. buttons) unless explicitly overridden. */
  inheritSectionColor?: boolean;
  /** Element to read the inherited text color from (e.g. button wrapper). */
  colorSourceRef?: RefObject<HTMLElement | null>;
  /** Element to anchor the floating toolbar (defaults to the editable element). */
  toolbarAnchorRef?: RefObject<HTMLElement | null>;
  /** Merges button variant/link settings into the text toolbar. */
  buttonSettings?: ButtonToolbarSettings;
}

function initializeEditorContent(
  element: HTMLElement,
  value: string,
  htmlValue?: string,
) {
  if (htmlValue && hasRichTextMarkup(htmlValue)) {
    element.innerHTML = sanitizeRichTextHtml(htmlValue);
    return;
  }

  if (value) {
    element.textContent = value;
  }
}

export default function EditableText({
  dataKey,
  maxLength,
  required = true,
  as: defaultTag = "span",
  className,
  inheritSectionColor = true,
  colorSourceRef,
  toolbarAnchorRef,
  buttonSettings,
}: EditableTextProps) {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const sectionTextColor = useTextColorStyle();
  const [active, setActive] = useState(false);
  const [editorEl, setEditorEl] = useState<HTMLElement | null>(null);
  const [toolbarAnchorEl, setToolbarAnchorEl] = useState<HTMLElement | null>(null);
  const [inheritedTextColor, setInheritedTextColor] = useState("#111111");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentReadyRef = useRef(false);

  const value = String(data[dataKey] ?? "");
  const htmlOverride = data[`${dataKey}Html`];
  const htmlValue = typeof htmlOverride === "string" ? htmlOverride : undefined;
  const colorOverride = data[`${dataKey}Color`];
  const rawTag = data[`${dataKey}Tag`];
  const tagOverride = rawTag && String(rawTag) !== "" ? String(rawTag) : undefined;
  const fontFamilyOverride = data[`${dataKey}FontFamily`];
  const fontFamily =
    fontFamilyOverride && String(fontFamilyOverride) !== ""
      ? String(fontFamilyOverride)
      : undefined;
  const fontSizeOverride = data[`${dataKey}FontSize`];
  const Tag = (tagOverride || defaultTag) as EditableTag;
  const fontSizeNum =
    fontSizeOverride != null && fontSizeOverride !== ""
      ? Number(fontSizeOverride)
      : undefined;

  const toolbarDefaultColor = inheritSectionColor ? sectionTextColor : inheritedTextColor;

  const style: React.CSSProperties = {
    ...(colorOverride
      ? { color: String(colorOverride) }
      : inheritSectionColor
        ? { color: sectionTextColor }
        : {}),
    ...(fontFamily ? { fontFamily } : {}),
    ...(fontSizeNum && !Number.isNaN(fontSizeNum) ? { fontSize: `${fontSizeNum}px` } : {}),
  };

  useLayoutEffect(() => {
    if (inheritSectionColor) {
      return;
    }

    const source = colorSourceRef?.current ?? editorEl;
    if (!source) {
      return;
    }

    const computed = getComputedStyle(source).color;
    setInheritedTextColor(rgbToHex(computed) ?? "#111111");
  }, [
    inheritSectionColor,
    colorSourceRef,
    editorEl,
    buttonSettings?.variant,
    active,
  ]);

  useLayoutEffect(() => {
    setToolbarAnchorEl(toolbarAnchorRef?.current ?? editorEl);
  }, [toolbarAnchorRef, editorEl, buttonSettings?.variant, active]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target)) {
        return;
      }
      if ((target as Element).closest?.("[data-inline-text-toolbar]")) {
        return;
      }
      setActive(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [active]);

  const handleContentChange = (text: string, html: string) => {
    updateField(dataKey, text);
    if (hasRichTextMarkup(html)) {
      updateField(`${dataKey}Html`, html);
    } else {
      updateField(`${dataKey}Html`, undefined);
    }
  };

  if (!isEditing) {
    if (htmlValue && hasRichTextMarkup(htmlValue)) {
      return (
        <Tag
          className={className}
          style={style}
          dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(htmlValue) }}
        />
      );
    }

    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  const wrapperClass = BLOCK_TAGS.has(defaultTag)
    ? "editable-text-wrapper editable-text-wrapper--block"
    : "editable-text-wrapper";

  const handleEditorRef = (element: HTMLElement | null) => {
    setEditorEl(element);

    if (!element) {
      contentReadyRef.current = false;
      return;
    }

    if (!contentReadyRef.current) {
      initializeEditorContent(element, value, htmlValue);
      contentReadyRef.current = true;
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`${wrapperClass}${active ? " editable-text-wrapper--active" : ""}`}
    >
      {active ? (
        buttonSettings ? (
          <ButtonToolbar anchorEl={toolbarAnchorEl} settings={buttonSettings} />
        ) : (
          <InlineTextToolbar
            defaultTag={defaultTag}
            tag={tagOverride}
            fontFamily={fontFamily}
            fontSize={fontSizeNum}
            color={colorOverride as string | undefined}
            defaultColor={toolbarDefaultColor}
            anchorEl={toolbarAnchorEl}
            editorEl={editorEl}
            onTagChange={(next) => updateField(`${dataKey}Tag`, next)}
            onFontChange={(next) => updateField(`${dataKey}FontFamily`, next)}
            onFontSizeChange={(next) => updateField(`${dataKey}FontSize`, next)}
            onColorChange={(next) => updateField(`${dataKey}Color`, next)}
            onContentChange={handleContentChange}
          />
        )
      ) : null}
      <Tag
        key={String(tagOverride ?? defaultTag)}
        ref={handleEditorRef}
        style={style}
        className={`${className ?? ""} editable-field ${
          required && !value.trim() ? "editable-field--empty" : ""
        }`.trim()}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setActive(true)}
        onInput={(event) => {
          const element = event.currentTarget;
          const text = element.textContent ?? "";
          if (text.length > maxLength) {
            element.textContent = text.slice(0, maxLength);
          }
          if (buttonSettings) {
            updateField(dataKey, element.textContent ?? "");
            return;
          }
          handleContentChange(element.textContent ?? "", element.innerHTML);
        }}
      />
    </div>
  );
}
