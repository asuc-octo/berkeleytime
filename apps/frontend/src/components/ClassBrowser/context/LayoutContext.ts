import { Dispatch, SetStateAction, createContext, useContext } from "react";

import { Semester } from "@/lib/generated/graphql";

export type CatalogLayoutMode = "compact" | "semi-compact" | "full";

export interface LayoutContextType {
  mode: CatalogLayoutMode;
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  query: string;
  updateQuery: Dispatch<string>;
  hasActiveFilters: boolean;
  semester: Semester;
  year: number;
}

export const LayoutContext = createContext<LayoutContextType | null>(null);

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (!context)
    throw new Error(
      "useLayoutContext must be used within a LayoutContext provider"
    );
  return context;
}
