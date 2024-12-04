import { loadConfig } from "./config";
import mongooseLoader from "./mongoose";

export default async function setup() {
  const config = loadConfig();
  console.log("Booting up mongo...");
  await mongooseLoader(config);
  return { config };
}
