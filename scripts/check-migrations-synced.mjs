#!/usr/bin/env node
// `migrations/` is the source of truth for mongosh migration scripts.
// `infra/mongo/migrations/` is the copy the Helm chart packages into a ConfigMap
// (infra/mongo/templates/migrations-configmap.yaml). `migrations/run-migration.sh`
// refreshes that copy, but nothing else did, so the two drifted. CI runs this.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const source = "migrations";
const copy = "infra/mongo/migrations";
const scripts = (dir) => readdirSync(dir).filter((file) => file.endsWith(".js"));

const problems = [];
for (const file of scripts(source)) {
  const target = join(copy, file);
  if (!existsSync(target)) {
    problems.push(`${target} is missing`);
  } else if (readFileSync(join(source, file), "utf8") !== readFileSync(target, "utf8")) {
    problems.push(`${target} differs from ${join(source, file)}`);
  }
}
for (const file of scripts(copy)) {
  if (!existsSync(join(source, file))) problems.push(`${join(copy, file)} has no source in ${source}/`);
}

if (problems.length) {
  console.error(
    `Migration copies are out of sync. Fix with: cp ${source}/*.js ${copy}/\n- ${problems.join("\n- ")}`
  );
  process.exit(1);
}
console.log(`Migration scripts in sync (${scripts(source).length} files).`);
