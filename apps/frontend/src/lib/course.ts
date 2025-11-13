// Re-export subjects from shared package
export { Subject, subjects } from "@repo/shared";

export enum Colleges {
  LnS = "College of Letters and Sciences",
  CoE = "College of Engineering",
  HAAS = "Haas School of Business",
  OTHER = "Other",
}

export enum UniReqs {
  AC = "American Cultures",
  AH = "American History",
  AI = "American Institutions",
  CW = "Entry-Level Writing",
  QR = "Quantitative Reasoning",
  RCA = "R&C Part A",
  RCB = "R&C Part B",
  FL = "Foreign Language",
}

export enum LnSReqs {
  LnS_AL = "Arts and Literature",
  LnS_BS = "Biological Sciences",
  LnS_HS = "Historical Studies",
  LnS_IS = "International Studies",
  LnS_PV = "Philosophy and Values",
  LnS_PS = "Physical Science",
  LnS_SBS = "Social and Behavioral Sciences",
}

export enum CoEReqs {
  CoE_HSS = "Humanities and Social Sciences",
}

export enum HaasReqs {
  HAAS_AL = "HAAS Arts and Literature",
  HAAS_BS = "HAAS Biological Sciences",
  HAAS_HS = "HAAS Historical Studies",
  HAAS_IS = "HAAS International Studies",
  HAAS_PV = "HAAS Philosophy and Values",
  HAAS_PS = "HAAS Physical Science",
  HAAS_SBS = "HAAS Social and Behavioral Sciences",
}

export type RequirementEnum = UniReqs | LnSReqs | CoEReqs | HaasReqs;

// Convert an array of strings to an array of RequirementEnum
// The entered strings must be the EnumKey (ex: "AC", "LnS_BS", "CoE_HSS", etc.)
export function convertStringsToRequirementEnum(
  strings: string[]
): RequirementEnum[] {
  const result: RequirementEnum[] = [];

  const stringToEnum = new Map<string, RequirementEnum>();

  Object.entries(UniReqs).forEach(([key, _]) => {
    stringToEnum.set(key, UniReqs[key as keyof typeof UniReqs]);
  });
  Object.entries(LnSReqs).forEach(([key, _]) => {
    stringToEnum.set(key, LnSReqs[key as keyof typeof LnSReqs]);
  });
  Object.entries(CoEReqs).forEach(([key, _]) => {
    stringToEnum.set(key, CoEReqs[key as keyof typeof CoEReqs]);
  });
  Object.entries(HaasReqs).forEach(([key, _]) => {
    stringToEnum.set(key, HaasReqs[key as keyof typeof HaasReqs]);
  });

  for (const str of strings) {
    const enumValue = stringToEnum.get(str);
    if (enumValue) {
      result.push(enumValue);
    }
  }

  return result;
}

export function convertRequirementEnumToStrings(
  requirements: RequirementEnum[]
): string[] {
  const result: string[] = [];

  const enumToString = new Map<RequirementEnum, string>();
  Object.entries(UniReqs).forEach(([key, value]) => {
    enumToString.set(value as RequirementEnum, key);
  });
  Object.entries(LnSReqs).forEach(([key, value]) => {
    enumToString.set(value as RequirementEnum, key);
  });
  Object.entries(CoEReqs).forEach(([key, value]) => {
    enumToString.set(value as RequirementEnum, key);
  });
  Object.entries(HaasReqs).forEach(([key, value]) => {
    enumToString.set(value as RequirementEnum, key);
  });

  for (const requirement of requirements) {
    const stringKey = enumToString.get(requirement);
    if (stringKey) {
      result.push(stringKey);
    }
  }

  return result;
}
