import { merge } from "lodash";

import Catalog from "./catalog";
import Common from "./common";
import Grade from "./grade";
import Schedule from "./schedule";
import Term from "./term";
import User from "./user";

const modules = [User, Grade, Catalog, Common, Schedule, Term];

// Important: Add all your module's resolver in this
export const resolvers = merge(modules.map((module) => module.resolver));

export const typeDefs = modules.map((module) => module.typeDef);
