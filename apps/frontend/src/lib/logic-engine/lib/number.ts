import { TypeCastError } from "../errors";
import { Data, Type } from "../types";

export const constructor = (_: Type, v: string): Data<any> => {
  if (isNaN(parseFloat(v))) throw new TypeCastError(v, "number");
  return { data: parseFloat(v), type: "number" };
}