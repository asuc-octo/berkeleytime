import { TypeMismatchError, UnsupportedTypeError } from "../errors";
import { argSplit } from "../helper";
import { evaluate } from "../interpreter";
import { BasicType, BasicTypeList, CollectionTypeList, CollectionTypeName, Data, FunctionMapEntry, getGenericType, isGenericType, Type } from "../types";

export const constructor = (t: Type, v: string): Data<Array<any>> => {
  const generic = getGenericType(t);
  const removedBrackets = v.substring(1, v.length - 1);
  const elems = argSplit(removedBrackets);
  const data = elems.map((e: string) => evaluate(e.trim(), generic, true));
  if (isGenericType(t)) {
    if (data.length == 0) throw new SyntaxError(`Empty list must have type`);
    if (!data.every((d) => d.type == data[0].type)) throw new SyntaxError(`All elements in list must be of the same type`);
    if (isGenericType(data[0].type)) throw new SyntaxError(`List must have a specific type`);
    if (!BasicTypeList.includes(data[0].type as BasicType)) throw new UnsupportedTypeError(`${data[0].type}`);
  }
  return {
    data: data.map((d) => d.data),
    type: !isGenericType(t) ? t : `List<${data[0].type as BasicType}>`
  }
}

export const functions: FunctionMapEntry[] = [
  ["List", {
    eval: (arg: Data<string>) => {
      return constructor(arg.type, arg.data);
    },
    args: ["List<T>"],
    genericArgs: (t: Type) => {
      if (!BasicTypeList.includes(t as BasicType)) throw new UnsupportedTypeError(`$List<${t}>`);
      return [`List<${t}>`] as Type[];
    }
  }],
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
    // return_type: "boolean"
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
    // return_type: "T"
  }],
];
