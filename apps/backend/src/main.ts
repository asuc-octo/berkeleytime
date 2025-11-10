import bootstrap from "./bootstrap";
import cacheWarmingBootstrap from "./bootstrap/cache-warming";
import { config } from "./config";

// Start main backend server
bootstrap(config);

// Start cache warming server (internal only, no public exposure)
cacheWarmingBootstrap(config);
