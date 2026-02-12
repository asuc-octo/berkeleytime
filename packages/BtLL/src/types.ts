import { UnsupportedTypeError } from "./errors";
import { definedFields as columnDefinedFields } from "./lib/column";
import { definedFields as courseDefinedFields } from "./lib/course";
import { definedFields as planDefinedFields } from "./lib/plan";
import {
  andRequirementDefinedFields,
  booleanRequirementDefinedFields,
  courseListRequirementDefinedFields,
  nCoursesRequirementDefinedFields,
  numberRequirementDefinedFields,
  orRequirementDefinedFields,
  definedFields as requirementDefinedFields,
  extendedByType as requirementExtendedByType,
} from "./lib/requirement";

export const BasicTypeList = [
  "raw",
  "string",
  "number",
  "boolean",
  "Plan",
  "Column",
  "Course",
  "Label",
] as const;

export const CollectionTypeList = ["List"] as const;

export const ObjectTypeList = [
  "Plan",
  "Column",
  "Course",
  "Label",
  "Requirement",
  "BooleanRequirement",
  "NCoursesRequirement",
  "CourseListRequirement",
  "AndRequirement",
  "OrRequirement",
  "NumberRequirement",
] as const;

export type BasicType = (typeof BasicTypeList)[number];
export type CollectionType = (typeof CollectionTypeList)[number];
export type ObjectType = (typeof ObjectTypeList)[number];

// can also be generics, which can be any string
export type Type = string;

export type Variables = Map<string, Data<any>>;

export const typeAttributeMap = new Map<Type, Array<string>>();
typeAttributeMap.set("Plan", planDefinedFields);
typeAttributeMap.set("Column", columnDefinedFields);
typeAttributeMap.set("Requirement", requirementDefinedFields);
typeAttributeMap.set("Course", courseDefinedFields);
typeAttributeMap.set("BooleanRequirement", booleanRequirementDefinedFields);
typeAttributeMap.set("NCoursesRequirement", nCoursesRequirementDefinedFields);
typeAttributeMap.set(
  "CourseListRequirement",
  courseListRequirementDefinedFields
);
typeAttributeMap.set("AndRequirement", andRequirementDefinedFields);
typeAttributeMap.set("OrRequirement", orRequirementDefinedFields);
typeAttributeMap.set("NumberRequirement", numberRequirementDefinedFields);
// typeAttributeMap.set("Label", Object.keys({} as Label));

export const EXTENDED_BY_TYPE = new Map<Type, Type[]>();
EXTENDED_BY_TYPE.set("Requirement", requirementExtendedByType);

export const getNestedType = (t: string): Type | undefined => {
  const openBracket = t.indexOf("<");
  const closeBracket = t.lastIndexOf(">");
  if (openBracket === -1 && closeBracket === -1) return undefined;
  if (
    openBracket === -1 ||
    closeBracket === -1 ||
    (!CollectionTypeList.includes(
      t.substring(0, openBracket) as CollectionType
    ) &&
      t.substring(0, openBracket) !== "Function")
  )
    throw new UnsupportedTypeError(t);
  return t.substring(openBracket + 1, closeBracket);
};

export const getCollectionTypeToTypeName = (t: string): Type => {
  return t.substring(0, t.indexOf("<"));
};

export const StringToType = (t: string): Type => {
  return t;
};

export const isGenericType = (t: string): boolean => {
  if (
    BasicTypeList.includes(t as BasicType) ||
    ObjectTypeList.includes(t as ObjectType) ||
    t.startsWith("Function")
  )
    return false;
  const nestedType = getNestedType(t);
  if (nestedType) return isGenericType(nestedType);
  return true;
};

export const isNestedGenericType = (t: string): boolean => {
  if (isGenericType(t)) return false;
  const nestedType = getNestedType(t);
  if (nestedType) {
    return isGenericType(nestedType);
  } else {
    return false;
  }
};

export const isFunctionType = (t: string): boolean => {
  return t.startsWith("Function");
};

export const matchTypes = (t1: Type, t2: Type): boolean => {
  if (t1 === t2) return true;
  const t1NestedType = getNestedType(t1);
  const t2NestedType = getNestedType(t2);
  const t1GenericType = isGenericType(t1);
  const t2GenericType = isGenericType(t2);
  if (t1NestedType && t2NestedType)
    return matchTypes(t1NestedType, t2NestedType);
  if ((t1NestedType && !t2NestedType) || (!t1NestedType && t2NestedType))
    return (
      (t1GenericType && !isNestedGenericType(t1)) ||
      (t2GenericType && !isNestedGenericType(t2))
    );
  if (t1GenericType || t2GenericType) return true;
  if (EXTENDED_BY_TYPE.has(t1))
    return EXTENDED_BY_TYPE.get(t1)?.includes(t2) ?? false;
  if (EXTENDED_BY_TYPE.has(t2))
    return EXTENDED_BY_TYPE.get(t2)?.includes(t1) ?? false;
  return false;
};

export interface Data<T> {
  data: T;
  type: Type;
}

export interface MyFunction {
  eval: (variables: Variables, ...args: Data<any>[]) => Data<any> | null;
  args: Type[];
  genericArgs?: (t: Type[]) => Type[];
}

export interface BtLLConfig {
  debug?: boolean;
  fetchCourse?: (subject: string, number: string) => Promise<any> | any;
}

export type Constructor = (
  T: Type,
  v: string,
  variables: Map<string, Data<any>>,
  config?: BtLLConfig
) => Data<any>;

export type FunctionMapEntry = [string, Data<MyFunction>];
