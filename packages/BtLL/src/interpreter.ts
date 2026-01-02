import { SyntaxError, TypeMismatchError } from "./errors";
import { argSplit, functionMatch, parseLine } from "./helper";
import { FUNCTION_MAP, PROTECTED_KEYWORDS, construct } from "./language";
import { constructor as functionConstructor } from "./lib/function";
import {
  BtLLConfig,
  Data,
  Type,
  isFunctionType,
  isGenericType,
  matchTypes,
} from "./types";

export const init = (
  code: string,
  vars: Map<string, Data<any>> = new Map(),
  config: BtLLConfig = {}
) => {
  const variables: Map<string, Data<any>> = new Map([...FUNCTION_MAP, ...vars]);
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    if (line.trim().startsWith("//")) continue;

    const [type, var_name, expr, newIndex] = parseLine(lines, i);
    i = newIndex;

    if (isFunctionType(type)) {
      const func = functionConstructor(type, expr, variables, config);
      if (config.debug) console.log("FUNC DEFINED", var_name, func);
      variables.set(var_name, func);
    }
  }
  return variables.get("main")?.data.eval(variables, [], config.debug)?.data;
};

export const evaluate = (
  expr: string,
  expected_type: Type,
  variables: Map<string, Data<any>> = new Map(),
  config: BtLLConfig = {}
): Data<any> => {
  if (config.debug)
    console.log(
      `EVALUATE: "${expr}" (${expected_type}) ${variables.has(expr)}`
    );
  const functionRes = functionMatch(expr);

  if (functionRes) {
    const [functionName, argList] = functionRes;
    if (config.debug) console.log(`FUNCTION MATCH:`, argList);
    let funcVar = variables.get(functionName);
    const args = argSplit(argList);
    if (funcVar && args.length !== funcVar.data.args.length)
      throw new SyntaxError(
        expr,
        `Expected ${funcVar.data.args.length} arguments but got ${args.length} arguments for function '${functionName}'`
      );
    const args_val =
      argList.length > 0
        ? args.map((arg, i) =>
            evaluate(
              arg,
              funcVar ? funcVar.data.args[i] : "T",
              variables,
              config
            )
          )
        : [];
    if (!funcVar)
      funcVar = functionConstructor(
        `Function<${expected_type}>(${args_val.map((arg) => arg.type).join(", ")})`,
        functionName,
        variables,
        config
      );

    if (config.debug) console.log(`FUNC_EVAL ARGS:`, functionName, args_val);
    const result = funcVar.data.eval(variables, ...args_val);

    if (isGenericType(result.type))
      throw new SyntaxError(expr, `Cannot return generic type`);

    return result;
  } else {
    // single statement
    if (PROTECTED_KEYWORDS.has(expr)) {
      return PROTECTED_KEYWORDS.get(expr)!;
    } else if (variables.has(expr)) {
      const data = variables.get(expr) as Data<any>;
      if (!matchTypes(expected_type, data.type))
        throw new TypeMismatchError(expected_type, data.type, expr);
      if (isGenericType(data.type))
        throw new SyntaxError(expr, `Cannot return generic type`);
      return data;
    } else if (!isGenericType(expected_type)) {
      if (config.debug) console.log(`CONSTRUCT: "${expr}" (${expected_type})`);
      return construct(expected_type, expr, variables, config);
    } else {
      // special case -> string and number
      if (expr.startsWith('"') && expr.endsWith('"')) {
        return construct("string", expr, variables, config);
      } else if (expr.startsWith("'") && expr.endsWith("'")) {
        return construct("string", expr, variables, config);
      } else if (Number.isFinite(Number(expr))) {
        return construct("number", expr, variables, config);
      } else if (expr.startsWith("[") && expr.endsWith("]")) {
        return construct("List<T>", expr, variables, config);
      }
      return {
        data: expr,
        type: "raw",
      };
    }
  }
};
