import express from "express";
import loaders from "./loaders";
import { Config } from "../config";
import http from "http";
import https from "https"
import fs from "fs"

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}

export default async (config: Config) => {
  const app = express();

  await loaders(app);

  // const httpServer = http.createServer(app);
  // await httpServer.listen(config.port)

  const httpsServer = https.createServer(options, app)
  await httpsServer.listen(config.port)

  console.log(`🚀\tServer ready (in Docker network) at:\thttp://localhost:${config.port}${config.backendPath}`);
  console.log(`\tServer ready (in Host network) at:\thttp://localhost:8080${config.backendPath}`)
};
