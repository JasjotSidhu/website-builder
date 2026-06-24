"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import ColorSwatchInput from "./ColorSwatchInput";
import FloatingToolbar from "./FloatingToolbar";
import {
  applyHighlight,
  clearHighlightOnSelection,
  syncRichTextFields,
  type HighlightMode,
} from "./rich-text";
import {
  FONT_OPTIONS,
  getFontOptionLabel,
  getHighlightFontOptionLabel,
  HIGHLIGHT_FONT_OPTIONS,
  TAG_OPTIONS,
} from "./text-toolbar-options";

type ToolbarTab = "style" | "highlight";

interface InlineTextToolbarProps {
  defaultTag: string;
  tag?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  defaultColor: string;
  anchorEl: HTMLElement | null;
  editorEl: HTMLElement | null;
  onTagChange: (value?: string) => void;
  onFontChange: (value?: string) => void;
  onFontSizeChange: (value?: number) => void;
  onColorChange: (value?: string) => void;
  onContentChange: (text: string, html: string) => void;
}

function preserveSelection(event: React.MouseEvent) {
  event.preventDefault();
}

function ToolbarDropdown({
  label,
  valueLabel,
  open,
  onToggle,
  onClose,
  children,
}: {
  label: string;
  valueLabel: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) {
        return;
      }
      onClose();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onClose]);

  return (
    <div className="popover-toolbar-field" ref={menuRef}>
      <span className="popover-toolbar-label">{label}</span>
      <div className="popover-toolbar-select">
        <button
          type="button"
          className={`popover-toolbar-select-btn${open ? " popover-toolbar-select-btn--open" : ""}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          onMouseDown={preserveSelection}
          onClick={onToggle}
        >
          <span className="popover-toolbar-tag-value">{valueLabel}</span>
          <ChevronDown size={14} strokeWidth={2} aria-hidden />
        </button>
        {open ? children : null}
      </div>
    </div>
  );
}

export default function InlineTextToolbar({
  defaultTag,
  tag,
  fontFamily,
  fontSize,
  color,
  defaultColor,
  anchorEl,
  editorEl,
  onTagChange,
  onFontChange,
  onFontSizeChange,
  onColorChange,
  onContentChange,
}: InlineTextToolbarProps) {
  const [activeTab, setActiveTab] = useState<ToolbarTab>("style");
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [highlightFontMenuOpen, setHighlightFontMenuOpen] = useState(false);
  const [highlightMode, setHighlightMode] = useState<HighlightMode>("solid");
  const [highlightColor, setHighlightColor] = useState("#e11d48");
  const [highlightFont, setHighlightFont] = useState("");
  const [gradientFrom, setGradientFrom] = useState("#7c3aed");
  const [gradientTo, setGradientTo] = useState("#ec4899");
  const [highlightMessage, setHighlightMessage] = useState<string | null>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const hasOverrides = Boolean(tag || fontFamily || fontSize || color);

  const activeTagLabel = tag
    ? TAG_OPTIONS.find((option) => option.value === tag)?.label ?? tag.toUpperCase()
    : defaultTag.toUpperCase();

  const activeFontLabel = getFontOptionLabel(fontFamily);

  useEffect(() => {
    if (!editorEl) {
      return;
    }

    const trackSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return;
      }

      const range = selection.getRangeAt(0);
      if (editorEl.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    };

    document.addEventListener("selectionchange", trackSelection);
    return () => document.removeEventListener("selectionchange", trackSelection);
  }, [editorEl]);

  const syncEditorContent = () => {
    if (!editorEl) {
      return;
    }
    const next = syncRichTextFields(editorEl);
    onContentChange(next.text, next.html);
  };

  const handleApplyHighlight = () => {
    if (!editorEl) {
      setHighlightMessage("Click the text first");
      return;
    }

    const fallbackRange = savedRangeRef.current;
    const applied = applyHighlight(
      editorEl,
      {
        mode: highlightMode,
        color: highlightMode === "solid" ? highlightColor : undefined,
        gradientFrom: highlightMode === "gradient" ? gradientFrom : undefined,
        gradientTo: highlightMode === "gradient" ? gradientTo : undefined,
        fontFamily:
          highlightMode === "font" ? highlightFont || undefined : highlightFont || undefined,
      },
      fallbackRange,
    );

    if (!applied) {
      setHighlightMessage(
        highlightMode === "font"
          ? "Select text and choose a font"
          : "Select text to highlight",
      );
      return;
    }

    setHighlightMessage(null);
    syncEditorContent();
  };

  const handleClearHighlight = () => {
    if (!editorEl) {
      return;
    }

    const cleared = clearHighlightOnSelection(editorEl, savedRangeRef.current);
    if (!cleared) {
      setHighlightMessage("Select highlighted text to clear");
      return;
    }

    setHighlightMessage(null);
    syncEditorContent();
  };

  return (
    <FloatingToolbar anchorEl={anchorEl} open={Boolean(anchorEl)}>
      <div role="toolbar" aria-label="Text formatting">
      <div className="popover-toolbar-topbar">
        <div className="popover-toolbar-tabs" role="tablist" aria-label="Text formatting tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "style"}
            className={`popover-toolbar-tabs__btn${activeTab === "style" ? " popover-toolbar-tabs__btn--active" : ""}`}
            onMouseDown={preserveSelection}
            onClick={() => {
              setTagMenuOpen(false);
              setFontMenuOpen(false);
              setHighlightFontMenuOpen(false);
              setActiveTab("style");
            }}
          >
            Text
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "highlight"}
            className={`popover-toolbar-tabs__btn${activeTab === "highlight" ? " popover-toolbar-tabs__btn--active" : ""}`}
            onMouseDown={preserveSelection}
            onClick={() => {
              setTagMenuOpen(false);
              setFontMenuOpen(false);
              setHighlightFontMenuOpen(false);
              setActiveTab("highlight");
            }}
          >
            Highlight
          </button>
        </div>
      </div>

      <div className="popover-toolbar-panel">
        {activeTab === "style" ? (
          <div className="popover-toolbar-stack">
            <ToolbarDropdown
              label="Tag"
              valueLabel={activeTagLabel}
              open={tagMenuOpen}
              onToggle={() => {
                setFontMenuOpen(false);
                setTagMenuOpen((open) => !open);
              }}
              onClose={() => setTagMenuOpen(false)}
            >
              <ul className="popover-toolbar-menu" role="listbox">
                <li role="option" aria-selected={!tag}>
                  <button
                    type="button"
                    className={!tag ? "is-active" : undefined}
                    onMouseDown={preserveSelection}
                    onClick={() => {
                      onTagChange(undefined);
                      setTagMenuOpen(false);
                    }}
                  >
                    Default ({defaultTag.toUpperCase()})
                  </button>
                </li>
                {TAG_OPTIONS.map((option) => (
                  <li key={option.value} role="option" aria-selected={tag === option.value}>
                    <button
                      type="button"
                      className={tag === option.value ? "is-active" : undefined}
                      onMouseDown={preserveSelection}
                      onClick={() => {
                        onTagChange(option.value);
                        setTagMenuOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            </ToolbarDropdown>

            <ToolbarDropdown
              label="Font"
              valueLabel={activeFontLabel}
              open={fontMenuOpen}
              onToggle={() => {
                setTagMenuOpen(false);
                setFontMenuOpen((open) => !open);
              }}
              onClose={() => setFontMenuOpen(false)}
            >
              <ul className="popover-toolbar-menu" role="listbox">
                {FONT_OPTIONS.map((option) => (
                  <li
                    key={option.label}
                    role="option"
                    aria-selected={(fontFamily ?? "") === option.value}
                  >
                    <button
                      type="button"
                      className={(fontFamily ?? "") === option.value ? "is-active" : undefined}
                      style={option.value ? { fontFamily: option.value } : undefined}
                      onMouseDown={preserveSelection}
                      onClick={() => {
                        onFontChange(option.value || undefined);
                        setFontMenuOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            </ToolbarDropdown>

            <label className="popover-toolbar-field">
              <span className="popover-toolbar-label">Size</span>
              <input
                type="number"
                className="popover-input popover-input--toolbar-size"
                min={10}
                max={96}
                placeholder="Auto"
                aria-label="Font size"
                value={fontSize ?? ""}
                onMouseDown={preserveSelection}
                onChange={(event) =>
                  onFontSizeChange(event.target.value ? Number(event.target.value) : undefined)
                }
              />
            </label>

            <div className="popover-toolbar-field">
              <span className="popover-toolbar-label">Color</span>
              <ColorSwatchInput
                value={color ?? defaultColor}
                fallback={defaultColor}
                onChange={onColorChange}
              />
            </div>

            {hasOverrides ? (
              <button
                type="button"
                className="popover-btn popover-btn--ghost popover-btn--xs popover-toolbar-reset"
                onMouseDown={preserveSelection}
                onClick={() => {
                  onTagChange(undefined);
                  onFontChange(undefined);
                  onFontSizeChange(undefined);
                  onColorChange(undefined);
                }}
              >
                Reset all
              </button>
            ) : null}
          </div>
        ) : null}

        {activeTab === "highlight" ? (
          <div className="popover-toolbar-stack">
            <div className="popover-toolbar-field popover-toolbar-field--highlight">
              <div className="popover-toolbar-segmented" role="group" aria-label="Highlight type">
                <button
                  type="button"
                  className={`popover-toolbar-segmented__btn${highlightMode === "solid" ? " is-active" : ""}`}
                  aria-pressed={highlightMode === "solid"}
                  onMouseDown={preserveSelection}
                  onClick={() => setHighlightMode("solid")}
                >
                  Color
                </button>
                <button
                  type="button"
                  className={`popover-toolbar-segmented__btn${highlightMode === "gradient" ? " is-active" : ""}`}
                  aria-pressed={highlightMode === "gradient"}
                  onMouseDown={preserveSelection}
                  onClick={() => setHighlightMode("gradient")}
                >
                  Gradient
                </button>
                <button
                  type="button"
                  className={`popover-toolbar-segmented__btn${highlightMode === "font" ? " is-active" : ""}`}
                  aria-pressed={highlightMode === "font"}
                  onMouseDown={preserveSelection}
                  onClick={() => setHighlightMode("font")}
                >
                  Font
                </button>
              </div>

              {highlightMode === "solid" ? (
                <div className="popover-toolbar-field">
                  <span className="popover-toolbar-label">Color</span>
                  <ColorSwatchInput value={highlightColor} onChange={setHighlightColor} />
                </div>
              ) : null}

              {highlightMode === "gradient" ? (
                <div className="popover-toolbar-field">
                  <span className="popover-toolbar-label">Gradient</span>
                  <div className="popover-toolbar-highlight-controls">
                    <ColorSwatchInput value={gradientFrom} onChange={setGradientFrom} />
                    <ColorSwatchInput value={gradientTo} onChange={setGradientTo} />
                  </div>
                </div>
              ) : null}

              {highlightMode === "font" ? (
                <ToolbarDropdown
                  label="Font"
                  valueLabel={getHighlightFontOptionLabel(highlightFont)}
                  open={highlightFontMenuOpen}
                  onToggle={() => setHighlightFontMenuOpen((open) => !open)}
                  onClose={() => setHighlightFontMenuOpen(false)}
                >
                  <ul className="popover-toolbar-menu" role="listbox">
                    {HIGHLIGHT_FONT_OPTIONS.map((option) => (
                      <li
                        key={option.label}
                        role="option"
                        aria-selected={highlightFont === option.value}
                      >
                        <button
                          type="button"
                          className={highlightFont === option.value ? "is-active" : undefined}
                          style={{ fontFamily: option.value }}
                          onMouseDown={preserveSelection}
                          onClick={() => {
                            setHighlightFont(option.value);
                            setHighlightFontMenuOpen(false);
                          }}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </ToolbarDropdown>
              ) : (
                <ToolbarDropdown
                  label="Font (optional)"
                  valueLabel={getHighlightFontOptionLabel(highlightFont)}
                  open={highlightFontMenuOpen}
                  onToggle={() => setHighlightFontMenuOpen((open) => !open)}
                  onClose={() => setHighlightFontMenuOpen(false)}
                >
                  <ul className="popover-toolbar-menu" role="listbox">
                    <li role="option" aria-selected={!highlightFont}>
                      <button
                        type="button"
                        className={!highlightFont ? "is-active" : undefined}
                        onMouseDown={preserveSelection}
                        onClick={() => {
                          setHighlightFont("");
                          setHighlightFontMenuOpen(false);
                        }}
                      >
                        Keep current font
                      </button>
                    </li>
                    {HIGHLIGHT_FONT_OPTIONS.map((option) => (
                      <li
                        key={option.label}
                        role="option"
                        aria-selected={highlightFont === option.value}
                      >
                        <button
                          type="button"
                          className={highlightFont === option.value ? "is-active" : undefined}
                          style={{ fontFamily: option.value }}
                          onMouseDown={preserveSelection}
                          onClick={() => {
                            setHighlightFont(option.value);
                            setHighlightFontMenuOpen(false);
                          }}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </ToolbarDropdown>
              )}

              <button
                type="button"
                className="popover-btn popover-btn--primary popover-btn--xs popover-toolbar-apply"
                onMouseDown={preserveSelection}
                onClick={handleApplyHighlight}
              >
                Apply
              </button>

              <p className="popover-toolbar-hint">Select text, then apply highlight</p>
              <button
                type="button"
                className="popover-btn popover-btn--ghost popover-btn--xs popover-toolbar-clear"
                onMouseDown={preserveSelection}
                onClick={handleClearHighlight}
              >
                Clear highlight
              </button>
              {highlightMessage ? (
                <p className="popover-toolbar-message">{highlightMessage}</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      </div>
    </FloatingToolbar>
  );
}
