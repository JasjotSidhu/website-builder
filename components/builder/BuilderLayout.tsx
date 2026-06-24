"use client";

import { useState } from "react";
import { getHeaderVariantId } from "@/lib/header-utils";
import { findSectionVariant, sectionRegistry } from "@/lib/registry";
import { useBuilderStore } from "@/store/builderStore";
import Canvas from "./Canvas";
import SectionLibraryModal, { type SectionLibraryMode } from "./SectionLibraryModal";
import SectionOutline from "./SectionOutline";
import ThemePanel from "./ThemePanel";

export default function BuilderLayout() {
  const siteName = useBuilderStore((state) => state.site.meta.name);
  const site = useBuilderStore((state) => state.site);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<SectionLibraryMode | null>(null);

  const openSectionLibrary = (config: SectionLibraryMode) => {
    setModalConfig(config);
    setModalOpen(true);
  };

  const closeSectionLibrary = () => {
    setModalOpen(false);
    setModalConfig(null);
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">{siteName}</h1>
          <p className="text-xs text-gray-500">Page builder — click any text to edit inline</p>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[240px_1fr_300px]">
        <aside className="border-r border-gray-200 bg-white">
          <SectionOutline
            onReplaceHeader={() =>
              openSectionLibrary({
                mode: "replace-header",
                currentVariantId: getHeaderVariantId(site.navigation),
              })
            }
            onReplaceFooter={() =>
              openSectionLibrary({
                mode: "replace-footer",
                currentVariantId: site.footer.variant,
              })
            }
          />
        </aside>

        <section className="min-h-0">
          <Canvas onOpenSectionLibrary={openSectionLibrary} />
        </section>

        <aside className="border-l border-gray-200 bg-white">
          <ThemePanel />
        </aside>
      </div>

      <SectionLibraryModal
        open={modalOpen}
        config={modalConfig}
        onClose={closeSectionLibrary}
      />
    </div>
  );
}
