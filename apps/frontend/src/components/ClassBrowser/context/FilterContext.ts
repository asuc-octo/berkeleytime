import { Dispatch, SetStateAction, createContext, useContext } from "react";

import { ITerm } from "@/lib/api";
import { ICatalogFilterOptions } from "@/lib/api/catalog";
import { Semester } from "@/lib/generated/graphql";

import {
  Day,
  EnrollmentFilter,
  GradingFilter,
  Level,
  SortBy,
  TimeRange,
  UnitRange,
} from "../browser";

export interface FilterContextType {
  year: number;
  semester: Semester;
  terms?: ITerm[];
  units: UnitRange;
  levels: Level[];
  days: Day[];
  timeRange: TimeRange;
  breadths: string[];
  universityRequirements: string[];
  gradingFilters: GradingFilter[];
  academicOrganization: string | null;
  sortBy: SortBy;
  reverse: boolean;
  effectiveOrder: "asc" | "desc";
  enrollmentFilter: EnrollmentFilter | null;
  online: boolean;
  filterOptions: ICatalogFilterOptions | null;
  updateUnits: Dispatch<UnitRange>;
  updateLevels: Dispatch<Level[]>;
  updateDays: Dispatch<Day[]>;
  updateTimeRange: Dispatch<TimeRange>;
  updateBreadths: Dispatch<string[]>;
  updateUniversityRequirements: Dispatch<string[]>;
  updateGradingFilters: Dispatch<GradingFilter[]>;
  updateAcademicOrganization: Dispatch<string | null>;
  updateSortBy: Dispatch<SortBy>;
  updateEnrollmentFilter: Dispatch<EnrollmentFilter | null>;
  updateOnline: Dispatch<boolean>;
  updateReverse: Dispatch<SetStateAction<boolean>>;
}

export const FilterContext = createContext<FilterContextType | null>(null);

export function useFilterContext() {
  const context = useContext(FilterContext);
  if (!context)
    throw new Error("useFilterContext must be used within a FilterContext provider");
  return context;
}
