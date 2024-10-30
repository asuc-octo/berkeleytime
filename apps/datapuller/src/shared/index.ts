import { loadConfig } from "./config";

export default function setup() {
  const config = loadConfig();
  return { config };
}
