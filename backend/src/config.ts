import dotenv from "dotenv";
dotenv.config();

export interface Config {
  port: number;
  graphqlPath: string;
}

export const config: Config = {
  port: process.env.PORT ? +process.env.PORT : 3000,
  graphqlPath: process.env.GRAPHQL_PATH || "/graphql",
};
