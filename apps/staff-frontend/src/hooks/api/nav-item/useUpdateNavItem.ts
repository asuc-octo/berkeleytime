import { useMutation } from "@apollo/client";

import {
  ALL_NAV_ITEMS_FOR_STAFF,
  NavItem,
  UPDATE_NAV_ITEM,
  UpdateNavItemInput,
} from "../../../lib/api/nav-item";

interface UpdateNavItemResponse {
  updateNavItem: NavItem;
}

export const useUpdateNavItem = () => {
  const [mutate, result] = useMutation<UpdateNavItemResponse>(UPDATE_NAV_ITEM, {
    refetchQueries: [ALL_NAV_ITEMS_FOR_STAFF],
  });

  const updateNavItem = async (
    navItemId: string,
    input: UpdateNavItemInput
  ) => {
    const response = await mutate({
      variables: { navItemId, input },
    });
    return response.data?.updateNavItem;
  };

  return { updateNavItem, ...result };
};
