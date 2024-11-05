import { createRoot } from "react-dom/client";

import App from "./App";
import "./main.scss";

// setTimeout(() => {
//   throw new Error("Intentional runtime error");
// }, 1000);

createRoot(document.getElementById("root") as HTMLElement).render(<App />);
