import { TypeCastError } from "../errors";
import { BtLLConfig, Data, FunctionMapEntry, Type, Variables } from "../types";

export const constructor = (
  _: Type,
  v: string,
  __: Variables,
  ___?: BtLLConfig
): Data<string> => {
  const removedQuotes = v.substring(1, v.length - 1);
  if (
    (v.charAt(0) !== '"' || v.charAt(v.length - 1) !== '"') &&
    (v.charAt(0) !== "'" || v.charAt(v.length - 1) !== "'")
  )
    throw new TypeCastError(v, "string");
  return {
    data: removedQuotes,
    type: "string",
  };
};

export const functions: FunctionMapEntry[] = [
  [
    "regex_match",
    {
      type: "Function<boolean>(string, string)",
      data: {
        eval: (_: Variables, str: Data<string>, regex: Data<string>) => {
          return { data: str.data.match(regex.data) !== null, type: "boolean" };
        },
        args: ["string", "string"],
      },
    },
  ],
];
