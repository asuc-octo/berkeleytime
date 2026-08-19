import { useQuery } from "@apollo/client";

import { ALL_NAV_ITEMS_FOR_STAFF, NavItem } from "../../../lib/api/nav-item";

interface AllNavItemsForStaffResponse {
  allNavItemsForStaff: NavItem[];
}

export const useAllNavItems = () => {
  const query = useQuery<AllNavItemsForStaffResponse>(ALL_NAV_ITEMS_FOR_STAFF);

  return {
    ...query,
    data: query.data?.allNavItemsForStaff ?? [],
  };
};
