export interface CollectionPreviewClass {
  subject: string;
  courseNumber: string;
  number: string;
  title: string | null;
  gradeAverage: number | null;
  enrolledCount: number | null;
  maxEnroll: number | null;
  unitsMin: number;
  unitsMax: number;
  hasReservedSeats: boolean;
}

export interface Collection {
  id: string;
  name: string;
  classCount: number;
  isPinned: boolean;
  pinnedAt: number | null;
  isSystem: boolean;
  color: string | null;
  createdAt: number;
  previewClasses?: CollectionPreviewClass[];
}

export const ALL_SAVED_COLLECTION_NAME = "All Saved";
