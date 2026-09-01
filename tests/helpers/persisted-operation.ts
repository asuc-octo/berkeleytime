import { stripIgnoredCharacters } from "graphql";
import { createHash } from "node:crypto";

import { persistedOperations } from "../../apps/backend/src/bootstrap/graphql/generated/persistedOperations";

export function persistedOperation(
  document: string,
  variables?: Record<string, unknown>
) {
  const id = createHash("sha256")
    .update(stripIgnoredCharacters(document))
    .digest("hex");

  return variables === undefined ? { id } : { id, variables };
}

export function persistedOperationBySource(
  source: string,
  operationName: string,
  variables?: Record<string, unknown>
) {
  const matches = Object.entries(persistedOperations).filter(
    ([, operation]) =>
      operation.operationName === operationName &&
      operation.sources.includes(source)
  );

  if (matches.length !== 1) {
    throw new Error(
      `Expected one persisted ${operationName} operation from ${source}, found ${matches.length}`
    );
  }

  const id = matches[0][0];
  return variables === undefined ? { id } : { id, variables };
}
