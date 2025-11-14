import { BasicTypeList, Constructor, Data, Function, Type, typeAttributeMap } from "./types";

import { functions as logic_functions, constructor as boolean_constructor } from "./lib/logic";
import { constructor as number_constructor } from "./lib/number";
import { constructor as string_constructor } from "./lib/string";
import { functions as list_functions, constructor as list_constructor } from "./lib/list"

const get_attr_function: Function = {
  eval: (obj: Data<any>, attr: Data<string>) => {
    if (typeAttributeMap.get(obj.type)?.includes(attr.data) ?? false)
      return obj.data[attr.data];
    throw new SyntaxError(`Attribute '${attr.data}' not found on type '${obj.type}'`);
  },
  args: ["T", "string"]
}

export const FUNCTION_MAP: Map<string, Function> = new Map([
  ...logic_functions,
  ...list_functions,
  ["get_attr", get_attr_function]
])

export const VARIABLE_MAP: Map<string, Data<any>> = new Map();

const CONSTRUCTORS: Map<Type, Constructor> = new Map([
  ...BasicTypeList.map((t) => [`List<${t}>`, list_constructor] as [Type, Constructor]),
  ["boolean", boolean_constructor],
  ["number", number_constructor],
  ["string", string_constructor]
]);

export const construct = (t: Type, val: string) => {
  return (CONSTRUCTORS.get(t) as Constructor)(t, val)
}

export const PROTECTED_KEYWORDS: Map<string, Data<any>> = new Map([
  ["true", { data: true, type: "boolean" }],
  ["false", { data: false, type: "boolean" }]
]);