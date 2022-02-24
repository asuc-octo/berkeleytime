import * as GQL from "type-graphql";

import { User_Model } from "#src/models/_index";

import Typegoose, { prop } from "@typegoose/typegoose";

declare namespace Express {
  interface Request {
    user?: User;
  }
}

export type ENUM_SEMESTER = "Spring" | "Summer" | "Fall";

// https://stackoverflow.com/questions/34508081/how-to-add-typescript-definitions-to-express-req-res
type TypedRequest<
  ReqBody = Record<string, unknown>,
  QueryString = Record<string, unknown>
> = Request<
  Record<string, unknown>,
  Record<string, unknown>,
  Partial<ReqBody>,
  Partial<QueryString>
>;
export type ExpressMiddleware<
  ReqBody = Record<string, unknown>,
  Res = Record<string, unknown>,
  QueryString = Record<string, unknown>
> = (
  req: TypedRequest<ReqBody, QueryString>,
  res: Response<Res>,
  next: NextFunction
) => Promise<void> | void;

/*
 * "Does Typescript support mutually exclusive types?"
 * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
 * usage:
 * interface Cat { isCat: true; }
 * interface Dog { isDog: true; }
 * interface Bird { isBird: true; }
 * type Animal = OneOf<[Cat, Dog, Bird]>;
 */
type Values<T extends {}> = T[keyof T];
type Tuplize<T extends {}[]> = Pick<
  T,
  Exclude<keyof T, Extract<keyof {}[], string> | number>
>;
type _OneOf<T extends {}> = Values<{
  [K in keyof T]: T[K] & {
    [M in Values<{ [L in keyof Omit<T, K>]: keyof T[L] }>]?: undefined;
  };
}>;
export type OneOf<T extends {}[]> = _OneOf<Tuplize<T>>;

interface FixedLengthArray<L extends number, T> extends ArrayLike<T> {
  length: L;
}
