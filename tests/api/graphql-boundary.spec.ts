import { expect, test } from "@playwright/test";

const rawQuery = { query: "{ __typename }" };

test.describe("Public GraphQL trust boundary", () => {
  test("rejects arbitrary GraphQL source text", async ({ request }) => {
    const response = await request.post("/api/graphql", { data: rawQuery });
    expect(response.status()).toBe(400);
  });

  test("rejects production introspection", async ({ request }) => {
    const response = await request.post("/api/graphql", {
      data: {
        query: "query IntrospectionQuery { __schema { types { name } } }",
      },
    });
    expect(response.status()).toBe(400);
  });

  test("forged browser headers grant no raw GraphQL access", async ({
    request,
  }) => {
    const response = await request.post("/api/graphql", {
      data: rawQuery,
      headers: {
        Origin: "https://berkeleytime.com",
        Referer: "https://berkeleytime.com/",
        "User-Agent": "Chrome/123",
      },
    });
    expect(response.status()).toBe(400);
  });

  test("rejects unknown operation IDs", async ({ request }) => {
    const response = await request.post("/api/graphql", {
      data: { id: "0".repeat(64) },
    });
    expect(response.status()).toBe(404);
  });

  test("rejects an allowlist-shaped request containing query text", async ({
    request,
  }) => {
    const response = await request.post("/api/graphql", {
      data: { id: "0".repeat(64), query: "{ __typename }" },
    });
    expect(response.status()).toBe(400);
  });

  test("rejects batched requests", async ({ request }) => {
    const response = await request.post("/api/graphql", {
      data: [{ id: "0".repeat(64) }, rawQuery],
    });
    expect(response.status()).toBe(400);
  });

  test("rejects GET, alternate content types, and persisted-query extensions", async ({
    request,
  }) => {
    const getResponse = await request.get(
      "/api/graphql?query=%7B__typename%7D"
    );
    expect([403, 405]).toContain(getResponse.status());

    const textResponse = await request.post("/api/graphql", {
      data: JSON.stringify(rawQuery),
      headers: { "Content-Type": "text/plain" },
    });
    expect(textResponse.status()).toBe(415);

    const extensionResponse = await request.post("/api/graphql", {
      data: {
        extensions: {
          persistedQuery: { version: 1, sha256Hash: "0".repeat(64) },
        },
      },
    });
    expect(extensionResponse.status()).toBe(400);
  });

  test("trailing slash cannot restore raw Apollo behavior", async ({
    request,
  }) => {
    const response = await request.post("/api/graphql/", { data: rawQuery });
    expect([400, 404]).toContain(response.status());
  });
});
