"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { rgbToHex } from "@/lib/color-utils";
import type { ButtonToolbarSettings } from "./button-toolbar-settings";
import ButtonToolbar from "./ButtonToolbar";
import { useEditMode } from "./EditModeContext";
import InlineTextToolbar from "./InlineTextToolbar";
import { hasRichTextMarkup, sanitizeRichTextHtml } from "./rich-text";
import { useSectionData } from "./SectionDataContext";
import { useTextColorStyle } from "@/lib/traits/hooks";
import { getThemeTextColorVar, type ThemeTextRole } from "@/lib/theme-text-color";

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
  /** Shown when the stored value is empty (e.g. legacy sections without this field). */
  fallback?: string;
  /** Global theme text token — section uses auto-contrast when omitted. */
  themeTextRole?: ThemeTextRole;
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

  element.textContent = value;
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
  fallback,
  themeTextRole,
}: EditableTextProps) {
  const { isEditing } = useEditMode();
  const { data, updateField, updateFields } = useSectionData();
  const sectionTextColor = useTextColorStyle();
  const [active, setActive] = useState(false);
  const [editorEl, setEditorEl] = useState<HTMLElement | null>(null);
  const [toolbarAnchorEl, setToolbarAnchorEl] = useState<HTMLElement | null>(null);
  const [inheritedTextColor, setInheritedTextColor] = useState("#111111");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLElement | null>(null);
  const initializedKeyRef = useRef<string | null>(null);
  const seedContentRef = useRef({ value: "", html: undefined as string | undefined });

  const value = String(data[dataKey] ?? "");
  const displayValue = value.trim() ? value : (fallback ?? "");
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
  const isButtonLabel = Boolean(buttonSettings);
  const Tag = (isButtonLabel ? "span" : tagOverride || defaultTag) as EditableTag;
  const fontSizeNum =
    fontSizeOverride != null && fontSizeOverride !== ""
      ? Number(fontSizeOverride)
      : undefined;
  const editorInstanceKey = `${dataKey}:${Tag}`;

  seedContentRef.current = { value: displayValue, html: htmlValue };

  const toolbarDefaultColor = isButtonLabel
    ? inheritedTextColor
    : inheritSectionColor
      ? getThemeTextColorVar(themeTextRole) ?? sectionTextColor
      : inheritedTextColor;

  const resolvedTextColor = isButtonLabel
    ? colorOverride
      ? String(colorOverride)
      : undefined
    : colorOverride
      ? String(colorOverride)
      : getThemeTextColorVar(themeTextRole) ??
        (inheritSectionColor ? sectionTextColor : undefined);

  const style: React.CSSProperties = {
    ...(resolvedTextColor ? { color: resolvedTextColor } : {}),
    ...(!isButtonLabel && fontFamily ? { fontFamily } : {}),
    ...(!isButtonLabel && fontSizeNum && !Number.isNaN(fontSizeNum)
      ? { fontSize: `${fontSizeNum}px` }
      : {}),
  };

  useLayoutEffect(() => {
    if (!isEditing) {
      initializedKeyRef.current = null;
      return;
    }

    const element = editorRef.current;
    if (!element || initializedKeyRef.current === editorInstanceKey) {
      return;
    }

    initializeEditorContent(
      element,
      seedContentRef.current.value,
      seedContentRef.current.html,
    );
    initializedKeyRef.current = editorInstanceKey;
  }, [isEditing, editorInstanceKey]);

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
    if (hasRichTextMarkup(html)) {
      updateFields({
        [dataKey]: text,
        [`${dataKey}Html`]: html,
      });
      return;
    }

    updateFields({
      [dataKey]: text,
      [`${dataKey}Html`]: undefined,
    });
  };

  const assignEditorRef = useCallback((element: HTMLElement | null) => {
    editorRef.current = element;
  }, []);

  if (!isEditing) {
    if (!displayValue) {
      return null;
    }

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
        {displayValue}
      </Tag>
    );
  }

  const wrapperClass = BLOCK_TAGS.has(defaultTag)
    ? "editable-text-wrapper editable-text-wrapper--block"
    : "editable-text-wrapper";

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
        key={editorInstanceKey}
        ref={assignEditorRef as never}
        style={style}
        className={`${className ?? ""} editable-field ${
          required && !value.trim() ? "editable-field--empty" : ""
        }`.trim()}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => {
          setActive(true);
          setEditorEl(editorRef.current);
        }}
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
