import { useQuery } from "@apollo/client";

import { ALL_STAFF_MEMBERS, StaffMember } from "../../../lib/api/staff";

interface AllStaffMembersResponse {
  allStaffMembers: StaffMember[];
}

export const useAllStaffMembers = () => {
  const query = useQuery<AllStaffMembersResponse>(ALL_STAFF_MEMBERS);

  return {
    ...query,
    data: query.data?.allStaffMembers ?? [],
  };
};
