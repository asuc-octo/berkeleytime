import { UnsupportedTypeError } from "./errors";

import { definedFields as columnDefinedFields } from "./lib/column";
import { definedFields as planDefinedFields } from "./lib/plan";

export const BasicTypeList = [
  "raw",
  "string",
  "number",
  "boolean",
  "Plan",
  "Column",
  "Course",
  "Label",
  "T"
] as const;

export const CollectionTypeList = [
  "List"
] as const;

export type BasicType = typeof BasicTypeList[number];

export type CollectionTypeName = typeof CollectionTypeList[number];

export type CollectionType = `${CollectionTypeName}<${BasicType}>`

export type Type = BasicType | CollectionType;

export const typeAttributeMap = new Map<Type, Array<string>>();
typeAttributeMap.set("Plan", planDefinedFields);
typeAttributeMap.set("Column", columnDefinedFields);
// typeAttributeMap.set("Course", Object.keys({} as Course));
// typeAttributeMap.set("Label", Object.keys({} as Label));

export const getGenericType = (t: string): Type => {
  const openBracket = t.indexOf("<");
  const closeBracket = t.indexOf(">");
  if (openBracket === -1 || closeBracket === -1 || closeBracket != t.length - 1 || !CollectionTypeList.includes(t.substring(0, openBracket) as CollectionTypeName)) throw new UnsupportedTypeError(t);
  return StringToType(t.substring(openBracket + 1, closeBracket));
}

export const getCollectionTypeToTypeName = (t: string): CollectionTypeName => {
  return t.substring(0, t.indexOf("<")) as CollectionTypeName;
}

export const StringToType = (t: string): Type => {
  if (BasicTypeList.includes(t as BasicType)) return t as Type;
  getGenericType(t);
  return t as Type;
}

export const matchTypes = (t1: Type, t2: Type): boolean => {
  if (t1 === t2) return true;
  if (t1 === "T" || t2 === "T") return true;
  return (getGenericType(t1) === "T" || getGenericType(t2) === "T") && getCollectionTypeToTypeName(t1) === getCollectionTypeToTypeName(t2);
}

export const isGenericType = (t: Type): boolean => {
  if (t === "T") return true;
  try {
    return getGenericType(t) == "T";
  } catch (e) {
    return false;
  }
}

export interface Data<T> {
  data: T;
  type: Type;
}

export interface Function {
  eval: (...args: Data<any>[]) => Data<any>;
  args: Type[];
  genericArgs?: (t: Type) => Type[];
}

export type Constructor = (T: Type, v: string) => Data<any>;

export type FunctionMapEntry = [string, Function];