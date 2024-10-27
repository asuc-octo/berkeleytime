import { Logger } from "tslog";

import { loadConfig } from "./config";

export default function setup() {
  const config = loadConfig();

  const log = new Logger({
    type: "pretty",
    prettyLogTimeZone: "local",
  });

  return { log, config };
}
