import User from "./user";
import Grade from "./grade";
import Classes from "./classes";
import { merge } from "lodash";

const modules = [User, Grade, Classes];

// Important: Add all your module's resolver in this
export const resolvers = merge(modules.map((module) => module.resolver));

export const typeDefs = modules.map((module) => module.typeDef);
