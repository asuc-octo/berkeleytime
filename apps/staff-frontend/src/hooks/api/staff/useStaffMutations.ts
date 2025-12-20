import { useMutation } from "@apollo/client";

import {
  ALL_STAFF_MEMBERS,
  ENSURE_STAFF_MEMBER,
  STAFF_MEMBER_BY_USER_ID,
  SemesterRole,
  StaffMember,
  UPDATE_STAFF_INFO,
  UPSERT_SEMESTER_ROLE,
  UpdateStaffInfoInput,
  UpsertSemesterRoleInput,
} from "../../../lib/api/staff";

interface EnsureStaffMemberResponse {
  ensureStaffMember: StaffMember;
}

interface UpsertSemesterRoleResponse {
  upsertSemesterRole: SemesterRole;
}

interface UpdateStaffInfoResponse {
  updateStaffInfo: StaffMember;
}

export const useEnsureStaffMember = () => {
  const [mutate, result] = useMutation<EnsureStaffMemberResponse>(
    ENSURE_STAFF_MEMBER,
    {
      refetchQueries: [ALL_STAFF_MEMBERS],
    }
  );

  const ensureStaffMember = async (userId: string, addedBy?: string) => {
    const response = await mutate({
      variables: { userId, addedBy },
    });
    return response.data?.ensureStaffMember;
  };

  return { ensureStaffMember, ...result };
};

export const useUpsertSemesterRole = () => {
  const [mutate, result] = useMutation<UpsertSemesterRoleResponse>(
    UPSERT_SEMESTER_ROLE,
    {
      refetchQueries: [ALL_STAFF_MEMBERS],
    }
  );

  const upsertSemesterRole = async (
    memberId: string,
    input: UpsertSemesterRoleInput
  ) => {
    const response = await mutate({
      variables: { memberId, input },
    });
    return response.data?.upsertSemesterRole;
  };

  return { upsertSemesterRole, ...result };
};

export const useUpdateStaffInfo = () => {
  const [mutate, result] = useMutation<UpdateStaffInfoResponse>(
    UPDATE_STAFF_INFO,
    {
      refetchQueries: [ALL_STAFF_MEMBERS],
    }
  );

  const updateStaffInfo = async (
    memberId: string,
    input: UpdateStaffInfoInput
  ) => {
    const response = await mutate({
      variables: { memberId, input },
      refetchQueries: [
        ALL_STAFF_MEMBERS,
        {
          query: STAFF_MEMBER_BY_USER_ID,
          variables: { userId: memberId },
        },
      ],
    });
    return response.data?.updateStaffInfo;
  };

  return { updateStaffInfo, ...result };
};
