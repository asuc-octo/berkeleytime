import { TypeCastError } from "../errors";
import { Data, FunctionMapEntry, Type, Variables } from "../types";

export const constructor = (
  _: Type,
  v: string,
  __: Variables
): Data<boolean> => {
  if (v === "true") return { data: true, type: "boolean" };
  if (v === "false") return { data: false, type: "boolean" };
  throw new TypeCastError(v, "boolean");
};

export const functions: FunctionMapEntry[] = [
  [
    "or",
    {
      type: "Function<boolean>(List<boolean>)",
      data: {
        eval: (_: Variables, args: Data<Array<boolean>>) => {
          return { data: args.data.some((v) => v), type: "boolean" };
        },
        args: ["List<boolean>"],
        // return_type: "boolean"
      },
    },
  ],
  [
    "and",
    {
      type: "Function<boolean>(List<boolean>)",
      data: {
        eval: (_: Variables, args: Data<Array<boolean>>) => {
          return { data: args.data.every((v) => v), type: "boolean" };
        },
        args: ["List<boolean>"],
        // return_type: "boolean"
      },
    },
  ],
  [
    "not",
    {
      type: "Function<boolean>(boolean)",
      data: {
        eval: (_: Variables, args: Data<boolean>) => {
          return { data: !args.data, type: "boolean" };
        },
        args: ["boolean"],
        // return_type: "boolean"
      },
    },
  ],
  [
    "equal",
    {
      type: "Function<boolean>(List<T>)",
      data: {
        eval: (_: Variables, args: Data<Array<any>>) => {
          return {
            data: args.data.every((v) => v === args.data[0]),
            type: "boolean",
          };
        },
        args: ["List<T>"],
        // return_type: "boolean"
      },
    },
  ],
];
