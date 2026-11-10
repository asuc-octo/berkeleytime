import { Logger } from "tslog";

import { loadConfig } from "./config";
import mongooseLoader from "./mongoose";

export default async function setup(log?: Logger<unknown>) {
  const config = loadConfig(log);
  config.log.trace("Booting up mongo...");
  await mongooseLoader(config);
  return { config };
}
