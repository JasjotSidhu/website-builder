import { isFixedSlotType } from "@/lib/fixed-slot-types";
import { sectionRegistry } from "@/lib/registry";

export { FIXED_SLOT_TYPES, type FixedSlotType, isFixedSlotType } from "@/lib/fixed-slot-types";

export function getAddableSectionDefinitions() {
  return Object.values(sectionRegistry).filter((def) => !isFixedSlotType(def.type));
}
