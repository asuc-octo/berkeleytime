import { useCallback } from "react";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

import {
  CreateScheduleDocument,
  CreateScheduleInput,
} from "@/lib/generated/graphql";

export const useCreateSchedule = () => {
  const mutation = useMutation(CreateScheduleDocument, {
    update(cache, { data }) {
      const newSchedule = data?.createSchedule;

      if (!newSchedule) return;

      cache.modify({
        fields: {
          schedules: (existingSchedules = []) => {
            const reference = cache.writeFragment({
              data: newSchedule,
              fragment: gql`
                fragment CreatedSchedule on Schedule {
                  _id
                  name
                  year
                  semester
                  sessionId
                  events {
                    _id
                    title
                    description
                    startTime
                    endTime
                    days
                    color
                  }
                  classes {
                    class {
                      subject
                      courseNumber
                      number
                      primarySection {
                        sectionId
                        number
                        component
                        meetings {
                          days
                          endTime
                          startTime
                        }
                      }
                      sections {
                        sectionId
                        number
                        component
                        meetings {
                          days
                          endTime
                          startTime
                        }
                      }
                    }
                    selectedSections {
                      sectionId
                    }
                    color
                  }
                }
              `,
            });

            return [...existingSchedules, reference];
          },
        },
      });
    },
  });

  const createSchedule = useCallback(
    async (schedule: CreateScheduleInput) => {
      const mutate = mutation[0];

      return await mutate({ variables: { schedule } });
    },
    [mutation]
  );

  return [createSchedule, mutation[1]] as [
    mutate: typeof createSchedule,
    result: (typeof mutation)[1],
  ];
};
