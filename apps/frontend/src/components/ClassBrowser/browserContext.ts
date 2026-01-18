import { Dispatch, SetStateAction, createContext } from "react";

import { ICatalogClass, ITerm } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";

import {
  Breadth,
  Day,
  EnrollmentFilter,
  GradingFilter,
  Level,
  SortBy,
  TimeRange,
  UnitRange,
  UniversityRequirement,
} from "./browser";

export interface BrowserContextType {
  responsive: boolean;
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  classes: ICatalogClass[];
  includedClasses: ICatalogClass[];
  excludedClasses: ICatalogClass[];
  year: number;
  semester: Semester;
  terms?: ITerm[];
  hasActiveFilters: boolean;
  query: string;
  units: UnitRange;
  levels: Level[];
  days: Day[];
  timeRange: TimeRange;
  breadths: Breadth[];
  universityRequirement: UniversityRequirement | null;
  gradingFilters: GradingFilter[];
  academicOrganization: string | null;
  online: boolean;
  sortBy: SortBy;
  enrollmentFilter: EnrollmentFilter;
  reverse: boolean;
  effectiveOrder: "asc" | "desc";
  aiSearchActive: boolean;
  updateUnits: Dispatch<UnitRange>;
  updateLevels: Dispatch<Level[]>;
  updateDays: Dispatch<Day[]>;
  updateTimeRange: Dispatch<TimeRange>;
  updateBreadths: Dispatch<Breadth[]>;
  updateUniversityRequirement: Dispatch<UniversityRequirement | null>;
  updateGradingFilters: Dispatch<GradingFilter[]>;
  updateAcademicOrganization: Dispatch<string | null>;
  updateQuery: Dispatch<string>;
  updateSortBy: Dispatch<SortBy>;
  updateEnrollmentFilter: Dispatch<EnrollmentFilter>;
  updateOnline: Dispatch<boolean>;
  updateReverse: Dispatch<SetStateAction<boolean>>;
  setAiSearchActive: Dispatch<SetStateAction<boolean>>;
  handleSemanticSearch: () => Promise<void>;
  semanticLoading: boolean;
  loading: boolean;
}

const BrowserContext = createContext<BrowserContextType | null>(null);

export default BrowserContext;
