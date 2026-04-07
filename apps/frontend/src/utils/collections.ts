export interface CollectionOrderFields {
  isSystem: boolean;
  isPinned: boolean;
  pinnedAt: number | null;
  lastAdd: number;
}

export function compareCollectionsByBookmarksOrder<
  T extends CollectionOrderFields,
>(a: T, b: T): number {
  if (a.isSystem && !b.isSystem) return -1;
  if (!a.isSystem && b.isSystem) return 1;
  if (a.isPinned && !b.isPinned) return -1;
  if (!a.isPinned && b.isPinned) return 1;
  if (a.isPinned && b.isPinned) {
    return (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0);
  }
  return b.lastAdd - a.lastAdd;
}
