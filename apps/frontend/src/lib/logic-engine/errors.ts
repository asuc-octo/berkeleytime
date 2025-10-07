import { Type } from "./types";

export class TypeCastError extends Error {
  constructor (v: string, type: Type) {
    super (`Could not cast value ${v} as type ${type}`);
  }
}

export class TypeMismatchError extends Error {
  constructor (expected: Type, actual: Type) {
    super (`Expected type ${expected} but got type ${actual}`)
  }
}

export class UnsupportedTypeError extends Error {
  constructor (type: string) {
    super (`${type} is not supported`)
  }
}

export class SyntaxError extends Error {
  constructor (line: string, message: string) {
    super (`On line ${line}. ${message}`)
  }
}

export class UndefinedFunctionError extends Error {
  constructor (functionName: string) {
    super (`Function ${functionName} is not defined`)
  }
}