import { TypeCastError } from "../errors";
import { Data, FunctionMapEntry, Type, Variables } from "../types";

export const constructor = (_: Type, v: string, __: Variables): Data<any> => {
  if (isNaN(parseFloat(v))) throw new TypeCastError(v, "number");
  return { data: parseFloat(v), type: "number" };
};

export const functions: FunctionMapEntry[] = [
  [
    "add",
    {
      type: "Function<number>(List<number>)",
      data: {
        eval: (_: Variables, args: Data<Array<number>>) => {
          return { data: args.data.reduce((a, b) => a + b, 0), type: "number" };
        },
        args: ["List<number>"],
      },
    },
  ],
  [
    "greater_than",
    {
      type: "Function<boolean>(number, number)",
      data: {
        eval: (_: Variables, arg1: Data<number>, arg2: Data<number>) => {
          return { data: arg1.data > arg2.data, type: "boolean" };
        },
        args: ["number", "number"],
      },
    },
  ],
  [
    "less_than",
    {
      type: "Function<boolean>(number, number)",
      data: {
        eval: (_: Variables, arg1: Data<number>, arg2: Data<number>) => {
          return { data: arg1.data < arg2.data, type: "boolean" };
        },
        args: ["number", "number"],
      },
    },
  ],
];
