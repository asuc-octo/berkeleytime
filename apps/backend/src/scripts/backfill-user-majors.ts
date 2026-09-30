/**
 * One-time, pre-onboarding seed from GradTrak, including populated legacy fields.
 * DRY_RUN=1 performs reads only (no Mongoose model/index initialization).
 * Run before enabling profile editing; see backfill-user-majors.md.
 */
import { MongoClient } from "mongodb";

import { runDegreeBackfill } from "./backfill-user-majors-lib";

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI env var is required");
  const dryRun = process.env.DRY_RUN === "1";
  const cutoff = process.env.BACKFILL_CUTOFF
    ? new Date(process.env.BACKFILL_CUTOFF)
    : undefined;
  if (cutoff && Number.isNaN(cutoff.getTime())) {
    throw new Error("BACKFILL_CUTOFF must be an ISO timestamp");
  }

  const client = new MongoClient(uri, { monitorCommands: dryRun });
  const commands: Record<string, number> = {};
  if (dryRun) {
    client.on("commandStarted", ({ commandName }) => {
      commands[commandName] = (commands[commandName] ?? 0) + 1;
    });
  }
  try {
    await client.connect();
    console.log(dryRun ? "DRY RUN — reads only" : "LIVE RUN");
    const summary = await runDegreeBackfill(client.db(), {
      dryRun,
      cutoff,
      log: console.log,
    });
    console.log("Summary:", JSON.stringify(summary, null, 2));
    if (dryRun) console.log("Database commands:", JSON.stringify(commands));
  } finally {
    await client.close();
  }
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exitCode = 1;
});
