"use client";

import { useEffect, useState } from "react";
import { getHeaderVariantId } from "@/lib/header-utils";
import { useBuilderStore } from "@/store/builderStore";
import BuilderTopBar from "./BuilderTopBar";
import Canvas from "./Canvas";
import HeaderSettingsSidebar from "./HeaderSettingsSidebar";
import PagesList from "./PagesList";
import RightSidebar from "./RightSidebar";
import SectionLibraryModal, { type SectionLibraryMode } from "./SectionLibraryModal";
import SectionOutline from "./SectionOutline";

export default function BuilderLayout({ websiteId }: { websiteId: string }) {
  const site = useBuilderStore((state) => state.site);
  const isLoading = useBuilderStore((state) => state.isLoading);
  const isDirty = useBuilderStore((state) => state.isDirty);
  const autosaveEnabled = useBuilderStore((state) => state.autosaveEnabled);
  const isSaving = useBuilderStore((state) => state.isSaving);
  const isPublishing = useBuilderStore((state) => state.isPublishing);
  const loadSite = useBuilderStore((state) => state.loadSite);
  const saveSite = useBuilderStore((state) => state.saveSite);
  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);
  const leftSidebarMode = useBuilderStore((state) => state.leftSidebarMode);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<SectionLibraryMode | null>(null);

  useEffect(() => {
    void loadSite(websiteId);
  }, [loadSite, websiteId]);

  useEffect(() => {
    if (!isDirty || !autosaveEnabled || isSaving || isPublishing) {
      return;
    }

    const timer = window.setTimeout(() => {
      void saveSite();
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [site, isDirty, autosaveEnabled, isSaving, isPublishing, saveSite]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) {
        return;
      }

      const isMeta = event.metaKey || event.ctrlKey;
      if (!isMeta || event.key.toLowerCase() !== "z") {
        return;
      }

      event.preventDefault();
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

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

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[240px_1fr_300px]">
        <aside className="hidden min-h-0 flex-col border-r border-gray-200 bg-white lg:flex">
          {leftSidebarMode === "header-settings" ? (
            <HeaderSettingsSidebar />
          ) : (
            <>
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
            </>
          )}
        </aside>

        <section className="min-h-0 min-w-0 overflow-hidden">
          <Canvas onOpenSectionLibrary={openSectionLibrary} />
        </section>

        <aside className="hidden min-h-0 border-l border-gray-200 bg-white lg:block">
          <RightSidebar />
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
