import { merge } from "lodash";

import Catalog from "./catalog";
import Class from "./class";
import Common from "./common";
import Course from "./course";
import Enrollment from "./enrollment";
import Gradtrak from "./gradtrak";
import GradeDistribution from "./grade-distribution";
import Schedule from "./schedule";
import Term from "./term";
import User from "./user";

const modules = [
  User,
  GradeDistribution,
  Catalog,
  Common,
  Schedule,
  Term,
  Course,
  Class,
  Enrollment,
  Gradtrak
];

export const resolvers = merge(modules.map((module) => module.resolver));

export const typeDefs = modules.map((module) => module.typeDef);
