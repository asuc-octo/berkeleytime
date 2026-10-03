import { useQuery } from "@apollo/client";

import {
  GRADES_SESSION_USERS,
  GradesSessionUsersData,
} from "../../../lib/api/analytics";

interface GradesSessionUsersDataResponse {
  gradesSessionUsers: GradesSessionUsersData;
}

export const useGradesSessionUsersData = (days: number) => {
  const query = useQuery<GradesSessionUsersDataResponse>(GRADES_SESSION_USERS, {
    variables: { days },
  });

  return {
    ...query,
    data: query.data?.gradesSessionUsers ?? null,
  };
};
