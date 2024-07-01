import User from "./user";
import Grade from "./grade";
import Catalog from "./catalog";
import Common from "./common";
import Term from "./term";
import { merge } from "lodash";
import Schedule from "./schedule";

const modules = [User, Grade, Catalog, Common, Schedule, Term];

// Important: Add all your module's resolver in this
export const resolvers = merge(modules.map((module) => module.resolver));

export const typeDefs = modules.map((module) => module.typeDef);
