const ALLOWED_TAGS = new Set([
  "P",
  "H2",
  "H3",
  "BLOCKQUOTE",
  "UL",
  "OL",
  "LI",
  "STRONG",
  "EM",
  "B",
  "I",
  "U",
  "S",
  "STRIKE",
  "DEL",
  "BR",
  "HR",
  "IMG",
  "A",
  "SPAN",
  "DIV",
]);

const BLOCK_TAGS = new Set([
  "P",
  "H2",
  "H3",
  "BLOCKQUOTE",
  "UL",
  "OL",
  "LI",
  "DIV",
  "HR",
  "IMG",
]);

export function sanitizeBlogHtml(html: string): string {
  if (!html) {
    return "";
  }

  if (typeof window === "undefined") {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "")
      .replace(/\son\w+='[^']*'/gi, "");
  }

  const template = document.createElement("template");
  template.innerHTML = html.replace(/<script[\s\S]*?<\/script>/gi, "");

  const walk = (node: Node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement;
        if (!ALLOWED_TAGS.has(element.tagName)) {
          while (element.firstChild) {
            element.parentNode?.insertBefore(element.firstChild, element);
          }
          element.remove();
          continue;
        }

        if (element.tagName === "A") {
          const href = element.getAttribute("href") ?? "";
          element.removeAttribute("style");
          for (const attr of Array.from(element.attributes)) {
            if (attr.name !== "href") {
              element.removeAttribute(attr.name);
            }
          }
          if (!href.startsWith("http://") && !href.startsWith("https://") && !href.startsWith("/")) {
            element.removeAttribute("href");
          }
        } else if (element.tagName === "IMG") {
          const src = element.getAttribute("src") ?? "";
          const alt = element.getAttribute("alt") ?? "";
          for (const attr of Array.from(element.attributes)) {
            element.removeAttribute(attr.name);
          }
          if (
            src.startsWith("http://") ||
            src.startsWith("https://") ||
            src.startsWith("/")
          ) {
            element.setAttribute("src", src);
            if (alt) {
              element.setAttribute("alt", alt);
            }
          } else {
            element.remove();
            continue;
          }
        } else {
          for (const attr of Array.from(element.attributes)) {
            if (attr.name !== "class") {
              element.removeAttribute(attr.name);
            }
          }
        }

        walk(element);
      }
    }
  };

  walk(template.content);

  const text = template.innerHTML.trim();
  if (!text) {
    return "";
  }

  if (![...BLOCK_TAGS].some((tag) => text.includes(`<${tag.toLowerCase()}`))) {
    return `<p>${text}</p>`;
  }

  return text;
}

export function plainTextToBlogHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.includes("<")) {
    return sanitizeBlogHtml(trimmed);
  }
  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}
