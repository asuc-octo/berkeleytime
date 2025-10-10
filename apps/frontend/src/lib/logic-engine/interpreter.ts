import { TypeMismatchError, SyntaxError, UndefinedFunctionError } from "./errors";
import { argSplit } from "./helper";
import { construct, FUNCTION_MAP, VARIABLE_MAP } from "./language";
import { Data, isGenericType, matchTypes, StringToType, Type } from "./types";

export const run = (code: string) => {
  const lines = code.split("\n");
  for (const line of lines) {
    if (line.trim() === "") continue;
    if (line.trim().startsWith("//")) continue;
    const [type, var_name, ...rest] = line.trim().split(" ");
    const expr = rest.join(" ").trim();
    
    const return_type = StringToType(type);
    if (isGenericType(return_type)) throw new SyntaxError(line, `Cannot return generic type`);
    const expr_val = evaluate(expr, return_type);
    console.log(`EXPR VAL: ${expr_val.data} (${expr_val.type})`);

    if (matchTypes(expr_val.type, return_type)) {
      VARIABLE_MAP.set(var_name, expr_val);
    } else {
      throw new TypeMismatchError(return_type, expr_val.type);
    }
  }

  return VARIABLE_MAP;
}

export const evaluate = (expr: string, expected_type: Type): Data<any> => {
  console.log(VARIABLE_MAP)
  console.log(`EVALUATE: "${expr}" (${expected_type}) ${VARIABLE_MAP.has(expr)}`);
  const functionMatch = expr.match(/^\s*([^\s<>()]+)(?:\<([^\s<>()]+)\>)?\s*\((.*)\)\s*$/);
  if (functionMatch) {
    // function
    const functionName = functionMatch[1];
    const genericType = functionMatch[2]; // Optional generic type parameter
    const argString = functionMatch[3];

    const args = argSplit(argString);

    const func = FUNCTION_MAP.get(functionName);
    if (!func) throw new UndefinedFunctionError(functionName);

    if (func.genericArgs && !genericType) throw new SyntaxError(expr, `Generic type parameter is required for function '${functionName}'`);

    if (args.length !== func.args.length) throw new SyntaxError(expr, `Expected ${func.args.length} arguments but got ${args.length} arguments for function '${functionName}'`);


    const genericArgs = func.genericArgs && genericType ? func.genericArgs(StringToType(genericType)) : [];
    const args_val = args.map((arg, i) => evaluate(arg, (genericArgs.length) ? genericArgs[i] : func.args[i]));

    console.log(`FUNC_EVAL ARGS VAL: ${args_val}`);
    const result = func.eval(...args_val);

    if (isGenericType(result.type)) throw new SyntaxError(expr, `Cannot return generic type`);

    return result;

  } else {
    // single statement
    if (VARIABLE_MAP.has(expr)) {
      const data = VARIABLE_MAP.get(expr) as Data<any>;
      if (!matchTypes(expected_type, data.type)) throw new TypeMismatchError(expected_type, data.type);
      if (isGenericType(data.type)) throw new SyntaxError(expr, `Cannot return generic type`);
      return data;
    } else {
      console.log(`CONSTRUCT: "${expr}" (${expected_type})`);
      return construct(expected_type, expr)
    }
  }
}