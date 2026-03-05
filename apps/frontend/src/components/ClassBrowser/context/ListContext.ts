import { createContext, useContext } from "react";

import { ICatalogClassServer } from "@/lib/api/catalog";

export interface ListContextType {
  classes: ICatalogClassServer[];
  loading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  loadNextPage: () => Promise<void>;
  isLoadingNextPage: boolean;
}

export const ListContext = createContext<ListContextType | null>(null);

export function useListContext() {
  const context = useContext(ListContext);
  if (!context)
    throw new Error("useListContext must be used within a ListContext provider");
  return context;
}
