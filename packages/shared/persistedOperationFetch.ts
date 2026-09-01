import { parse, print, stripIgnoredCharacters, visit } from "graphql";

interface ApolloHttpBody {
  query?: unknown;
  variables?: unknown;
}

async function sha256(value: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function removeApolloTypenames(document: string): string {
  const withoutTypenames = visit(parse(document), {
    Field(node) {
      return node.name.value === "__typename" ? null : undefined;
    },
  });

  return stripIgnoredCharacters(print(withoutTypenames));
}

/**
 * Apollo HttpLink fetch implementation for Berkeleytime's public operation
 * gateway. The GraphQL document is used locally to calculate its stable ID,
 * then removed before the request crosses the public trust boundary.
 */
export const persistedOperationFetch: typeof fetch = async (input, init) => {
  if (init?.method?.toUpperCase() !== "POST" || typeof init.body !== "string") {
    throw new Error("Persisted GraphQL operations must use a JSON POST body");
  }

  const apolloBody = JSON.parse(init.body) as ApolloHttpBody;
  if (typeof apolloBody.query !== "string") {
    throw new Error("Apollo request did not contain a GraphQL document");
  }

  // Apollo injects __typename fields before HttpLink calls fetch. IDs are
  // based on the developer-authored document, while the server executes its
  // own equivalently augmented document to preserve cache normalization.
  const id = await sha256(removeApolloTypenames(apolloBody.query));
  const body =
    apolloBody.variables === undefined
      ? { id }
      : { id, variables: apolloBody.variables };

  return globalThis.fetch(input, {
    ...init,
    body: JSON.stringify(body),
  });
};
