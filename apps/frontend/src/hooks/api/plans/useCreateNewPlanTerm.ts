import { useCallback } from "react";

import { useMutation } from "@apollo/client";

import { CREATE_NEW_PLAN_TERM, CreateNewPlanTermResponse, PlanTermInput } from "@/lib/api";

export const useCreateNewPlanTerm = () => {
  const mutation = useMutation<CreateNewPlanTermResponse>(CREATE_NEW_PLAN_TERM, {
    update(_, { data }) {
      const planTerm = data?.createNewPlanTerm;

      if (!planTerm) return;

      // TODO(Daniel): Uncomment when done
      // cache.modify({
      //   id: cache.identify({ __typename: "Plan", _id: planTerm.planId }), // Assuming planTerm has planId
      //   fields: {
      //     planTerms: (existingPlanTerms = []) => {
      //       const reference = cache.writeFragment({
      //         data: planTerm,
      //         fragment: gql`
      //           fragment CreatedPlanTerm on PlanTerm {
      //             _id
      //             name
      //             year
      //             term
      //             hidden
      //             status
      //             pinned
      //             courses {
      //               courseID
      //               courseName
      //               courseTitle
      //               courseUnits
      //               uniReqs
      //               collegeReqs
      //               pnp
      //               transfer
      //               labels {
      //                 name
      //                 color
      //               }
      //             }
      //             customCourses {
      //               title
      //               description
      //               uniReqs
      //               collegeReqs
      //               pnp
      //               transfer
      //               labels {
      //                 name
      //                 color
      //               }
      //             }
      //           }
      //         `,
      //       });
      //       return [...existingPlanTerms, reference];
      //     },
      //   },
      // });
    },
  });

  const createPlanTerm = useCallback(
    async (planTerm: PlanTermInput) => {
      const mutate = mutation[0];
  
      return await mutate({
        variables: {
          planTerm: planTerm,
        },
      });
    },
    [mutation]
  );
  
  return [createPlanTerm, mutation[1]] as [
    mutate: typeof createPlanTerm,
    result: (typeof mutation)[1],
  ];
};
