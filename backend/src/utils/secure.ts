export function secure(resolver: any) {
  return (parent: any, args: any, context: any, info: any) => {
    if (!context.user) {
      throw new Error("Not authenticated");
    }
    return resolver(parent, args, context, info);
  };
}


