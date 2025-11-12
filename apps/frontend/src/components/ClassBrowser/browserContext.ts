import { Dispatch, SetStateAction, createContext } from "react";

import { IClass, ITerm, Semester } from "@/lib/api";

import {
  Breadth,
  Day,
  GradingFilter,
  Level,
  SortBy,
  UnitRange,
  UniversityRequirement,
} from "./browser";

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
  units: UnitRange;
  levels: Level[];
  days: Day[];
  breadths: Breadth[];
  universityRequirement: UniversityRequirement | null;
  gradingFilters: GradingFilter[];
  department: string | null;
  online: boolean;
  sortBy: SortBy;
  open: boolean;
  reverse: boolean;
  effectiveOrder: "asc" | "desc";
  updateUnits: Dispatch<UnitRange>;
  updateLevels: Dispatch<Level[]>;
  updateDays: Dispatch<Day[]>;
  updateBreadths: Dispatch<Breadth[]>;
  updateUniversityRequirement: Dispatch<UniversityRequirement | null>;
  updateGradingFilters: Dispatch<GradingFilter[]>;
  updateDepartment: Dispatch<string | null>;
  updateQuery: Dispatch<string>;
  updateSortBy: Dispatch<SortBy>;
  updateOpen: Dispatch<boolean>;
  updateOnline: Dispatch<boolean>;
  updateReverse: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
}

const BrowserContext = createContext<BrowserContextType | null>(null);

export default BrowserContext;
