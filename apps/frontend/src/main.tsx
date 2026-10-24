// OpenTelemetry must load before App (which creates the Apollo client) so it can
// patch fetch/XHR first. Side-effect imports keep their position (see .prettierrc).
import "./instrumentation";

import { createRoot } from "react-dom/client";

import App from "./App";

import "./main.scss";

createRoot(document.getElementById("root") as HTMLElement).render(<App />);
