import User from "./user";
import Grade from "./grade";
import Catalog from "./catalog"
import Common from "./common"
import { merge } from "lodash";

const modules = [User, Grade, Catalog, Common];

// Important: Add all your module's resolver in this
export const resolvers = merge(modules.map((module) => module.resolver));

export const typeDefs = modules.map((module) => module.typeDef);
