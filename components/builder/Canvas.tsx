"use client";

import { EditModeProvider } from "@/lib/editor/EditModeContext";
import { SiteProvider } from "@/lib/editor/SiteContext";
import { getHeaderVariantId } from "@/lib/header-utils";
import { isFixedSlotType } from "@/lib/section-placement";
import { buildThemeCssVariables } from "@/lib/theme-utils";
import { useBuilderStore } from "@/store/builderStore";
import AddSectionButton from "./AddSectionButton";
import DevicePreviewBar, { getPreviewMaxWidth } from "./DevicePreviewBar";
import FixedSlotWrapper from "./FixedSlotWrapper";
import type { SectionLibraryMode } from "./SectionLibraryModal.types";
import SectionWrapper from "./SectionWrapper";

interface CanvasProps {
  onOpenSectionLibrary: (config: SectionLibraryMode) => void;
}

export default function Canvas({ onOpenSectionLibrary }: CanvasProps) {
  const site = useBuilderStore((state) => state.site);
  const activePageId = useBuilderStore((state) => state.activePageId);
  const previewDevice = useBuilderStore((state) => state.previewDevice);
  const previewMaxWidth = getPreviewMaxWidth(previewDevice);

  const page =
    site.pages.find((entry) => entry.id === activePageId) ?? site.pages[0];
  if (!page) {
    return null;
  }

  const sections = page.sections.filter((section) => !isFixedSlotType(section.type));
  const pages = site.pages.map((entry) => ({
    id: entry.id,
    title: entry.title,
    slug: entry.slug,
  }));

  const openAddModal = (atIndex: number) => {
    onOpenSectionLibrary({ mode: "add", insertAtIndex: atIndex });
  };

  const openReplaceModal = (
    sectionId: string,
    sectionType: string,
    currentVariantId: string,
  ) => {
    onOpenSectionLibrary({
      mode: "replace",
      sectionId,
      sectionType,
      currentVariantId,
    });
  };

  const openReplaceHeaderModal = () => {
    onOpenSectionLibrary({
      mode: "replace-header",
      currentVariantId: getHeaderVariantId(site.navigation),
    });
  };

  const openReplaceFooterModal = () => {
    onOpenSectionLibrary({
      mode: "replace-footer",
      currentVariantId: site.footer.variant,
    });
  };

  return (
    <EditModeProvider>
      <SiteProvider pages={pages}>
        <div className="flex h-full flex-col bg-gray-100">
          <DevicePreviewBar />
          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6">
            <div
              className="canvas-preview-frame @container mx-auto w-full max-w-full rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-[max-width] duration-200"
              data-preview-device={previewDevice}
              style={previewMaxWidth ? { maxWidth: previewMaxWidth } : undefined}
            >
              <div style={buildThemeCssVariables(site.theme)}>
                <FixedSlotWrapper slot="header" onReplace={openReplaceHeaderModal} />

                <main>
                  {sections.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="mb-2 text-sm text-gray-500">No sections yet.</p>
                      <div className="add-section-zone add-section-zone--empty">
                        <AddSectionButton onClick={() => openAddModal(0)} />
                      </div>
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
                    <div className="add-section-zone">
                      <AddSectionButton onClick={() => openAddModal(sections.length)} />
                    </div>
                  ) : null}
                </main>

                <FixedSlotWrapper slot="footer" onReplace={openReplaceFooterModal} />
              </div>
            </div>
          </div>
        </div>
      </SiteProvider>
    </EditModeProvider>
  );
}
