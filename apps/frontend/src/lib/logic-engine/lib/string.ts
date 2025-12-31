import { TypeCastError } from "../errors";
import { Data, Type, Variables } from "../types";

export const constructor = (
  _: Type,
  v: string,
  __: Variables
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
