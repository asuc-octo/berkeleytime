import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import { CREATE_NEW_PLAN, Colleges, CreatePlanResponse } from "@/lib/api";
import { gql } from "@apollo/client";

export const useCreatePlan = () => {
  const mutation = useMutation<CreatePlanResponse>(CREATE_NEW_PLAN, {
    update(cache, { data }) {
      const plan = data?.createNewPlan;

      if (!plan) return;

      // Update cache with the new plan (user should only have one plan)
      cache.writeQuery({
        query: gql`
          query GetPlan {
            planByUser {
              _id
              userEmail
              planTerms {
                _id
                name
                userEmail
                year
                term
                courses {
                  courseID
                  courseName
                  courseTitle
                  courseUnits
                  uniReqs
                  collegeReqs
                  pnp
                  transfer
                }
                hidden
                status
                pinned
              }
              majorReqs {
                name
                major
                numCoursesRequired
                satisfyingCourseIds
                isMinor
              }
              majors
              minors
              created
              revised
              colleges
              labels {
                name
                color
              }
              uniReqsSatisfied
              collegeReqsSatisfied
            }
          }
        `,
        data: {
          planByUser: [plan], // Single plan in array format to match schema
        },
      });
    },
  });

  const createPlan = useCallback(
    async (
      colleges: Colleges[],
      majors: string[],
      minors: string[],
      startYear: number,
      endYear: number
    ) => {
      const mutate = mutation[0];

      return await mutate({
        variables: {
          colleges: colleges,
          majors: majors,
          minors: minors,
          startYear: startYear,
          endYear: endYear,
        },
      });
    },
    [mutation]
  );

  return [createPlan, mutation[1]] as [
    mutate: typeof createPlan,
    result: (typeof mutation)[1],
  ];
};
