import { FragmentDefinitionNode, SelectionNode } from "graphql";

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

export const hasFieldPath = (
  nodes: readonly SelectionNode[],
  fragments: Record<string, FragmentDefinitionNode>,
  path: string[]
): boolean => {
  if (path.length === 0) return true;

  for (const node of nodes) {
    if (node.kind === "Field") {
      if (node.name.value !== path[0]) continue;

      if (path.length === 1) return true;
      if (
        node.selectionSet &&
        hasFieldPath(node.selectionSet.selections, fragments, path.slice(1))
      ) {
        return true;
      }
    } else if (node.kind === "InlineFragment") {
      if (hasFieldPath(node.selectionSet.selections, fragments, path))
        return true;
    } else if (node.kind === "FragmentSpread") {
      const fragment = fragments[node.name.value];
      if (
        fragment &&
        hasFieldPath(fragment.selectionSet.selections, fragments, path)
      ) {
        return true;
      }
    }
  }

  return false;
};
