import { Dispatch, SetStateAction, createContext } from "react";

import { Component, IClass, Semester } from "@/lib/api";

import { Day, Level, SortBy, Unit } from "./browser";


import { ISchedule } from "@/lib/api";

export interface BrowserContextType {
  responsive: boolean;
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  classes: IClass[];
  includedClasses: IClass[];
  excludedClasses: IClass[];
  year: number;
  semester: Semester;
  query: string;
  components: Component[];
  units: Unit[];
  levels: Level[];
  days: Day[];
  online: boolean;
  sortBy: SortBy;
  open: boolean;
  selectedSchedule: ISchedule | null;
  allSchedules: ISchedule[];
  updateComponents: Dispatch<Component[]>;
  updateUnits: Dispatch<Unit[]>;
  updateLevels: Dispatch<Level[]>;
  updateDays: Dispatch<Day[]>;
  updateQuery: Dispatch<string>;
  updateSortBy: Dispatch<SortBy>;
  updateOpen: Dispatch<boolean>;
  updateOnline: Dispatch<boolean>;
  loading: boolean;
  updateSelectedSchedule: Dispatch<ISchedule | null>;
}

const BrowserContext = createContext<BrowserContextType | null>(null);


export default BrowserContext;
