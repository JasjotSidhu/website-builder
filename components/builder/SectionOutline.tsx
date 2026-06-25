"use client";

import { RefreshCw } from "lucide-react";
import Tooltip from "@/lib/editor/Tooltip";
import { findSectionVariant, sectionRegistry } from "@/lib/registry";
import { getHeaderVariantId } from "@/lib/header-utils";
import { useBuilderStore } from "@/store/builderStore";

interface SectionOutlineProps {
  onReplaceHeader: () => void;
  onReplaceFooter: () => void;
}

export default function SectionOutline({
  onReplaceHeader,
  onReplaceFooter,
}: SectionOutlineProps) {
  const site = useBuilderStore((state) => state.site);
  const activePageId = useBuilderStore((state) => state.activePageId);
  const highlightedSectionId = useBuilderStore((state) => state.highlightedSectionId);
  const scrollToSection = useBuilderStore((state) => state.scrollToSection);
  const page =
    site.pages.find((entry) => entry.id === activePageId) ?? site.pages[0];
  const sections = page?.sections ?? [];
  const headerVariant = findSectionVariant("header", getHeaderVariantId(site.navigation));
  const footerVariant = findSectionVariant("footer", site.footer.variant);

  const outlineItemClass = (sectionId: string, extra = "") =>
    `outline-item w-full rounded-md px-3 py-2 text-left transition ${
      highlightedSectionId === sectionId ? "outline-item--active" : ""
    } ${extra}`.trim();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Outline</h2>
        <p className="text-xs text-gray-500">{sections.length + 2} blocks</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          <li className="outline-slot rounded-md bg-gray-50">
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                className={outlineItemClass("header", "flex-1 bg-transparent")}
                onClick={() => scrollToSection("header")}
              >
                <span className="block text-xs text-gray-400">Top</span>
                <span className="block text-sm font-medium text-gray-800">Header</span>
                <span className="block text-xs text-gray-500">
                  {headerVariant?.label ?? getHeaderVariantId(site.navigation)}
                </span>
              </button>
              <Tooltip label="Replace header" side="left">
                <button
                  type="button"
                  className="outline-replace-btn"
                  aria-label="Replace header"
                  onClick={onReplaceHeader}
                >
                  <RefreshCw size={14} strokeWidth={1.75} aria-hidden />
                </button>
              </Tooltip>
            </div>
          </li>

          {sections.length === 0 ? (
            <li className="px-3 py-4 text-sm text-gray-500">No page sections yet.</li>
          ) : (
            sections.map((section, index) => {
              const variant = findSectionVariant(section.type, section.variant);

              return (
                <li key={section.id}>
                  <button
                    type="button"
                    className={outlineItemClass(
                      section.id,
                      section.hidden ? "opacity-50" : "hover:bg-gray-50",
                    )}
                    onClick={() => scrollToSection(section.id)}
                  >
                    <span className="block text-xs text-gray-400">{index + 1}</span>
                    <span className="block text-sm font-medium text-gray-800">
                      {sectionRegistry[section.type]?.label ?? section.type}
                      {section.hidden ? " (hidden)" : ""}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {variant?.label ?? section.variant}
                    </span>
                  </button>
                </li>
              );
            })
          )}

          <li className="outline-slot rounded-md bg-gray-50">
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                className={outlineItemClass("footer", "flex-1 bg-transparent")}
                onClick={() => scrollToSection("footer")}
              >
                <span className="block text-xs text-gray-400">Bottom</span>
                <span className="block text-sm font-medium text-gray-800">Footer</span>
                <span className="block text-xs text-gray-500">
                  {footerVariant?.label ?? site.footer.variant}
                </span>
              </button>
              <Tooltip label="Replace footer" side="left">
                <button
                  type="button"
                  className="outline-replace-btn"
                  aria-label="Replace footer"
                  onClick={onReplaceFooter}
                >
                  <RefreshCw size={14} strokeWidth={1.75} aria-hidden />
                </button>
              </Tooltip>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
