export interface Collection {
  id: string;
  name: string;
  classCount: number;
  isPinned: boolean;
  color: string | null;
  createdAt: number;
}

export const ALL_SAVED_COLLECTION_NAME = "All saved";
