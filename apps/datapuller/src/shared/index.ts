import mongooseLoader from "./mongoose";
import { loadConfig } from "../config";

export default async function setup() {
  const config = loadConfig();
  config.log.info("Booting up mongo...");
  await mongooseLoader(config);
  return { config };
}
