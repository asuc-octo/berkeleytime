import { useMutation } from "@apollo/client";

import {
  ALL_NAV_ITEMS_FOR_STAFF,
  DELETE_NAV_ITEM,
} from "../../../lib/api/nav-item";

interface DeleteNavItemResponse {
  deleteNavItem: boolean;
}

export const useDeleteNavItem = () => {
  const [mutate, result] = useMutation<DeleteNavItemResponse>(DELETE_NAV_ITEM, {
    refetchQueries: [ALL_NAV_ITEMS_FOR_STAFF],
  });

  const deleteNavItem = async (navItemId: string) => {
    const response = await mutate({
      variables: { navItemId },
    });
    return response.data?.deleteNavItem;
  };

  return { deleteNavItem, ...result };
};
