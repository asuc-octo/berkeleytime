import { TypeMismatchError, UnsupportedTypeError } from "../errors";
import { argSplit } from "../helper";
import { evaluate } from "../interpreter";
import { BasicType, BasicTypeList, Data, FunctionMapEntry, getGenericType, Type } from "../types";

export const constructor = (t: Type, v: string): Data<Array<any>> => {
  const generic = getGenericType(t);
  const removedBrackets = v.substring(1, v.length - 1);
  const elems = argSplit(removedBrackets);
  return {
    data: elems.map((e: string) => evaluate(e.trim(), generic).data),
    type: t
  }
}

export const functions: FunctionMapEntry[] = [
  ["contains", {
    eval: (list: Data<Array<any>>, val: Data<any>) => {
      if(getGenericType(list.type) !== val.type) throw new TypeMismatchError(getGenericType(list.type), val.type);
      return {
        data: list.data.includes(val.data),
        type: "boolean"
      }
    },
    args: ["List<T>", "T"],
    genericArgs: (t: Type) => {
      if (!BasicTypeList.includes(t as BasicType)) throw new UnsupportedTypeError(`$List<${t}>`);
      return [`List<${t}>`, t] as Type[];
    },
    return_type: "boolean"
  }],
  ["get_element", {
    eval: (list: Data<Array<any>>, index: Data<number>) => {
      return {
        data: list.data[index.data],
        type: getGenericType(list.type)
      }
    },
    genericArgs: (t: Type) => {
      if (!BasicTypeList.includes(t as BasicType)) throw new UnsupportedTypeError(`$List<${t}>`);
      return [`List<${t}>`, "number"] as Type[];
    },
    args: ["List<T>", "number"],
    return_type: "T"
  }],
];
