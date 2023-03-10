export function secure(resolver: any) {
  return (parent: any, args: any, contextValue: any, info: any) => {
    if (!contextValue.user) {
      throw new Error("Not authenticated");
    }
    return resolver(parent, args, contextValue, info);
  };
}


