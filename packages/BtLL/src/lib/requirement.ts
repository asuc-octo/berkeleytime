// no constructor
import { argSplit } from "../helper";
import { evaluate } from "../interpreter";
import { Data, MyFunction, Type, Variables } from "../types";
import { Column, columnAdapter } from "./column";

export type Requirement = {
  name: Data<string>;
  value: Data<MyFunction>;
};

export const constructor = (
  _: Type,
  v: string,
  variables: Variables,
  debug: boolean = false
): Data<Requirement> => {
  const [name, value] = argSplit(v.substring(1, v.length - 1));
  return {
    data: {
      name: evaluate(name, "string", variables, debug),
      value: evaluate(value, "Function<boolean>()", variables, debug),
    },
    type: "Requirement",
  };
};
export const definedFields = ["name", "value"];
