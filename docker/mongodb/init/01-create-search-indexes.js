// Create Atlas Search index for catalog_classes collection
// Matches the index name used in apps/backend/src/modules/catalog/controller.ts
//
// This script is idempotent — safe to run on every container startup.

db.createCollection("catalog_classes");

const existing = db.catalog_classes.getSearchIndexes("catalog_search");
if (existing.length === 0) {
  db.catalog_classes.createSearchIndex(
    "catalog_search",
    {
      mappings: {
        dynamic: false,
        fields: {
          searchableNames: [
            { type: "autocomplete" },
            { type: "string" }
          ],
          courseTitle: { type: "string" },
          courseDescription: { type: "string" }
        }
      }
    }
  );
  print("Created catalog_search index.");
} else {
  print("catalog_search index already exists, skipping.");
}
