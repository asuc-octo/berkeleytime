// OTel instrumentation must be the first import — in CJS (tsx output),
// static imports become sequential require() calls, so the SDK registers
// its hooks before http/express/mongoose are loaded by bootstrap.
import { config } from "../../../packages/common/src/utils/config";
import bootstrap from "./bootstrap";
import "./instrumentation";

// Start main backend server
bootstrap(config);
