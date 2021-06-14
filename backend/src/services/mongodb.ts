import _ from "lodash"
import mongoose from "mongoose"

import { URL_MDB } from "#src/config"

/* useNewUrlParser to fix warning --> (node:57275)
 * DeprecationWarning: current URL string parser is deprecated,
 * and will be removed in a future version. To use the new parser,
 * pass option { useNewUrlParser: true } to MongoClient.connect. */
/* useUnifiedTopology to fix warning --> (node:57231)
 * DeprecationWarning: current Server Discovery and Monitoring
 * engine is deprecated, and will be removed in a future version.
 * To use the new Server Discover and Monitoring engine, pass option
 * { useUnifiedTopology: true } to the MongoClient constructor. */
mongoose.connect(URL_MDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
mongoose.connection.on("open", () => {
  console.log("********** MongoDB Successfully Connected **********")
})
if (process.env.NODE_ENV != "prod") {
  mongoose.set("debug", true)
}
