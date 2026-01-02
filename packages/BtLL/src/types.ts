import { UnsupportedTypeError } from "./errors";
import { definedFields as columnDefinedFields } from "./lib/column";
import { definedFields as courseDefinedFields } from "./lib/course";
import { definedFields as planDefinedFields } from "./lib/plan";
import { definedFields as requirementDefinedFields } from "./lib/requirement";

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
// typeAttributeMap.set("Label", Object.keys({} as Label));

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
  const t1Generic = getNestedType(t1);
  const t2Generic = getNestedType(t2);
  if (t1Generic && t2Generic) return matchTypes(t1Generic, t2Generic);
  if ((t1Generic && !t2Generic) || (!t1Generic && t2Generic)) return false;
  if (isGenericType(t1) || isGenericType(t2)) return true;
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

export type Constructor = (
  T: Type,
  v: string,
  variables: Map<string, Data<any>>,
  debug?: boolean
) => Data<any>;

export type FunctionMapEntry = [string, Data<MyFunction>];
