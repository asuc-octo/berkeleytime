import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  CREATE_NEW_PLAN_TERM,
  CreateNewPlanTermResponse,
  PlanTermInput,
} from "@/lib/api";
import { gql } from "@apollo/client";

export const useCreateNewPlanTerm = () => {
  const mutation = useMutation<CreateNewPlanTermResponse>(
    CREATE_NEW_PLAN_TERM,
    {
      update(cache, { data }) {
        const planTerm = data?.createNewPlanTerm;

        if (!planTerm) return;

        // TODO(Gradtrak): Uncomment when done
        cache.modify({
          id: cache.identify({ __typename: "PlanTerm", _id: planTerm._id }),
          fields: {
            planTerms: (existingPlanTerms = []) => {
              const reference = cache.writeFragment({
                data: planTerm,
                fragment: gql`
                  fragment CreatedPlanTerm on PlanTerm {
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
                      labels {
                        name
                        color
                      }
                    }
                    hidden
                    status
                    pinned
                  }
                `,
              });
              return [...existingPlanTerms, reference];
            },
          },
        });
      },
    }
  );

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
