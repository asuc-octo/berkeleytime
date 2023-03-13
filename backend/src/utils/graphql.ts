import { GraphQLResolveInfo } from "graphql";

export function getChildren(info: GraphQLResolveInfo): string[] {
  const children = info.fieldNodes[0].selectionSet?.selections;
  return children != undefined ? children.map((child: any) => child.name.value) : [];
}