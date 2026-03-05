import { Dispatch, SetStateAction, createContext } from "react";

import { ITerm } from "@/lib/api";
import { ICatalogClassServer, ICatalogFilterOptions } from "@/lib/api/catalog";
import { Semester } from "@/lib/generated/graphql";

import {
  Day,
  EnrollmentFilter,
  GradingFilter,
  Level,
  SortBy,
  TimeRange,
  UnitRange,
} from "./browser";

export interface BrowserContextType {
  responsive: boolean;
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  allClasses: ICatalogClassServer[];
  classes: ICatalogClassServer[];
  includedClasses: ICatalogClassServer[];
  excludedClasses: ICatalogClassServer[];
  year: number;
  semester: Semester;
  terms?: ITerm[];
  hasActiveFilters: boolean;
  query: string;
  units: UnitRange;
  levels: Level[];
  days: Day[];
  timeRange: TimeRange;
  breadths: string[];
  universityRequirements: string[];
  gradingFilters: GradingFilter[];
  academicOrganization: string | null;
  online: boolean;
  sortBy: SortBy;
  enrollmentFilter: EnrollmentFilter | null;
  reverse: boolean;
  effectiveOrder: "asc" | "desc";
  updateUnits: Dispatch<UnitRange>;
  updateLevels: Dispatch<Level[]>;
  updateDays: Dispatch<Day[]>;
  updateTimeRange: Dispatch<TimeRange>;
  updateBreadths: Dispatch<string[]>;
  updateUniversityRequirements: Dispatch<string[]>;
  updateGradingFilters: Dispatch<GradingFilter[]>;
  updateAcademicOrganization: Dispatch<string | null>;
  updateQuery: Dispatch<string>;
  updateSortBy: Dispatch<SortBy>;
  updateEnrollmentFilter: Dispatch<EnrollmentFilter | null>;
  updateOnline: Dispatch<boolean>;
  updateReverse: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  // Server-side pagination / infinite scroll
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  loadNextPage: () => Promise<void>;
  isLoadingNextPage: boolean;
  // Filter options from server
  filterOptions: ICatalogFilterOptions | null;
}

const BrowserContext = createContext<BrowserContextType | null>(null);

export default BrowserContext;
