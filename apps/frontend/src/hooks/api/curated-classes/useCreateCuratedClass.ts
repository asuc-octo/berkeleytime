import { useCallback } from "react";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

import {
  CREATE_CURATED_CLASS,
  CreateCuratedClassResponse,
  ICuratedClassInput,
} from "@/lib/api";

export const useCreateCuratedClass = () => {
  const mutation = useMutation<CreateCuratedClassResponse>(
    CREATE_CURATED_CLASS,
    {
      update(cache, { data }) {
        const curatedClass = data?.createCuratedClass;

        if (!curatedClass) return;

        cache.modify({
          fields: {
            curatedClasses: (existingCuratedClasses = []) => {
              const reference = cache.writeFragment({
                data: curatedClass,
                fragment: gql`
                  fragment CreatedCuratedClass on CuratedClass {
                    _id
                    name
                    public
                    createdBy
                    year
                    semester
                    classes {
                      class {
                        subject
                        courseNumber
                        number
                      }
                      selectedSections
                    }
                  }
                `,
              });

              return [...existingCuratedClasses, reference];
            },
          },
        });
      },
    }
  );

  const createCuratedClass = useCallback(
    async (curatedClass: ICuratedClassInput) => {
      const mutate = mutation[0];

      return await mutate({ variables: { curatedClass } });
    },
    [mutation]
  );

  return [createCuratedClass, mutation[1]] as [
    mutate: typeof createCuratedClass,
    result: (typeof mutation)[1],
  ];
};
