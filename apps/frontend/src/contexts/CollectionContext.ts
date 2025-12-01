import { createContext } from "react";

import { ICollection } from "@/lib/api";

import {
  type AddClassInput,
  type RemoveClassInput,
} from "@/lib/generated/graphql";

export interface CollectionContextType {
  collection: ICollection | undefined;
  collections: ICollection[];
  loading: boolean;
  error?: Error;
  addClassToCollection: (input: AddClassInput) => Promise<void>;
  removeClassFromCollection: (input: RemoveClassInput) => Promise<void>;
  deleteCollection: (name: string) => Promise<void>;
}

const CollectionContext = createContext<CollectionContextType | null>(null);

export default CollectionContext;
