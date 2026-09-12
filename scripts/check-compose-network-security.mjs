#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const envPath = process.argv[2];
const composeArgs = ["compose"];
if (envPath) composeArgs.push("--env-file", envPath);
composeArgs.push("config", "--format", "json");

const config = JSON.parse(
  execFileSync("docker", composeArgs, {
    encoding: "utf8",
  })
);

const failures = [];
for (const [service, definition] of Object.entries(config.services ?? {})) {
  for (const port of definition.ports ?? []) {
    if (port.host_ip !== "127.0.0.1") {
      failures.push(`${service} publishes ${port.published} without a loopback host IP`);
    }
  }
}

const redisArgs = config.services?.redis?.environment?.REDIS_ARGS ?? "";
if (!redisArgs.includes("--requirepass")) {
  failures.push("redis does not require authentication");
}

const mongoEnvironment = config.services?.mongodb?.environment ?? {};
if (!mongoEnvironment.MONGODB_INITDB_ROOT_USERNAME || !mongoEnvironment.MONGODB_INITDB_ROOT_PASSWORD) {
  failures.push("mongodb does not configure root authentication");
}

if (failures.length) {
  throw new Error(`Compose security checks failed:\n- ${failures.join("\n- ")}`);
}

console.log("Compose network and database authentication checks passed.");
