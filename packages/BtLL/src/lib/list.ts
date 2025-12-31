import { TypeMismatchError, UnsupportedTypeError } from "../errors";
import { argSplit } from "../helper";
import { evaluate } from "../interpreter";
import {
  BasicType,
  BasicTypeList,
  CollectionTypeList,
  Data,
  FunctionMapEntry,
  MyFunction,
  Type,
  Variables,
  getNestedType,
  isGenericType,
} from "../types";

export const constructor = (
  t: Type,
  v: string,
  variables: Variables
): Data<Array<any>> => {
  const nestedType = getNestedType(t);
  if (!nestedType) throw new UnsupportedTypeError(t);
  const removedBrackets = v.substring(1, v.length - 1);
  const elems = argSplit(removedBrackets);
  const data = elems.map((e: string) =>
    evaluate(e.trim(), nestedType, variables, false)
  );
  if (isGenericType(t)) {
    if (data.length == 0) throw new SyntaxError(`Empty list must have type`);
    if (!data.every((d) => d.type == data[0].type))
      throw new SyntaxError(
        `All elements in list must be of the same type: ${v}`
      );
    if (isGenericType(data[0].type))
      throw new SyntaxError(`List must have a specific type`);
    if (!BasicTypeList.includes(data[0].type as BasicType))
      throw new UnsupportedTypeError(`${data[0].type}`);
  }
  return {
    data: data.map((d) => d.data),
    type: !isGenericType(t) ? t : `List<${data[0].type as BasicType}>`,
  };
};

export const functions: FunctionMapEntry[] = [
  [
    "List",
    {
      type: "Function<List<T>>(raw)",
      data: {
        eval: (variables: Variables, arg: Data<string>) => {
          return constructor(arg.type, arg.data, variables);
        },
        args: ["List<T>"],
        genericArgs: (t: Type[]) => {
          if (!BasicTypeList.includes(t[0] as BasicType))
            throw new UnsupportedTypeError(`$List<${t[0]}>`);
          return [`List<${t[0]}>`] as Type[];
        },
      },
    },
  ],
  [
    "contains",
    {
      type: "Function<boolean>(List<T>, T)",
      data: {
        eval: (_: Variables, list: Data<Array<any>>, val: Data<any>) => {
          if (getNestedType(list.type) !== val.type)
            throw new TypeMismatchError(getNestedType(list.type)!, val.type);
          return {
            data: list.data.includes(val.data),
            type: "boolean",
          };
        },
        args: ["List<T>", "T"],
        genericArgs: (t: Type[]) => {
          if (!BasicTypeList.includes(t[0] as BasicType))
            throw new UnsupportedTypeError(`List<${t[0]}>`);
          return [`List<${t[0]}>`, t[0]] as Type[];
        },
        // return_type: "boolean"
      },
    },
  ],
  [
    "get_element",
    {
      type: "Function<T>(List<T>, number)",
      data: {
        eval: (_: Variables, list: Data<Array<any>>, index: Data<number>) => {
          return {
            data: list.data[index.data],
            type: getNestedType(list.type)!,
          };
        },
        genericArgs: (t: Type[]) => {
          if (!BasicTypeList.includes(t[0] as BasicType))
            throw new UnsupportedTypeError(`$List<${t[0]}>`);
          return [`List<${t[0]}>`, "number"] as Type[];
        },
        args: ["List<T>", "number"],
        // return_type: "T"
      },
    },
  ],
  [
    "length",
    {
      type: "Function<number>(List<T>)",
      data: {
        eval: (_: Variables, list: Data<Array<any>>) => {
          return { data: list.data.length, type: "number" };
        },
        args: ["List<T>"],
      },
    },
  ],
  [
    "find",
    {
      type: "Function<T>(List<T>, Function<boolean>(T))",
      data: {
        eval: (
          variables: Variables,
          list: Data<Array<any>>,
          eval_func: Data<MyFunction>
        ) => {
          const nestedType = getNestedType(list.type)!;
          return {
            data: list.data.find(
              (d) =>
                eval_func.data.eval(variables, { data: d, type: nestedType })
                  ?.data
            ),
            type: nestedType,
          };
        },
        genericArgs: (t: Type[]) => {
          if (!BasicTypeList.includes(t[0] as BasicType))
            throw new UnsupportedTypeError(`$List<${t[0]}>`);
          return [`List<${t[0]}>`, `Function<boolean>(${t[0]})`] as Type[];
        },
        args: ["List<T>", "Function<boolean>(T)"],
        // return_type: "T"
      },
    },
  ],
  [
    "findIndex",
    {
      type: "Function<number>(List<T>, Function<boolean>(T))",
      data: {
        eval: (
          variables: Variables,
          list: Data<Array<any>>,
          eval_func: Data<MyFunction>
        ) => {
          const nestedType = getNestedType(list.type)!;
          return {
            data: list.data.findIndex(
              (d) =>
                eval_func.data.eval(variables, { data: d, type: nestedType })
                  ?.data
            ),
            type: "number",
          };
        },
        genericArgs: (t: Type[]) => {
          if (!BasicTypeList.includes(t[0] as BasicType))
            throw new UnsupportedTypeError(`$List<${t[0]}>`);
          return [`List<${t[0]}>`, `Function<boolean>(${t[0]})`] as Type[];
        },
        args: ["List<T>", "Function<boolean>(T)"],
      },
    },
  ],
  [
    "filter",
    {
      type: "Function<List<T>>(List<T>, Function<boolean>(T))",
      data: {
        eval: (
          variables: Variables,
          list: Data<Array<any>>,
          eval_func: Data<MyFunction>
        ) => {
          return {
            data: list.data.filter(
              (d) =>
                eval_func.data.eval(variables, {
                  data: d,
                  type: getNestedType(list.type)!,
                })?.data
            ),
            type: list.type,
          };
        },
        genericArgs: (t: Type[]) => {
          if (!BasicTypeList.includes(t[0] as BasicType))
            throw new UnsupportedTypeError(`$List<${t[0]}>`);
          return [`List<${t[0]}>`, `Function<boolean>(${t[0]})`] as Type[];
        },
        args: ["List<T>", "Function<boolean>(T)"],
        // return_type: "List<T>"
      },
    },
  ],
  [
    "reduce",
    {
      type: "Function<G>(List<T>, Function<G>(G, T), G)",
      data: {
        eval: (
          variables: Variables,
          list: Data<Array<any>>,
          eval_func: Data<MyFunction>,
          initial_value: Data<any>
        ) => {
          const nestedType = getNestedType(list.type)!;
          return {
            data: list.data.reduce(
              (acc, d) =>
                eval_func.data.eval(
                  variables,
                  { data: acc, type: initial_value.type },
                  { data: d, type: nestedType }
                )?.data,
              initial_value.data
            ),
            type: initial_value.type,
          };
        },
        genericArgs: (t: Type[]) => {
          if (!BasicTypeList.includes(t[0] as BasicType))
            throw new UnsupportedTypeError(`$List<${t[0]}>`);
          if (!BasicTypeList.includes(t[1] as BasicType))
            throw new UnsupportedTypeError(`$List<${t[1]}>`);
          return [`List<${t[0]}>`, `Function<boolean>(${t[1]})`] as Type[];
        },
        args: ["List<T>", "Function<G>(G, T)", "G"],
        // return_type: "List<T>"
      },
    },
  ],
  [
    "slice",
    {
      type: "Function<List<T>>(List<T>, number, number)",
      data: {
        eval: (
          _: Variables,
          list: Data<Array<any>>,
          start: Data<number>,
          end: Data<number>
        ) => {
          return {
            data: list.data.slice(start.data, end.data),
            type: list.type,
          };
        },
        args: ["List<T>", "number", "number"],
      },
    },
  ],
];
