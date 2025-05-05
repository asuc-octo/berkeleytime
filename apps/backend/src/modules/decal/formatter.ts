import { DecalType, IClassItem } from "@repo/common";

import { ClassModule } from "../class/generated-types/module-types";

export const formatClassForDecal = (_class: IClassItem): ClassModule.Class => {
  const output = {
    ..._class,

    unitsMax: _class.allowedUnits?.maximum || 0,
    unitsMin: _class.allowedUnits?.minimum || 0,

    term: {} as any,
    course: {} as any,
    primarySection: {} as any,
    sections: [],
    gradeDistribution: {} as any,
    decal: null,
  };
  return output as ClassModule.Class;
};

export const formatDecalInfo = (decal: DecalType) => {
  if (!decal) return null;

  return {
    id: String(decal.externalId) || "",
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
