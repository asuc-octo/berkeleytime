import bootstrap, { bootstrapCacheWarmingServer } from "./bootstrap";
import { config } from "../../../packages/common/src/utils/config";

// Start main backend server
bootstrap(config);

// Start cache warming server (internal only, no public exposure)
bootstrapCacheWarmingServer(config);
