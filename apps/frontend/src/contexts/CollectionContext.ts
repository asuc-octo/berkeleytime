import { createContext } from "react";

import { ICollection } from "@/lib/api";

export interface CollectionContextType {
  collection: ICollection | undefined;
  loading: boolean;
  error?: Error;
}

const CollectionContext = createContext<CollectionContextType | null>(null);

export default CollectionContext;
