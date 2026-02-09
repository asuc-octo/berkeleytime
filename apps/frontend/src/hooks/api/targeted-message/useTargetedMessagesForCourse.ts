import { useQuery } from "@apollo/client/react";

import "@/lib/api/targeted-message";
import {
  GetTargetedMessagesForCourseDocument,
  GetTargetedMessagesForCourseQuery,
} from "@/lib/generated/graphql";

export const useTargetedMessagesForCourse = (courseId: string) => {
  const query = useQuery<GetTargetedMessagesForCourseQuery>(
    GetTargetedMessagesForCourseDocument,
    {
      variables: { courseId },
      fetchPolicy: "cache-first",
    }
  );

  return {
    ...query,
    data: query.data?.targetedMessagesForCourse,
  };
};
