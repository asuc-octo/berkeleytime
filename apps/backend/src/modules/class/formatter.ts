import { DecalType, IClassItem, ISectionItem } from "@repo/common";

import { ClassModule } from "./generated-types/module-types";

interface ClassRelationships {
  term: null;
  course: null;
  primarySection: null;
  sections: null;
  gradeDistribution: null;
}

export type IntermediateClass = Omit<
  ClassModule.Class,
  keyof ClassRelationships
> &
  ClassRelationships;

export const formatDate = (date?: string | number | Date | null) => {
  if (!date) return date;

  if (date instanceof Date) return date.toISOString();

  return new Date(date).toISOString();
};

export const formatClass = (_class: IClassItem) => {
  const output = {
    ..._class,

    unitsMax: _class.allowedUnits?.maximum || 0,
    unitsMin: _class.allowedUnits?.minimum || 0,

    term: null,
    course: null,
    primarySection: null,
    sections: null,
    gradeDistribution: null,
    decal: null,
  } as IntermediateClass;

  return output;
};

interface SectionRelationships {
  course: string;

  term: null;
  class: null;
  enrollment: null;
}

export type IntermediateSection = Omit<
  ClassModule.Section,
  keyof SectionRelationships
> &
  SectionRelationships;

export const formatSection = (section: ISectionItem) => {
  const output = {
    ...section,

    online: section.instructionMode === "O",
    course: section.courseId,

    term: null,
    class: null,
    enrollment: null,
  } as IntermediateSection;

  return output;
};

export const formatDecalInfo = (decal: DecalType) => {
  if (!decal) return null;

  return {
    id: String(decal.id) || "",
    title: decal.title || "",
    description: decal.description || "",
    category: decal.category || "",
    units: String(decal.units) || "",
    website: decal.website || "",
    application: decal.application || "",
    enroll: decal.enroll || "",
    contact: decal.contact || "",
  };
};
