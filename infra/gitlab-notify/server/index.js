import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import gitlab from "./routes/gitlab.js";

const PORT = 5000;
axios.defaults.headers["Content-Type"] = "application/json";

const app = express();
app.use(bodyParser.json());

app.use("/gitlab", gitlab);

console.log(`Server now listening on port ${PORT}`);
app.listen(PORT);
