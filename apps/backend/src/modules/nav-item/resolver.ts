import {
  CreateNavItemInput,
  NavItemRequestContext,
  UpdateNavItemInput,
  createNavItem,
  deleteNavItem,
  getAllNavItemsForStaff,
  getVisibleNavItems,
  requireStaffMember,
  updateNavItem,
} from "./controller";

const resolvers = {
  Query: {
    // Public query - only returns visible nav items
    allNavItems: () => getVisibleNavItems(),

    // Staff query - returns all nav items including hidden ones
    allNavItemsForStaff: async (
      _: unknown,
      __: unknown,
      context: NavItemRequestContext
    ) => {
      await requireStaffMember(context);
      return getAllNavItemsForStaff();
    },
  },

  Mutation: {
    createNavItem: (
      _: unknown,
      { input }: { input: CreateNavItemInput },
      context: NavItemRequestContext
    ) => createNavItem(context, input),
    updateNavItem: (
      _: unknown,
      { navItemId, input }: { navItemId: string; input: UpdateNavItemInput },
      context: NavItemRequestContext
    ) => updateNavItem(context, navItemId, input),
    deleteNavItem: (
      _: unknown,
      { navItemId }: { navItemId: string },
      context: NavItemRequestContext
    ) => deleteNavItem(context, navItemId),
  },

  NavItem: {
    id: (parent: { _id?: { toString: () => string }; id?: string }) =>
      parent._id?.toString() ?? parent.id,
  },
};

export default resolvers;
