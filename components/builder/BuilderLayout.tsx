"use client";

import { useEffect, useState } from "react";
import { getHeaderVariantId } from "@/lib/header-utils";
import { useBuilderStore } from "@/store/builderStore";
import BuilderTopBar from "./BuilderTopBar";
import Canvas from "./Canvas";
import PagesList from "./PagesList";
import SectionLibraryModal, { type SectionLibraryMode } from "./SectionLibraryModal";
import SectionOutline from "./SectionOutline";
import ThemePanel from "./ThemePanel";

export default function BuilderLayout() {
  const site = useBuilderStore((state) => state.site);
  const isLoading = useBuilderStore((state) => state.isLoading);
  const loadSite = useBuilderStore((state) => state.loadSite);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<SectionLibraryMode | null>(null);

  useEffect(() => {
    void loadSite();
  }, [loadSite]);

  const openSectionLibrary = (config: SectionLibraryMode) => {
    setModalConfig(config);
    setModalOpen(true);
  };

  const closeSectionLibrary = () => {
    setModalOpen(false);
    setModalConfig(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-sm text-gray-500">
        Loading site…
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <BuilderTopBar />

      <div className="grid min-h-0 flex-1 grid-cols-[240px_1fr_300px]">
        <aside className="flex min-h-0 flex-col border-r border-gray-200 bg-white">
          <PagesList />
          <div className="min-h-0 flex-1">
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
          </div>
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
