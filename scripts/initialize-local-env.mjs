#!/usr/bin/env node

import { randomBytes } from "node:crypto";
import { chmodSync, readFileSync, writeFileSync } from "node:fs";

const envPath = process.argv[2] ?? ".env";
const contentState = { value: readFileSync(envPath, "utf8") };
const values = new Map(
  contentState.value
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      return match ? [[match[1], match[2]]] : [];
    })
);

const generated = [];
const randomSecret = () => randomBytes(32).toString("base64url");
const missing = (name) => !values.get(name) || values.get(name).startsWith("<");

function set(name, value) {
  const line = `${name}=${value}`;
  const pattern = new RegExp(`^${name}=.*$`, "m");

  if (pattern.test(contentState.value)) {
    contentState.value = contentState.value.replace(pattern, line);
  } else {
    contentState.value = `${contentState.value.replace(/\n*$/, "")}\n${line}\n`;
  }
  values.set(name, value);
}

if (missing("MONGODB_ROOT_PASSWORD")) {
  set("MONGODB_ROOT_PASSWORD", randomSecret());
  generated.push("MONGODB_ROOT_PASSWORD");
}
if (missing("REDIS_PASSWORD")) {
  set("REDIS_PASSWORD", randomSecret());
  generated.push("REDIS_PASSWORD");
}
if (missing("MINIO_ROOT_PASSWORD")) {
  set("MINIO_ROOT_PASSWORD", randomSecret());
  generated.push("MINIO_ROOT_PASSWORD");
}

const mongoUser = values.get("MONGODB_ROOT_USERNAME") || "bt_dev";
const mongoPassword = values.get("MONGODB_ROOT_PASSWORD");
const redisPassword = values.get("REDIS_PASSWORD");
const minioUser = values.get("MINIO_ROOT_USER") || "bt_dev";
const minioPassword = values.get("MINIO_ROOT_PASSWORD");

const legacyMongoUri = "mongodb://mongodb:27017/bt?replicaSet=rs0";
const legacyRedisUri = "redis://redis:6379";
if (missing("MONGODB_URI") || values.get("MONGODB_URI") === legacyMongoUri) {
  set(
    "MONGODB_URI",
    `mongodb://${mongoUser}:${mongoPassword}@mongodb:27017/bt?authSource=admin&replicaSet=rs0`
  );
}
if (missing("REDIS_URI") || values.get("REDIS_URI") === legacyRedisUri) {
  set("REDIS_URI", `redis://:${redisPassword}@redis:6379`);
}
if (missing("S3_SECRET_ACCESS_KEY") || values.get("S3_SECRET_ACCESS_KEY") === "password") {
  set("S3_SECRET_ACCESS_KEY", minioPassword);
}
if (missing("S3_ACCESS_KEY_ID") || values.get("S3_ACCESS_KEY_ID") === "root") {
  set("S3_ACCESS_KEY_ID", minioUser);
}

writeFileSync(envPath, contentState.value);
chmodSync(envPath, 0o600);

if (generated.length) {
  console.log(`Generated local credentials: ${generated.join(", ")}`);
} else {
  console.log("Local service credentials already configured.");
}
