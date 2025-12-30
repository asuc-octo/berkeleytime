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
import { constructor as string_constructor } from "./lib/string";
import {
  BasicTypeList,
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

export const FUNCTION_MAP: Map<string, Data<MyFunction>> = new Map([
  ...logic_functions,
  ...list_functions,
  ...number_functions,
  ["get_attr", get_attr_function],
]);

const CONSTRUCTORS: Map<Type, Constructor> = new Map([
  ["List", list_constructor],
  ["boolean", boolean_constructor],
  ["number", number_constructor],
  ["string", string_constructor],
]);

export const construct = (t: Type, val: string, variables: Variables) => {
  if (getNestedType(t))
    return (CONSTRUCTORS.get(getCollectionTypeToTypeName(t)) as Constructor)(
      t,
      val,
      variables
    );
  return (CONSTRUCTORS.get(t) as Constructor)(t, val, variables);
};

export const PROTECTED_KEYWORDS: Map<string, Data<any>> = new Map([
  ["true", { data: true, type: "boolean" }],
  ["false", { data: false, type: "boolean" }],
]);
