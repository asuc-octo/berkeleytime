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

/**
 * Fast check to determine if an expression could possibly be a function call.
 * Returns false if we can definitively say it's NOT a function call.
 * This avoids expensive parsing for literals and simple variables.
 */
const couldBeFunctionCall = (expr: string): boolean => {
  if (expr.length === 0) return false;

  const firstChar = expr[0];
  const lastChar = expr[expr.length - 1];

  // String literals: "hello" or 'world'
  if ((firstChar === '"' || firstChar === "'") && lastChar === firstChar) {
    return false;
  }

  // List literals: [1, 2, 3]
  if (firstChar === "[" && lastChar === "]") {
    return false;
  }

  // Definitely not a function if it doesn't end with )
  if (lastChar !== ")") {
    return false;
  }

  // Could be a function call
  return true;
};

export const init = (
  code: string,
  vars: Map<string, Data<any>> = new Map(),
  config: BtLLConfig = {}
) => {
  const variables: Map<string, Data<any>> = new Map([...FUNCTION_MAP, ...vars]);
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("//")) continue;

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
  try {
    if (config.debug)
      console.log(
        `EVALUATE: "${expr}" (${expected_type}) ${variables.has(expr)}`
      );

    // Fast path: skip expensive functionMatch() for non-function expressions
    if (couldBeFunctionCall(expr)) {
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

        if (config.debug)
          console.log(`FUNC_EVAL ARGS:`, functionName, args_val);
        const result = funcVar.data.eval(variables, ...args_val);

        if (isGenericType(result.type))
          throw new SyntaxError(expr, `Cannot return generic type`);

        return result;
      }
    }

    // Not a function call - handle as single statement
    // Optimize: single Map lookup instead of has() + get()
    const keyword = PROTECTED_KEYWORDS.get(expr);
    if (keyword) return keyword;

    const data = variables.get(expr);
    if (data) {
      if (!matchTypes(expected_type, data.type))
        throw new TypeMismatchError(expected_type, data.type, expr);
      if (isGenericType(data.type))
        throw new SyntaxError(expr, `Cannot return generic type`);
      return data;
    }

    // Handle literals and construction
    if (!isGenericType(expected_type)) {
      if (config.debug) console.log(`CONSTRUCT: "${expr}" (${expected_type})`);
      return construct(expected_type, expr, variables, config);
    }

    // Generic type - need to infer from literal
    const firstChar = expr[0];
    const lastChar = expr[expr.length - 1];

    // String literals
    if ((firstChar === '"' || firstChar === "'") && lastChar === firstChar) {
      return construct("string", expr, variables, config);
    }

    // List literals
    if (firstChar === "[" && lastChar === "]") {
      return construct("List<T>", expr, variables, config);
    }

    // Number literals - optimize: parse once instead of twice
    const num = Number(expr);
    if (Number.isFinite(num)) {
      return construct("number", expr, variables, config);
    }

    return {
      data: expr,
      type: "raw",
    };
  } catch (error) {
    console.error(`Error evaluating expression: ${expr}`, error);
    throw error;
  }
};
