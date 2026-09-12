import { ApolloServer, HeaderMap } from "@apollo/server";
import express from "express";
import { Kind, parse, print, stripIgnoredCharacters, visit } from "graphql";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { AddressInfo } from "node:net";
import { test } from "node:test";
import { RedisClientType } from "redis";

import { persistedOperationFetch } from "@repo/shared";

import { persistedOperations } from "./generated/persistedOperations";
import { persistedOperations as previousPersistedOperations } from "./generated/previousPersistedOperations";
import {
  parsePersistedOperationRequest,
  persistedOperationBodyErrorHandler,
  persistedOperationGateway,
} from "./persistedOperationGateway";

test("only the exact persisted-operation request shape is accepted", () => {
  const id = Object.keys(persistedOperations)[0];

  assert.deepEqual(parsePersistedOperationRequest({ id }), { id });
  assert.deepEqual(parsePersistedOperationRequest({ id, variables: {} }), {
    id,
    variables: {},
  });

  for (const body of [
    null,
    [],
    [{ id }],
    { query: "{ __typename }" },
    { id, query: "{ __typename }" },
    { id, operationName: "Anything" },
    { id, extensions: {} },
    { id: "not-a-sha256" },
    { id, variables: [] },
    { id, variables: null },
  ]) {
    assert.equal(parsePersistedOperationRequest(body), null);
  }
});

test("the allowlist contains only one named query or mutation per document", () => {
  assert.ok(Object.keys(persistedOperations).length > 0);

  for (const [id, operation] of Object.entries(persistedOperations)) {
    const document = parse(operation.document);
    const definitions = document.definitions.filter(
      (definition) => definition.kind === Kind.OPERATION_DEFINITION
    );

    assert.equal(definitions.length, 1);
    assert.equal(definitions[0].name?.value, operation.operationName);
    assert.notEqual(definitions[0].operation, "subscription");
    assert.notEqual(operation.operationName, "IntrospectionQuery");

    visit(document, {
      Field(node) {
        assert.notEqual(node.name.value, "__schema");
        assert.notEqual(node.name.value, "__type");
      },
    });

    const authoredDocument = visit(document, {
      Field(node) {
        return node.name.value === "__typename" ? null : undefined;
      },
    });
    const expectedId = createHash("sha256")
      .update(stripIgnoredCharacters(print(authoredDocument)))
      .digest("hex");
    assert.equal(id, expectedId);
  }
});

test("the previous generated allowlist remains available for rolling deployments", () => {
  assert.ok(Object.keys(previousPersistedOperations).length > 0);
});

test("the browser transport strips GraphQL source before calling fetch", async () => {
  const originalFetch = globalThis.fetch;
  let forwardedBody: unknown;

  globalThis.fetch = (async (_input, init) => {
    forwardedBody = JSON.parse(String(init?.body));
    return new Response("{}", { status: 200 });
  }) as typeof fetch;

  try {
    await persistedOperationFetch("https://example.test/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operationName: "SafeOperation",
        query: "query SafeOperation($id: ID!) { node(id: $id) { id } }",
        variables: { id: "1" },
        extensions: { attackerControlled: true },
      }),
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.deepEqual(Object.keys(forwardedBody as object).sort(), [
    "id",
    "variables",
  ]);
  assert.deepEqual((forwardedBody as { variables: unknown }).variables, {
    id: "1",
  });
});

test("the HTTP gateway executes only a server-controlled allowlisted document", async () => {
  const [id, operation] = Object.entries(persistedOperations).find(
    ([, candidate]) => candidate.variableNames.length > 0
  )!;
  let executedBody: unknown;
  let executedContext: unknown;
  let authenticated = false;
  const fakeApollo = {
    async executeHTTPGraphQLRequest({
      httpGraphQLRequest,
      context,
    }: {
      httpGraphQLRequest: { body: unknown };
      context: () => Promise<unknown>;
    }) {
      executedBody = httpGraphQLRequest.body;
      executedContext = await context();
      return {
        headers: new HeaderMap([["content-type", "application/json"]]),
        body: { kind: "complete" as const, string: '{"data":{"ok":true}}' },
      };
    },
  } as unknown as ApolloServer;

  const app = express();
  app.use(express.json({ limit: "1kb" }));
  app.use(persistedOperationBodyErrorHandler);
  app.use((req, _res, next) => {
    Object.assign(req, {
      isAuthenticated: () => authenticated,
      logout: () => undefined,
      user: { _id: "user-from-request", email: "user@example.test" },
    });
    next();
  });
  app.all(
    "/api/graphql",
    persistedOperationGateway(fakeApollo, {} as RedisClientType)
  );

  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const { port } = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${port}/api/graphql`;

  try {
    const valid = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        variables: {
          [operation.variableNames[0]]: "forwarded",
          junk: "must-not-reach-apollo",
        },
      }),
    });
    assert.equal(valid.status, 200);
    assert.deepEqual(await valid.json(), { data: { ok: true } });
    assert.deepEqual(executedBody, {
      query: operation.document,
      operationName: operation.operationName,
      variables: { [operation.variableNames[0]]: "forwarded" },
    });
    const contextUser = (executedContext as { user: Record<string, unknown> })
      .user;
    assert.equal(contextUser._id, "user-from-request");
    assert.equal(contextUser.email, "user@example.test");
    assert.equal(contextUser.isAuthenticated, false);
    assert.equal(typeof contextUser.logout, "function");

    const [previousId, previousOperation] = Object.entries(
      previousPersistedOperations
    ).find(([candidateId]) => !(candidateId in persistedOperations))!;
    assert.ok(
      previousId,
      "expected an operation ID unique to the prior release"
    );

    const previousBundleRequest = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: previousId }),
    });
    assert.equal(previousBundleRequest.status, 200);
    await previousBundleRequest.json();
    assert.deepEqual(executedBody, {
      query: previousOperation.document,
      operationName: previousOperation.operationName,
    });

    authenticated = true;
    const authenticatedRequest = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    assert.equal(authenticatedRequest.status, 200);
    await authenticatedRequest.json();
    assert.equal(
      (executedContext as { user: { isAuthenticated: boolean } }).user
        .isAuthenticated,
      true
    );

    for (const body of [
      { query: "{ __typename }" },
      { query: "query IntrospectionQuery { __schema { types { name } } }" },
      { id, query: "{ __typename }" },
      [{ id }],
      { extensions: { persistedQuery: { sha256Hash: id } } },
    ]) {
      const rejected = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://berkeleytime.com",
          Referer: "https://berkeleytime.com/",
          "User-Agent": "Chrome/123",
        },
        body: JSON.stringify(body),
      });
      assert.equal(rejected.status, 400);
      await rejected.json();
    }

    const unknown = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "0".repeat(64) }),
    });
    assert.equal(unknown.status, 404);
    await unknown.json();

    const get = await fetch(`${url}?query=%7B__typename%7D`);
    assert.equal(get.status, 405);
    await get.json();

    const alternateContentType = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ id }),
    });
    assert.equal(alternateContentType.status, 415);
    await alternateContentType.json();

    const malformedJson = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    assert.equal(malformedJson.status, 400);
    assert.deepEqual(await malformedJson.json(), {
      error: "Invalid JSON request body",
    });

    const oversized = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ padding: "x".repeat(2_000) }),
    });
    assert.equal(oversized.status, 413);
    assert.deepEqual(await oversized.json(), {
      error: "GraphQL request body is too large",
    });
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});
