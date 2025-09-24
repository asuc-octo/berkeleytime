import { useCallback } from "react";

import { gql, useMutation } from "@apollo/client";

import {
  CREATE_NEW_PLAN,
  Colleges,
  CreatePlanResponse
} from "@/lib/api";

export const useCreatePlan = () => {
  const mutation = useMutation<CreatePlanResponse>(CREATE_NEW_PLAN, {
    update(cache, { data }) {
      const plan = data?.createNewPlan;

      if (!plan) return;

      cache.modify({
        fields: {
          plans: (existingPlans = []) => {
            const reference = cache.writeFragment({
              data: plan,
              fragment: gql`
                fragment CreatedPlan on Plan {
                  userEmail
                  planTerms {
                    _id
                    name
                    userEmail
                    year
                    term
                    courses {
                      classID
                      uniReqs
                      collegeReqs
                    }
                    customEvents {
                      title
                      description
                      uniReqs
                      collegeReqs
                    }
                  }
                  majors
                  minors
                  uniReqs
                  collegeReqs
                  majorReqs {
                    name
                    major
                    numCoursesRequired
                    satisfyingCourseIds
                    isMinor
                  }
                  created
                  revised
                }
              `,
            });

            return [...existingPlans, reference];
          },
        },
      });
    },
  });

  const createPlan = useCallback(
    async (college: Colleges, majors: string[], minors: string[]) => {
      const mutate = mutation[0];

      return await mutate({ 
        variables: { 
          college: college,
          majors: majors,
          minors: minors
        } 
      });
    },
    [mutation]
  );

  return [createPlan, mutation[1]] as [
    mutate: typeof createPlan,
    result: (typeof mutation)[1],
  ];
};
