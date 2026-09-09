/**
 * One-time migration script: seeds empty user majors and minors from the
 * user's GradTrak plan. Safe to re-run — existing non-empty user fields are
 * never overwritten.
 *
 * Usage:
 *   DRY_RUN=1 npm run migrate:user-majors
 *   npm run migrate:user-majors
 */
import mongoose from "mongoose";

import { VALID_MAJORS, VALID_MINORS } from "@repo/common/lib/degreePrograms";
import { PlanModel, UserModel } from "@repo/common/models";

const BATCH_SIZE = 500;
const DRY_RUN = process.env.DRY_RUN === "1";

type Plan = {
  userEmail: string;
  majors: string[];
  minors: string[];
};

type User = {
  _id: mongoose.Types.ObjectId;
  email: string;
  majors?: string[] | null;
  minors?: string[] | null;
};

type Summary = {
  plansScanned: number;
  usersUpdated: number;
  majorsBackfilled: number;
  minorsBackfilled: number;
  skippedNoUser: number;
  skippedAlreadySet: number;
  skippedInvalidValue: number;
};

const isEmptyOrAbsent = (value: string[] | null | undefined) =>
  value === undefined ||
  value === null ||
  (Array.isArray(value) && value.length === 0);

const emptyFieldFilter = (field: "majors" | "minors") => ({
  $or: [
    { [field]: { $exists: false } },
    { [field]: null },
    { [field]: { $size: 0 } },
  ],
});

async function processBatch(plans: Plan[], summary: Summary) {
  const users = await UserModel.find({
    email: { $in: plans.map((plan) => plan.userEmail) },
  })
    .select({ email: 1, majors: 1, minors: 1 })
    .lean<User[]>();
  const usersByEmail = new Map(users.map((user) => [user.email, user]));

  for (const plan of plans) {
    summary.plansScanned += 1;

    const invalidMajors = plan.majors.filter(
      (major) => !VALID_MAJORS.has(major)
    );
    const invalidMinors = plan.minors.filter(
      (minor) => !VALID_MINORS.has(minor)
    );
    if (invalidMajors.length > 0 || invalidMinors.length > 0) {
      summary.skippedInvalidValue += 1;
      console.log(
        `Skipping ${plan.userEmail}: invalid majors [${invalidMajors.join(", ")}], invalid minors [${invalidMinors.join(", ")}]`
      );
      continue;
    }

    const user = usersByEmail.get(plan.userEmail);
    if (!user) {
      summary.skippedNoUser += 1;
      continue;
    }

    const update: { majors?: string[]; minors?: string[] } = {};
    const emptyFields = [];

    if (plan.majors.length > 0 && isEmptyOrAbsent(user.majors)) {
      update.majors = plan.majors;
      emptyFields.push(emptyFieldFilter("majors"));
    }
    if (plan.minors.length > 0 && isEmptyOrAbsent(user.minors)) {
      update.minors = plan.minors;
      emptyFields.push(emptyFieldFilter("minors"));
    }

    if (Object.keys(update).length === 0) {
      summary.skippedAlreadySet += 1;
      continue;
    }

    const changes = Object.entries(update)
      .map(([field, values]) => `${field}=[${values.join(", ")}]`)
      .join(" ");

    if (DRY_RUN) {
      console.log(`Would update ${plan.userEmail}: ${changes}`);
      summary.usersUpdated += 1;
      summary.majorsBackfilled += update.majors ? 1 : 0;
      summary.minorsBackfilled += update.minors ? 1 : 0;
      continue;
    }

    const result = await UserModel.updateOne(
      { $and: [{ _id: user._id }, ...emptyFields] },
      { $set: update }
    );
    if (result.modifiedCount === 1) {
      console.log(`Updated ${plan.userEmail}: ${changes}`);
      summary.usersUpdated += 1;
      summary.majorsBackfilled += update.majors ? 1 : 0;
      summary.minorsBackfilled += update.minors ? 1 : 0;
    } else {
      summary.skippedAlreadySet += 1;
    }
  }
}

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI env var is required");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
  console.log(DRY_RUN ? "DRY RUN — no users will be changed" : "LIVE RUN");

  try {
    const filter = {
      $or: [
        { "majors.0": { $exists: true } },
        { "minors.0": { $exists: true } },
      ],
    };
    const total = await PlanModel.countDocuments(filter);
    console.log(`Found ${total} plans with majors or minors`);

    const summary: Summary = {
      plansScanned: 0,
      usersUpdated: 0,
      majorsBackfilled: 0,
      minorsBackfilled: 0,
      skippedNoUser: 0,
      skippedAlreadySet: 0,
      skippedInvalidValue: 0,
    };
    const cursor = PlanModel.find(filter)
      .select({ userEmail: 1, majors: 1, minors: 1 })
      .lean<Plan>()
      .cursor();
    const batch: Plan[] = [];

    for await (const plan of cursor) {
      batch.push(plan);
      if (batch.length >= BATCH_SIZE) {
        await processBatch(batch, summary);
        batch.length = 0;
        console.log(`Processed ${summary.plansScanned} of ${total} plans`);
      }
    }

    await processBatch(batch, summary);

    console.log("\nSummary");
    console.log(`  Plans scanned: ${summary.plansScanned}`);
    console.log(
      `  Users ${DRY_RUN ? "that would be updated" : "updated"}: ${summary.usersUpdated}`
    );
    console.log(
      `  Majors ${DRY_RUN ? "that would be backfilled" : "backfilled"}: ${summary.majorsBackfilled}`
    );
    console.log(
      `  Minors ${DRY_RUN ? "that would be backfilled" : "backfilled"}: ${summary.minorsBackfilled}`
    );
    console.log(`  Skipped — no user: ${summary.skippedNoUser}`);
    console.log(`  Skipped — already set: ${summary.skippedAlreadySet}`);
    console.log(`  Skipped — invalid value: ${summary.skippedInvalidValue}`);
  } finally {
    await mongoose.disconnect();
  }
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
