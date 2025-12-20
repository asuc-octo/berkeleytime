import { useMutation } from "@apollo/client";

import {
  ALL_STAFF_MEMBERS,
  DELETE_SEMESTER_ROLE,
  DELETE_STAFF_MEMBER,
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
  const [mutate, result] =
    useMutation<EnsureStaffMemberResponse>(ENSURE_STAFF_MEMBER);

  const ensureStaffMember = async (userId: string, addedBy?: string) => {
    const response = await mutate({
      variables: { userId, addedBy },
      refetchQueries: [
        ALL_STAFF_MEMBERS,
        {
          query: STAFF_MEMBER_BY_USER_ID,
          variables: { userId },
        },
      ],
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
  const [mutate, result] =
    useMutation<UpdateStaffInfoResponse>(UPDATE_STAFF_INFO);

  const updateStaffInfo = async (
    memberId: string,
    input: UpdateStaffInfoInput,
    userId?: string
  ) => {
    const refetchQueries: any[] = [ALL_STAFF_MEMBERS];
    if (userId) {
      refetchQueries.push({
        query: STAFF_MEMBER_BY_USER_ID,
        variables: { userId },
      });
    }

    const response = await mutate({
      variables: { memberId, input },
      refetchQueries,
    });
    return response.data?.updateStaffInfo;
  };

  return { updateStaffInfo, ...result };
};

interface DeleteSemesterRoleResponse {
  deleteSemesterRole: boolean;
}

export const useDeleteSemesterRole = () => {
  const [mutate, result] = useMutation<DeleteSemesterRoleResponse>(
    DELETE_SEMESTER_ROLE,
    {
      refetchQueries: [ALL_STAFF_MEMBERS],
    }
  );

  const deleteSemesterRole = async (roleId: string) => {
    const response = await mutate({
      variables: { roleId },
    });
    return response.data?.deleteSemesterRole;
  };

  return { deleteSemesterRole, ...result };
};

interface DeleteStaffMemberResponse {
  deleteStaffMember: boolean;
}

export const useDeleteStaffMember = () => {
  const [mutate, result] =
    useMutation<DeleteStaffMemberResponse>(DELETE_STAFF_MEMBER);

  const deleteStaffMember = async (memberId: string, userId?: string) => {
    const refetchQueries: any[] = [ALL_STAFF_MEMBERS];
    if (userId) {
      refetchQueries.push({
        query: STAFF_MEMBER_BY_USER_ID,
        variables: { userId },
      });
    }

    const response = await mutate({
      variables: { memberId },
      refetchQueries,
    });
    return response.data?.deleteStaffMember;
  };

  return { deleteStaffMember, ...result };
};
