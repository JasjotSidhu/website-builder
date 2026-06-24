"use client";

import { EditModeProvider } from "@/lib/editor/EditModeContext";
import { SiteProvider } from "@/lib/editor/SiteContext";
import { getHeaderVariantId } from "@/lib/header-utils";
import { isFixedSlotType } from "@/lib/section-placement";
import { buildThemeCssVariables } from "@/lib/theme-utils";
import { useBuilderStore } from "@/store/builderStore";
import AddSectionButton from "./AddSectionButton";
import FixedSlotWrapper from "./FixedSlotWrapper";
import type { SectionLibraryMode } from "./SectionLibraryModal.types";
import SectionWrapper from "./SectionWrapper";

interface CanvasProps {
  onOpenSectionLibrary: (config: SectionLibraryMode) => void;
}

export default function Canvas({ onOpenSectionLibrary }: CanvasProps) {
  const site = useBuilderStore((state) => state.site);

  const page = site.pages[0];
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
        <div className="h-full overflow-y-auto bg-gray-100 p-6">
          <div className="mx-auto max-w-5xl rounded-xl bg-white shadow-sm ring-1 ring-black/5">
            <div style={buildThemeCssVariables(site.theme)}>
              <FixedSlotWrapper slot="header" onReplace={openReplaceHeaderModal} />

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

              <FixedSlotWrapper slot="footer" onReplace={openReplaceFooterModal} />
            </div>
          </div>
        </div>
      </SiteProvider>
    </EditModeProvider>
  );
}
