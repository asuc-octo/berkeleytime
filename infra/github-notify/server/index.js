import fs from "fs/promises";
await fs.writeFile(
  process.env.KUBECONFIG,
  Buffer.from(process.env.KUBERNETES_CREDENTIALS, "base64").toString()
);
import bodyParser from "body-parser";
import express from "express";

const PORT = process.env.NODE_PORT;

const app = express();
app.use(bodyParser.json());
app.use("/webhooks/github", (await import("./routes/github.js")).default);
app.use((err, req, res, next) => {
  if (err) console.error(err);
  res.status(403).send("Request body was not signed or verification failed");
});

console.log(`Server now listening on port ${PORT}`);
app.listen(parseInt(PORT));
