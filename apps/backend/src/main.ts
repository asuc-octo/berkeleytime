import { config } from "../../../packages/common/src/utils/config";
import bootstrap, { bootstrapCacheWarmingServer } from "./bootstrap";

// Start main backend server
bootstrap(config);

// Start cache warming server (internal only, no public exposure)
bootstrapCacheWarmingServer(config);
