import bootstrap, { bootstrapCacheWarmingServer } from "./bootstrap";
import { config } from "./config";

// Start main backend server
bootstrap(config);

// Start cache warming server (internal only, no public exposure)
bootstrapCacheWarmingServer(config);
