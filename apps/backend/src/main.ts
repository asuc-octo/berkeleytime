// Initialize OpenTelemetry instrumentation FIRST before any other imports
import "./instrumentation";

import bootstrap from "./bootstrap";
import { config } from "./config";

bootstrap(config);
