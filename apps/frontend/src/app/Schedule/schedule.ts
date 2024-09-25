import { Dispatch, SetStateAction } from "react";

import { IClass, ISection } from "@/lib/api";

export interface ScheduleContextType {
  selectedSections: ISection[];
  setSelectedSections: Dispatch<SetStateAction<ISection[]>>;
  classes: IClass[];
  setClasses: Dispatch<SetStateAction<IClass[]>>;
  expanded: boolean[];
  setExpanded: Dispatch<SetStateAction<boolean[]>>;
}
