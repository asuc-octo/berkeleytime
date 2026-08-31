import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphql } from "graphql";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import authDirectiveTransformer from "./auth";

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../../.."
);

const schema = authDirectiveTransformer(
  makeExecutableSchema({
    typeDefs: `
      directive @auth on OBJECT | FIELD_DEFINITION
      type Query {
        privateValue: String! @auth
      }
    `,
    resolvers: {
      Query: { privateValue: () => "authenticated" },
    },
  })
);

test("@auth continues to reject unauthenticated operation execution", async () => {
  const result = await graphql({
    schema,
    source: "query PrivateValue { privateValue }",
    contextValue: { user: { isAuthenticated: false } },
  });

  assert.equal(result.data, null);
  assert.match(result.errors?.[0]?.message ?? "", /Not authenticated/);
  assert.equal(result.errors?.[0]?.extensions.code, "UNAUTHENTICATED");
});

test("@auth continues to allow authenticated operation execution", async () => {
  const result = await graphql({
    schema,
    source: "query PrivateValue { privateValue }",
    contextValue: { user: { isAuthenticated: true } },
  });

  assert.deepEqual(result.errors, undefined);
  assert.equal(result.data?.privateValue, "authenticated");
});

test("staff directory and pod fields remain protected in the schema", () => {
  const staffSchema = readFileSync(
    resolve(repositoryRoot, "packages/gql-typedefs/staff.ts"),
    "utf8"
  );
  const podSchema = readFileSync(
    resolve(repositoryRoot, "packages/gql-typedefs/pod.ts"),
    "utf8"
  );

  assert.match(staffSchema, /allUsers:\s*\[UserSearchResult!\]!\s*@auth/);
  assert.match(
    staffSchema,
    /staffMemberByUserId\(userId:\s*ID!\):\s*StaffMember\s*@auth/
  );
  assert.match(podSchema, /allPods:\s*\[Pod!\]!\s*@auth/);
});
