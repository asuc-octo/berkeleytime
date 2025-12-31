import {
  SyntaxError,
  TypeMismatchError,
  UndefinedFunctionError,
} from "./errors";
import { argSplit } from "./helper";
import { FUNCTION_MAP, PROTECTED_KEYWORDS, construct } from "./language";
import { runFunction } from "./lib/function";
import {
  Data,
  MyFunction,
  StringToType,
  Type,
  Variables,
  isFunctionType,
  isGenericType,
  matchTypes,
} from "./types";

/**
 * Splits a string by spaces, but ignores spaces inside brackets (< >) and parentheses ().
 * This allows splitting things like "List<number> res2 filter(list, find_func)" correctly.
 */
export const bracketAwareSplit = (str: string): string[] => {
  const parts: string[] = [];
  let currentPart = "";
  let angleDepth = 0; // Track depth of angle brackets < >
  let parenDepth = 0; // Track depth of parentheses ( )

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === "<") {
      angleDepth++;
      currentPart += char;
    } else if (char === ">") {
      angleDepth--;
      currentPart += char;
    } else if (char === "(") {
      parenDepth++;
      currentPart += char;
    } else if (char === ")") {
      parenDepth--;
      currentPart += char;
    } else if (char === " " && angleDepth === 0 && parenDepth === 0) {
      // Only split on space if we're not inside any brackets
      if (currentPart.trim()) {
        parts.push(currentPart.trim());
        currentPart = "";
      }
    } else {
      currentPart += char;
    }
  }

  // Add the last part if it exists
  if (currentPart.trim()) {
    parts.push(currentPart.trim());
  }

  return parts;
};

export const init = (
  code: string,
  vars: Map<string, Data<any>> = new Map(),
  debug: boolean = false
) => {
  const variables: Map<string, Data<any>> = new Map([...FUNCTION_MAP, ...vars]);
  const lines = code.split("\n");
  let inFunction = false;
  let functionLines: string[] = [];
  for (const line of lines) {
    if (line.trim() === "") continue;
    if (line.trim().startsWith("//")) continue;
    if (line.trim() === "}") {
      if (!inFunction)
        throw new SyntaxError(line, `Expected function definition`);
      inFunction = false;
      const myLines: string[] = JSON.parse(JSON.stringify(functionLines));

      const [type, var_name, ...rest] = bracketAwareSplit(myLines[0].trim());

      const argTypes = type
        .slice(type.indexOf("(") + 1, type.indexOf(")"))
        .split(",")
        .map((t) => StringToType(t.trim()));

      const expr = rest.join(" ").trim();
      const openBracket = expr.indexOf("(");
      const closeBracket = expr.indexOf(")");
      const argNames = expr
        .slice(openBracket + 1, closeBracket)
        .split(",")
        .map((t) => t.trim());

      const func: Data<MyFunction> = {
        type: StringToType(type),
        data: {
          eval: (variables: Variables, ...args: Data<any>[]) => {
            const localVariables = new Map<string, Data<any>>(variables);
            for (let i = 0; i < argNames.length; i++) {
              localVariables.set(argNames[i], args[i]);
            }
            if (debug) console.log("LOCAL FUNC EVAL", var_name, args);
            return runFunction(
              myLines.slice(1).join("\n"),
              localVariables,
              debug
            );
          },
          args: argTypes,
          // genericArgs: () => []
        },
      };
      if (debug) console.log("FUNC DEFINED", var_name, func);
      variables.set(var_name, func);
      continue;
    }
    const [type, ..._] = bracketAwareSplit(line.trim());
    if (isFunctionType(type)) {
      if (inFunction)
        throw new SyntaxError(
          line,
          `Nested function definitions are not allowed`
        );
      inFunction = true;
      functionLines = [];
    }
    if (inFunction) {
      functionLines.push(line);
    }
  }
  return variables.get("main")?.data.eval(variables, [])?.data;
};

export const evaluate = (
  expr: string,
  expected_type: Type,
  variables: Map<string, Data<any>> = new Map(),
  debug: boolean = false
): Data<any> => {
  if (debug)
    console.log(
      `EVALUATE: "${expr}" (${expected_type}) ${variables.has(expr)}`
    );
  const functionMatch = expr.match(
    /^\s*([^\s<>()]+)(?:\<([^\s<>()]+)\>)?\s*\((.*)\)\s*$/
  );
  if (functionMatch) {
    // function
    const functionName = functionMatch[1];
    const genericTypes =
      functionMatch[2]?.split(",").map((t) => StringToType(t.trim())) ?? []; // Optional generic type parameter
    const argString = functionMatch[3];

    const args = argSplit(argString);

    const funcVar = variables.get(functionName);
    if (!funcVar) throw new UndefinedFunctionError(functionName);
    const func = funcVar.data;

    if (args.length !== func.args.length)
      throw new SyntaxError(
        expr,
        `Expected ${func.args.length} arguments but got ${args.length} arguments for function '${functionName}'`
      );

    // const genericArgs = func.genericArgs && genericTypes ? func.genericArgs(genericTypes) : [];
    const args_val = args.map((arg, i) =>
      evaluate(arg, func.args[i], variables, debug)
    );

    if (debug) console.log(`FUNC_EVAL ARGS:`, functionName, args_val);
    const result = func.eval(variables, ...args_val);

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
        throw new TypeMismatchError(expected_type, data.type);
      if (isGenericType(data.type))
        throw new SyntaxError(expr, `Cannot return generic type`);
      return data;
    } else if (!isGenericType(expected_type)) {
      if (debug) console.log(`CONSTRUCT: "${expr}" (${expected_type})`);
      return construct(expected_type, expr, variables);
    } else {
      // special case -> string and number
      if (expr.startsWith('"') && expr.endsWith('"')) {
        return construct("string", expr, variables);
      } else if (expr.startsWith("'") && expr.endsWith("'")) {
        return construct("string", expr, variables);
      } else if (Number.isFinite(Number(expr))) {
        return construct("number", expr, variables);
      } else if (expr.startsWith("[") && expr.endsWith("]")) {
        return construct("List<T>", expr, variables);
      }
      return {
        data: expr,
        type: "raw",
      };
    }
  }
};
