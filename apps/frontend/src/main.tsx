import { createRoot } from "react-dom/client";

import App from "./App";
import "./main.scss";

// const t: Number[] = [];
// console.log(t[0]);

createRoot(document.getElementById("root") as HTMLElement).render(<App />);
