import { expect, test } from "@playwright/test";

import { persistedOperations } from "../../apps/backend/src/bootstrap/graphql/generated/persistedOperations";
import { persistedOperationBySource } from "../helpers/persisted-operation";

const SEMANTIC_SEARCH_TERMS_SOURCE =
  "apps/semantic-search/app/graphql/terms.graphql";
const FRONTEND_TERMS_SOURCE = "apps/frontend/src/lib/api/terms.ts";

type Term = {
  year: number;
  semester: string;
};

const uniqueTermNames = (terms: Term[]) =>
  [...new Set(terms.map(({ year, semester }) => `${year} ${semester}`))].sort();

test("semantic search only discovers terms with catalog data", async ({
  request,
}) => {
  const semanticOperation = Object.values(persistedOperations).find(
    ({ operationName, sources }) =>
      operationName === "SemanticSearchTerms" &&
      sources.includes(SEMANTIC_SEARCH_TERMS_SOURCE)
  );

  expect(semanticOperation).toBeDefined();
  expect(semanticOperation?.document).toContain("terms(withCatalogData:true)");

  const [semanticResponse, frontendResponse] = await Promise.all([
    request.post("/api/graphql", {
      data: persistedOperationBySource(
        SEMANTIC_SEARCH_TERMS_SOURCE,
        "SemanticSearchTerms"
      ),
    }),
    request.post("/api/graphql", {
      data: persistedOperationBySource(FRONTEND_TERMS_SOURCE, "GetTerms"),
    }),
  ]);

  expect(semanticResponse.ok()).toBeTruthy();
  expect(frontendResponse.ok()).toBeTruthy();

  const semanticPayload = await semanticResponse.json();
  const frontendPayload = await frontendResponse.json();

  expect(semanticPayload.errors).toBeUndefined();
  expect(frontendPayload.errors).toBeUndefined();
  expect(uniqueTermNames(semanticPayload.data.terms)).toEqual(
    uniqueTermNames(frontendPayload.data.terms)
  );
});
