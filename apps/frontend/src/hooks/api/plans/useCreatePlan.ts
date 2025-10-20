import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import { CREATE_NEW_PLAN, Colleges, CreatePlanResponse } from "@/lib/api";

export const useCreatePlan = () => {
  const mutation = useMutation<CreatePlanResponse>(CREATE_NEW_PLAN, {
    update(_, { data }) {
      const plan = data?.createNewPlan;

      if (!plan) return;

      // TODO(Daniel): Uncomment when done
      // cache.modify({
      //   fields: {
      //     plans: (existingPlans = []) => {
      //       const reference = cache.writeFragment({
      //         data: plan,
      //         fragment: gql`
      //           fragment CreatedPlan on Plan {
      //             _id
      //             userEmail
      //             majors
      //             minors
      //             college
      //             created
      //             revised
      //             labels {
      //               name
      //               color
      //             }
      //             uniReqsSatisfied
      //             collegeReqsSatisfied
      //             planTerms {
      //               _id
      //               name
      //               year
      //               term
      //               hidden
      //               status
      //               pinned
      //               courses {
      //                 courseID
      //                 uniReqs
      //                 collegeReqs
      //                 pnp
      //                 transfer
      //                 labels {
      //                   name
      //                   color
      //                 }
      //               }
      //               customCourses {
      //                 title
      //                 description
      //                 uniReqs
      //                 collegeReqs
      //                 pnp
      //                 transfer
      //                 labels {
      //                   name
      //                   color
      //                 }
      //               }
      //             }
      //           }
      //         `,
      //       });

      //       return [...existingPlans, reference];
      //     },
      //   },
      // });
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
