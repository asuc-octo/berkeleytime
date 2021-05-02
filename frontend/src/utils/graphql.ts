type GraphQLEdge<T> = {
  node?: T | null;
};

type GraphQLConnection<T> = {
  edges: (GraphQLEdge<T> | null)[];
};

export const getNodes = <T>(x: GraphQLConnection<T>): T[] =>
  x.edges
    .map((edge) => edge?.node)
    .filter((e): e is T => e !== null || e !== void 0);
