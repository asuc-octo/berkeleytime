import { SelectionNode } from "graphql";

// Recursively retrieve all fields from a GraphQL query
export const getFields = (nodes: readonly SelectionNode[]): string[] => {
  return Array.from(
    new Set(
      nodes.flatMap((node) => {
        if (node.kind !== "Field") return [];

        const value = node.name.value;

        return node.selectionSet
          ? [value, ...getFields(node.selectionSet.selections)]
          : [value];
      })
    )
  );
};

// TODO: Middleware to detect expensive queries
