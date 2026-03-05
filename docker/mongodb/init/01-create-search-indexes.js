// Create Atlas Search index for catalog_classes collection
// Matches the index name used in apps/backend/src/modules/catalog/controller.ts

// Ensure the collection exists (createSearchIndex requires it)
db.createCollection("catalog_classes");

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
