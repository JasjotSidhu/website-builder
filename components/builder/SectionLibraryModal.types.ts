export type SectionLibraryMode =
  | { mode: "add"; insertAtIndex: number }
  | { mode: "replace"; sectionId: string; sectionType: string; currentVariantId: string }
  | { mode: "replace-header"; currentVariantId: string }
  | { mode: "replace-footer"; currentVariantId: string };
