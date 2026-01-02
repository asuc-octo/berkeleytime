import { UnsupportedTypeError } from "./errors";
import { functions as column_functions } from "./lib/column";
import {
  constructor as course_constructor,
  functions as course_functions,
} from "./lib/course";
import { constructor as function_constructor } from "./lib/function";
import {
  constructor as list_constructor,
  functions as list_functions,
} from "./lib/list";
import {
  constructor as boolean_constructor,
  functions as logic_functions,
} from "./lib/logic";
import {
  constructor as number_constructor,
  functions as number_functions,
} from "./lib/number";
import { constructor as requirement_constructor } from "./lib/requirement";
import {
  constructor as string_constructor,
  functions as string_functions,
} from "./lib/string";
import {
  BtLLConfig,
  Constructor,
  Data,
  MyFunction,
  Type,
  Variables,
  getCollectionTypeToTypeName,
  getNestedType,
  typeAttributeMap,
} from "./types";

const get_attr_function: Data<MyFunction> = {
  data: {
    eval: (_: Variables, obj: Data<any>, attr: Data<string>) => {
      if (typeAttributeMap.get(obj.type)?.includes(attr.data) ?? false)
        return obj.data[attr.data];
      throw new SyntaxError(
        `Attribute '${attr.data}' not found on type '${obj.type}'`
      );
    },
    args: ["G", "string"],
  },
  type: "Function<T>(G, string)",
};

const if_else_function: Data<MyFunction> = {
  data: {
    eval: (
      _: Variables,
      condition: Data<boolean>,
      true_branch: Data<any>,
      false_branch: Data<any>
    ) => {
      if (condition.data) return true_branch;
      return false_branch;
    },
    args: ["boolean", "T", "T"],
  },
  type: "Function<T>(boolean, T, T)",
};

const elseifs_function: Data<MyFunction> = {
  data: {
    eval: (
      _: Variables,
      conditions: Data<Array<boolean>>,
      branches: Data<Array<any>>
    ) => {
      if (conditions.data.length !== branches.data.length - 1)
        throw new SyntaxError(
          `There must be exactly one more branch than conditions: ${conditions.data.length} conditions and ${branches.data.length} branches`
        );
      for (let i = 0; i < conditions.data.length; i++) {
        if (conditions.data[i]) return branches.data[i];
      }

      return branches.data[branches.data.length - 1];
    },
    args: ["List<boolean>", "List<T>"],
  },
  type: "Function<T>(boolean, T, T)",
};

export const FUNCTION_MAP: Map<string, Data<MyFunction>> = new Map([
  ...logic_functions,
  ...list_functions,
  ...number_functions,
  ...column_functions,
  ...string_functions,
  ...course_functions,
  ["get_attr", get_attr_function],
  ["if_else", if_else_function],
  ["elseifs", elseifs_function],
]);

const CONSTRUCTORS: Map<Type, Constructor> = new Map<Type, Constructor>([
  ["List", list_constructor],
  ["boolean", boolean_constructor],
  ["number", number_constructor],
  ["string", string_constructor],
  ["Requirement", requirement_constructor],
  ["Function", function_constructor],
  ["Course", course_constructor],
]);

export const construct = (
  t: Type,
  val: string,
  variables: Variables,
  config: BtLLConfig = {}
) => {
  if (getNestedType(t)) {
    const ct = getCollectionTypeToTypeName(t);
    if (CONSTRUCTORS.has(ct)) {
      return (CONSTRUCTORS.get(ct) as Constructor)(t, val, variables, config);
    }
    throw new UnsupportedTypeError(t);
  }
  if (CONSTRUCTORS.has(t)) {
    return (CONSTRUCTORS.get(t) as Constructor)(t, val, variables, config);
  }
  throw new UnsupportedTypeError(t);
};

export const PROTECTED_KEYWORDS: Map<string, Data<any>> = new Map([
  ["true", { data: true, type: "boolean" }],
  ["false", { data: false, type: "boolean" }],
]);
