import { merge } from "lodash";

import Analytics from "./analytics";
import Banner from "./banner";
import Catalog from "./catalog";
import Class from "./class";
import Collection from "./collection";
import Common from "./common";
import Course from "./course";
import CuratedClasses from "./curated-classes";
import Enrollment from "./enrollment";
import GradeDistribution from "./grade-distribution";
import Plan from "./plan";
import Pod from "./pod";
import Rating from "./rating";
import Schedule from "./schedule";
import Staff from "./staff";
import Term from "./term";
import User from "./user";

const modules = [
  Analytics,
  Banner,
  User,
  GradeDistribution,
  Catalog,
  CuratedClasses,
  Collection,
  Common,
  Schedule,
  Staff,
  Term,
  Course,
  Class,
  Enrollment,
  Plan,
  Rating,
  Pod,
];

export const resolvers = merge(modules.map((module) => module.resolver));

export const typeDefs = modules.flatMap((module) =>
  "typeDefs" in module ? module.typeDefs : [module.typeDef]
);
