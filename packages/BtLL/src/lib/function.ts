import { SyntaxError, TypeMismatchError } from "../errors";
import { parseLine } from "../helper";
import { evaluate } from "../interpreter";
import {
  BtLLConfig,
  Data,
  MyFunction,
  StringToType,
  Type,
  Variables,
  isGenericType,
  matchTypes,
} from "../types";

export const runFunction = (
  code: string,
  variables: Map<string, Data<any>> = new Map(),
  config: BtLLConfig = {}
) => {
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    if (line.trim().startsWith("//")) continue;
    if (config.debug) console.log("Evaluating line:", line);
    const [type, var_name, expr, newIndex] = parseLine(lines, i);
    i = newIndex;
    const return_type = StringToType(type);
    if (isGenericType(return_type))
      throw new SyntaxError(line, `Cannot return generic type`);
    const expr_val = evaluate(expr, return_type, variables, config);
    if (config.debug)
      console.log(`EXPR VAL: ${line} ${expr_val.data} (${expr_val.type})`);

    if (matchTypes(expr_val.type, return_type)) {
      if (var_name === "return") return expr_val;
      variables.set(var_name, expr_val);
    } else {
      throw new TypeMismatchError(return_type, expr_val.type, expr);
    }
  }
  return null;
};

export const constructor = (
  type: Type,
  v: string,
  _: Variables,
  config?: BtLLConfig
): Data<MyFunction> => {
  // (arg1, arg2...) { \n code body \n }

  const argTypes = type
    .slice(type.indexOf("(") + 1, type.indexOf(")"))
    .split(",")
    .map((t) => StringToType(t.trim()));

  const functionCode = v.split("\n");
  const functionBody = functionCode
    .slice(1, functionCode.length - 1)
    .join("\n");
  const openBracket = v.indexOf("(");
  const closeBracket = v.indexOf(")");
  const argNames = v
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
        return runFunction(functionBody, localVariables, config);
      },
      args: argTypes,
      // genericArgs: () => []
    },
  };

  return func;
};
