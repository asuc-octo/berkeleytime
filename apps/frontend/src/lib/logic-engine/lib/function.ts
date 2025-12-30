import { SyntaxError, TypeMismatchError } from "../errors";
import { bracketAwareSplit, evaluate } from "../interpreter";
import { Data, StringToType, Type, isGenericType, matchTypes } from "../types";

export const runFunction = (
  code: string,
  variables: Map<string, Data<any>> = new Map(),
  debug: boolean = false
) => {
  const lines = code.split("\n");
  for (const line of lines) {
    if (line.trim() === "") continue;
    if (line.trim().startsWith("//")) continue;
    console.log("Evaluating line:", line);
    const [type, var_name, ...rest] = bracketAwareSplit(line.trim());
    const expr = rest.join(" ").trim();

    const return_type = StringToType(type);
    if (isGenericType(return_type))
      throw new SyntaxError(line, `Cannot return generic type`);
    const expr_val = evaluate(expr, return_type, variables, debug);
    if (debug)
      console.log(`EXPR VAL: ${line} ${expr_val.data} (${expr_val.type})`);

    if (matchTypes(expr_val.type, return_type)) {
      if (var_name === "return") return expr_val;
      variables.set(var_name, expr_val);
    } else {
      throw new TypeMismatchError(return_type, expr_val.type);
    }
  }
  return null;
};

// export const constructor = (_: Type, v: string): Data<Function> => {
//   // (arg1, arg2...) { code body }
//   const removedQuotes = v.substring(1, v.length - 1);
//   if ((v.charAt(0) !== '"' || v.charAt(v.length - 1) !== '"') && (v.charAt(0) !== "'" || v.charAt(v.length - 1) !== "'")) throw new TypeCastError(v, "string");
//   return {
//     data: removedQuotes,
//     type: "string"
//   }
// }
