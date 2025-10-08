import { merge } from "lodash";

import Catalog from "./catalog";
import Class from "./class";
import Common from "./common";
import Course from "./course";
import CuratedClasses from "./curated-classes";
import Enrollment from "./enrollment";
import GradeDistribution from "./grade-distribution";
import Rating from "./rating";
import Schedule from "./schedule";
import Term from "./term";
import User from "./user";

const modules = [
  User,
  GradeDistribution,
  Catalog,
  CuratedClasses,
  Common,
  Schedule,
  Term,
  Course,
  Class,
  Enrollment,
  Rating,
];

export const resolvers = merge(modules.map((module) => module.resolver));

export const typeDefs = modules.map((module) => module.typeDef);
