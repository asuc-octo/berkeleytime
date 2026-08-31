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
import Explore from "./explore";
import GradeDistribution from "./grade-distribution";
import NavItem from "./nav-item";
import Plan from "./plan";
import Pod from "./pod";
import Rating from "./rating";
import RouteRedirect from "./route-redirect";
import Schedule from "./schedule";
import Staff from "./staff";
import TargetedMessage from "./targeted-message";
import Term from "./term";
import Tracking from "./tracking";
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
  Explore,
  Plan,
  Rating,
  RouteRedirect,
  NavItem,
  Pod,
  TargetedMessage,
  Tracking,
];

export const resolvers = merge(modules.map((module) => module.resolver));

export const typeDefs = modules.flatMap((module) =>
  "typeDefs" in module ? module.typeDefs : [module.typeDef]
);
