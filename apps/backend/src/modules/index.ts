import { merge } from "lodash";

import Catalog from "./catalog";
import Class from "./class";
// import Collection from "./collection"; // TODO: Incomplete module - needs controller
import Common from "./common";
import Course from "./course";
import CuratedClasses from "./curated-classes";
import Enrollment from "./enrollment";
import GradeDistribution from "./grade-distribution";
import Plan from "./plan";
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
  Plan,
  Rating,
  // Collection, // TODO: Incomplete module - needs controller
];

export const resolvers = merge(modules.map((module) => module.resolver));

export const typeDefs = modules.map((module) => module.typeDef);
