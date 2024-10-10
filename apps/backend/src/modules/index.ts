import { merge } from "lodash";

import Catalog from "./catalog";
import Class from "./class";
import Common from "./common";
import Course from "./course";
import Grade from "./grade";
import Schedule from "./schedule";
import Term from "./term";
import User from "./user";

const modules = [User, Grade, Catalog, Common, Schedule, Term, Course, Class];

export const resolvers = merge(modules.map((module) => module.resolver));

export const typeDefs = modules.map((module) => module.typeDef);
