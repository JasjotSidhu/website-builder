"use client";

import { useState } from "react";
import { EditModeContext } from "@/lib/editor/EditModeContext";
import { SiteProvider } from "@/lib/editor/SiteContext";
import { buildThemeCssVariables } from "@/lib/theme-utils";
import { useBuilderStore } from "@/store/builderStore";
import AddSectionButton from "./AddSectionButton";
import SectionLibraryModal, {
  type SectionLibraryMode,
} from "./SectionLibraryModal";
import SectionWrapper from "./SectionWrapper";

export default function Canvas() {
  const site = useBuilderStore((state) => state.site);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<SectionLibraryMode | null>(null);

  const page = site.pages[0];
  const sections = page.sections;
  const pages = site.pages.map((entry) => ({
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
  }));

  const openAddModal = (atIndex: number) => {
    setModalConfig({ mode: "add", insertAtIndex: atIndex });
    setModalOpen(true);
  };

  const openReplaceModal = (
    sectionId: string,
    sectionType: string,
    currentVariantId: string,
  ) => {
    setModalConfig({
      mode: "replace",
      sectionId,
      sectionType,
      currentVariantId,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalConfig(null);
  };

  return (
    <EditModeContext.Provider value={{ isEditing: true }}>
      <SiteProvider pages={pages}>
        <div className="h-full overflow-y-auto bg-gray-100 p-6">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
            <div style={buildThemeCssVariables(site.theme)}>
              <main>
                {sections.length === 0 ? (
                  <div className="relative py-16 text-center">
                    <p className="mb-4 text-sm text-gray-500">No sections yet.</p>
                    <AddSectionButton onClick={() => openAddModal(0)} />
                  </div>
                ) : (
                  sections.map((section, index) => (
                    <div key={section.id}>
                      <SectionWrapper
                        section={section}
                        index={index}
                        totalSections={sections.length}
                        onAddSection={openAddModal}
                        onReplaceSection={openReplaceModal}
                      />
                    </div>
                  ))
                )}
                {sections.length > 0 ? (
                  <div className="relative py-4">
                    <AddSectionButton onClick={() => openAddModal(sections.length)} />
                  </div>
                ) : null}
              </main>
            </div>
          </div>
        </div>

        <SectionLibraryModal open={modalOpen} config={modalConfig} onClose={closeModal} />
      </SiteProvider>
    </EditModeContext.Provider>
  );
}
