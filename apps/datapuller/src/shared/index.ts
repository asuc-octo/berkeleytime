import { loadConfig } from "./config";
import mongooseLoader from "./mongoose";

export default async function setup() {
  const config = loadConfig();
  config.log.trace("Booting up mongo...");
  await mongooseLoader(config);
  return { config };
}
