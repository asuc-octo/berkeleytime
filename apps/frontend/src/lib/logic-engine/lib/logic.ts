import { TypeCastError } from "../errors";
import { Data, FunctionMapEntry, Type } from "../types";

export const constructor = (_: Type, v: string): Data<boolean> => {
  if (v === "true") return { data: true, type: "boolean" };
  if (v === "false") return { data: false, type: "boolean" };
  throw new TypeCastError(v, "boolean");
}

export const functions: FunctionMapEntry[] = [
  ["or", {
    eval: (args: Data<Array<boolean>>) => { return { data: args.data.some(v => v), type: "boolean" } },
    args: ["List<boolean>"],
    return_type: "boolean"
  }],
  ["and", {
    eval: (args: Data<Array<boolean>>) => { return { data: args.data.every(v => v), type: "boolean" } },
    args: ["List<boolean>"],
    return_type: "boolean"
  }],
  ["not", {
    eval: (args: Data<boolean>) => { return { data: !args.data, type: "boolean" } },
    args: ["boolean"],
    return_type: "boolean"
  }]
];