const ALLOWED_STYLE_PROPS = new Set([
  "color",
  "font-family",
  "background-image",
  "background-clip",
  "-webkit-background-clip",
  "display",
]);

const HIGHLIGHT_CLASS = "editable-text-highlight";

function filterInlineStyle(style: string): string {
  return style
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .filter((chunk) => {
      const [prop] = chunk.split(":").map((part) => part.trim().toLowerCase());
      return ALLOWED_STYLE_PROPS.has(prop);
    })
    .join("; ");
}

export function hasRichTextMarkup(html?: string): boolean {
  return Boolean(html && html.includes("<"));
}

export function sanitizeRichTextHtml(html: string): string {
  if (!html || !html.includes("<")) {
    return html;
  }

  if (typeof window === "undefined") {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<(?!\/?span\b)[^>]+>/gi, "");
  }

  const template = document.createElement("template");
  template.innerHTML = html.replace(/<script[\s\S]*?<\/script>/gi, "");

  const walk = (node: Node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement;
        if (element.tagName !== "SPAN") {
          while (element.firstChild) {
            element.parentNode?.insertBefore(element.firstChild, element);
          }
          element.remove();
          continue;
        }

        const safeStyle = filterInlineStyle(element.getAttribute("style") ?? "");
        if (safeStyle) {
          element.setAttribute("style", safeStyle);
          element.classList.add(HIGHLIGHT_CLASS);
        } else {
          element.removeAttribute("style");
          element.classList.remove(HIGHLIGHT_CLASS);
        }

        if (!element.className) {
          element.removeAttribute("class");
        }
      }

      if (child.hasChildNodes()) {
        walk(child);
      }
    }
  };

  walk(template.content);
  return template.innerHTML;
}

function getSelectionRangeInRoot(
  root: HTMLElement,
  fallbackRange?: Range | null,
): Range | null {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
    const range = selection.getRangeAt(0);
    if (root.contains(range.commonAncestorContainer)) {
      return range;
    }
  }

  if (
    fallbackRange &&
    !fallbackRange.collapsed &&
    root.contains(fallbackRange.commonAncestorContainer)
  ) {
    return fallbackRange;
  }

  return null;
}

function wrapRange(range: Range, span: HTMLSpanElement) {
  try {
    range.surroundContents(span);
    return;
  } catch {
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);
  }
}

export type HighlightMode = "solid" | "gradient" | "font";

export interface HighlightApplyOptions {
  mode: HighlightMode;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  fontFamily?: string;
}

export function applyHighlight(
  root: HTMLElement,
  options: HighlightApplyOptions,
  fallbackRange?: Range | null,
): boolean {
  const range = getSelectionRangeInRoot(root, fallbackRange);
  if (!range) {
    return false;
  }

  const span = document.createElement("span");
  span.className = HIGHLIGHT_CLASS;
  let hasStyle = false;

  if (options.mode === "solid" && options.color) {
    span.style.color = options.color;
    hasStyle = true;
  }

  if (options.mode === "gradient" && options.gradientFrom && options.gradientTo) {
    const angle = options.gradientAngle ?? 90;
    span.style.backgroundImage = `linear-gradient(${angle}deg, ${options.gradientFrom}, ${options.gradientTo})`;
    span.style.backgroundClip = "text";
    span.style.setProperty("-webkit-background-clip", "text");
    span.style.color = "transparent";
    span.style.display = "inline";
    hasStyle = true;
  }

  if (options.mode === "font" && options.fontFamily) {
    span.style.fontFamily = options.fontFamily;
    hasStyle = true;
  }

  if (options.fontFamily && options.mode !== "font") {
    span.style.fontFamily = options.fontFamily;
    hasStyle = true;
  }

  if (!hasStyle) {
    return false;
  }

  wrapRange(range, span);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  return true;
}

export function applySolidHighlight(
  root: HTMLElement,
  color: string,
  fallbackRange?: Range | null,
): boolean {
  return applyHighlight(root, { mode: "solid", color }, fallbackRange);
}

export function applyGradientHighlight(
  root: HTMLElement,
  from: string,
  to: string,
  angle = 90,
  fallbackRange?: Range | null,
): boolean {
  return applyHighlight(
    root,
    { mode: "gradient", gradientFrom: from, gradientTo: to, gradientAngle: angle },
    fallbackRange,
  );
}

export function applyFontHighlight(
  root: HTMLElement,
  fontFamily: string,
  fallbackRange?: Range | null,
): boolean {
  return applyHighlight(root, { mode: "font", fontFamily }, fallbackRange);
}

export function clearHighlightOnSelection(
  root: HTMLElement,
  fallbackRange?: Range | null,
): boolean {
  const range = getSelectionRangeInRoot(root, fallbackRange);
  if (!range) {
    return false;
  }

  let node: Node | null = range.commonAncestorContainer;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }

  const highlight = (node as HTMLElement | null)?.closest?.(
    `span.${HIGHLIGHT_CLASS}`,
  ) as HTMLSpanElement | null;

  if (!highlight || !root.contains(highlight)) {
    return false;
  }

  const parent = highlight.parentNode;
  if (!parent) {
    return false;
  }

  while (highlight.firstChild) {
    parent.insertBefore(highlight.firstChild, highlight);
  }
  highlight.remove();
  return true;
}

export function syncRichTextFields(root: HTMLElement) {
  return {
    text: root.textContent ?? "",
    html: sanitizeRichTextHtml(root.innerHTML),
  };
}
