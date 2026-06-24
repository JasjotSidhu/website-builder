export function applyItemPatch<T extends object>(
  items: T[],
  index: number,
  partial: Record<string, unknown>,
): T[] {
  const next = [...items];
  const itemData = { ...next[index] } as Record<string, unknown>;
  for (const [key, value] of Object.entries(partial)) {
    if (value === undefined || value === "") {
      delete itemData[key];
    } else {
      itemData[key] = value;
    }
  }
  next[index] = itemData as T;
  return next;
}
