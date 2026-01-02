// no constructor
import { argSplit } from "../helper";
import { evaluate } from "../interpreter";
import { BtLLConfig, Data, MyFunction, Type, Variables } from "../types";
import { Column, columnAdapter } from "./column";

export type Requirement = {
  name: Data<string>;
  value: Data<boolean>;
};

export const constructor = (
  _: Type,
  v: string,
  variables: Variables,
  config: BtLLConfig = {}
): Data<Requirement> => {
  const [name, value] = argSplit(v.substring(1, v.length - 1));
  return {
    data: {
      name: evaluate(name, "string", variables, config),
      value: evaluate(value, "boolean", variables, config),
    },
    type: "Requirement",
  };
};
export const definedFields = ["name", "value"];
