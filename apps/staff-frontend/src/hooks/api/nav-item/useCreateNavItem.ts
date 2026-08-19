import { useMutation } from "@apollo/client";

import {
  ALL_NAV_ITEMS_FOR_STAFF,
  CREATE_NAV_ITEM,
  CreateNavItemInput,
  NavItem,
} from "../../../lib/api/nav-item";

interface CreateNavItemResponse {
  createNavItem: NavItem;
}

export const useCreateNavItem = () => {
  const [mutate, result] = useMutation<CreateNavItemResponse>(CREATE_NAV_ITEM, {
    refetchQueries: [ALL_NAV_ITEMS_FOR_STAFF],
  });

  const createNavItem = async (input: CreateNavItemInput) => {
    const response = await mutate({
      variables: { input },
    });
    return response.data?.createNavItem;
  };

  return { createNavItem, ...result };
};
