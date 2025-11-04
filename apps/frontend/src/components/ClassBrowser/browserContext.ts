import { Dispatch, SetStateAction, createContext } from "react";

import { Component, IClass, ITerm, Semester } from "@/lib/api";

import { Breadth, Day, Level, SortBy, Unit, UniversityRequirement } from "./browser";

export interface BrowserContextType {
  responsive: boolean;
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  classes: IClass[];
  includedClasses: IClass[];
  excludedClasses: IClass[];
  year: number;
  semester: Semester;
  terms?: ITerm[];
  query: string;
  components: Component[];
  units: Unit[];
  levels: Level[];
  days: Day[];
  breadths: Breadth[];
  universityRequirement: UniversityRequirement | null;
  online: boolean;
  sortBy: SortBy;
  open: boolean;
  reverse: boolean;
  effectiveOrder: "asc" | "desc";
  updateComponents: Dispatch<Component[]>;
  updateUnits: Dispatch<Unit[]>;
  updateLevels: Dispatch<Level[]>;
  updateDays: Dispatch<Day[]>;
  updateBreadths: Dispatch<Breadth[]>;
  updateUniversityRequirement: Dispatch<UniversityRequirement | null>;
  updateQuery: Dispatch<string>;
  updateSortBy: Dispatch<SortBy>;
  updateOpen: Dispatch<boolean>;
  updateOnline: Dispatch<boolean>;
  updateReverse: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  loadMore: () => void;
  hasMore: boolean;
  totalCount: number;
}

const BrowserContext = createContext<BrowserContextType | null>(null);

export default BrowserContext;
