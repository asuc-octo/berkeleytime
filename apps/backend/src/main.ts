// OTel instrumentation must be the first import — in CJS (tsx output),
// static imports become sequential require() calls, so the SDK registers
// its hooks before http/express/mongoose are loaded by bootstrap.
import "./instrumentation";

import { config } from "../../../packages/common/src/utils/config";
import bootstrap, { bootstrapCacheWarmingServer } from "./bootstrap";

// Start main backend server
bootstrap(config);

// Start cache warming server (internal only, no public exposure)
bootstrapCacheWarmingServer(config);
