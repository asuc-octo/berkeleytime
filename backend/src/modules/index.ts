import User from "./user";
import Grade from "./grade";
import Catalog from "./catalog"
import { merge } from "lodash";

const modules = [User, Grade, Catalog];

// Important: Add all your module's resolver in this
export const resolvers = merge(modules.map((module) => module.resolver));

export const typeDefs = modules.map((module) => module.typeDef);
