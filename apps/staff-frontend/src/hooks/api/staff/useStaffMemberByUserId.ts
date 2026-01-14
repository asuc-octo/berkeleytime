import { useQuery } from "@apollo/client";

import { STAFF_MEMBER_BY_USER_ID, StaffMember } from "../../../lib/api/staff";

interface StaffMemberByUserIdResponse {
  staffMemberByUserId: StaffMember | null;
}

interface UseStaffMemberByUserIdOptions {
  userId: string | null;
}

export const useStaffMemberByUserId = ({
  userId,
}: UseStaffMemberByUserIdOptions) => {
  const query = useQuery<StaffMemberByUserIdResponse>(STAFF_MEMBER_BY_USER_ID, {
    variables: { userId },
    skip: !userId,
  });

  return {
    ...query,
    data: query.data?.staffMemberByUserId ?? null,
  };
};
