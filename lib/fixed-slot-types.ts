export const FIXED_SLOT_TYPES = ["header", "footer"] as const;

export type FixedSlotType = (typeof FIXED_SLOT_TYPES)[number];

export function isFixedSlotType(type: string): type is FixedSlotType {
  return FIXED_SLOT_TYPES.includes(type as FixedSlotType);
}
