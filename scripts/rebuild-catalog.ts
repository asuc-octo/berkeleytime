/**
 * Quick script to populate catalog_classes collection locally.
 * For catalog-only rebuild, use this script.
 *
 * Run from repo root: npx tsx scripts/rebuild-catalog.ts
 * Or inside backend container: npx tsx /backend/scripts/rebuild-catalog.ts
 */
import mongoose from "mongoose";

import { parseTermName } from "@repo/common";
import { CatalogClassModel, TermModel } from "@repo/common/models";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost:3008/bt?directConnection=true";

async function main() {
  console.log("Connecting to MongoDB...", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  // Dynamic import to avoid config issues
  const { buildCatalogClasses } = await import(
    "../apps/datapuller/src/lib/catalog-denormalize"
  );

  const termNames: string[] = await TermModel.distinct("name", {
    hasCatalogData: true,
  });
  const uniqueTerms = [...new Set(termNames)];
  console.log(`Found ${uniqueTerms.length} terms with catalog data.`);

  for (const name of uniqueTerms) {
    const parsed = parseTermName(name);
    if (!parsed) continue;
    const { year, semester } = parsed;

    console.log(`Building catalog for ${year} ${semester}...`);
    const docs = await buildCatalogClasses(year, semester);

    if (docs.length === 0) {
      console.log(`  No classes for ${year} ${semester}, skipping.`);
      continue;
    }

    await CatalogClassModel.deleteMany({ year, semester });

    const BATCH_SIZE = 2000;
    let inserted = 0;
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE);
      const result = await CatalogClassModel.insertMany(batch, {
        ordered: false,
      });
      inserted += result.length;
    }
    console.log(`  Inserted ${inserted} catalog classes.`);
  }

  console.log("Done!");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
