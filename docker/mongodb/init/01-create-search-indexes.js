// Create Atlas Search indexes for catalog_classes and courseEmbeddings collections.
// Index names match the constants used in apps/backend and apps/semantic-search.
//
// This script is idempotent — safe to run on every container startup.

db.createCollection("catalog_classes");

const existing = db.catalog_classes.getSearchIndexes("catalog_search");
if (existing.length === 0) {
  db.catalog_classes.createSearchIndex("catalog_search", {
    mappings: {
      dynamic: false,
      fields: {
        searchableNames: [{ type: "autocomplete" }, { type: "string" }],
        courseTitle: { type: "string" },
        courseDescription: { type: "string" },
      },
    },
  });
  print("Created catalog_search index.");
} else {
  print("catalog_search index already exists, skipping.");
}

// Create Atlas Vector Search index for courseEmbeddings collection.
// Matches VECTOR_SEARCH_INDEX_NAME in apps/semantic-search/app/engine.py.
// Filter fields (year, semester, subject) enable pre-filtering in $vectorSearch.

db.createCollection("courseEmbeddings");

const existingVS = db.courseEmbeddings.getSearchIndexes(
  "course_embeddings_vector_search"
);
if (existingVS.length === 0) {
  db.courseEmbeddings.createSearchIndex(
    "course_embeddings_vector_search",
    "vectorSearch",
    {
      fields: [
        {
          type: "vector",
          path: "embedding",
          numDimensions: 768,
          similarity: "cosine",
        },
        { type: "filter", path: "year" },
        { type: "filter", path: "semester" },
        { type: "filter", path: "subject" },
      ],
    }
  );
  print("Created course_embeddings_vector_search index.");
} else {
  print("course_embeddings_vector_search index already exists, skipping.");
}
