import mongooseLoader from "../bootstrap/loaders/mongoose";
import { loadConfig } from "../config";

export default async function setup() {
  const config = loadConfig();
  console.log("Booting up mongo...");
  await mongooseLoader(config);
  return { config };
}
