import { Logger } from "tslog";

import decalsPuller from "./pullers/decals";

const log = new Logger({
  type: "pretty",
  prettyLogTimeZone: "local",
});

decalsPuller.scrapeDecals({ log }).then(
  () => process.exit(0),
  (err) => {
    log.error(String(err));
    process.exit(1);
  }
);
