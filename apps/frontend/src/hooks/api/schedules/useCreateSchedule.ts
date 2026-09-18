import { useCallback } from "react";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

import { useTracking } from "@/hooks/api/tracking/useTracking";
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

  const { trackEvent } = useTracking();

  /**
   * `source` labels which surface created the schedule (e.g. "schedules-page",
   * "clone", "class-page"). Tracking lives here rather than at the call sites
   * so any future creation path is counted automatically; omitting `source`
   * costs the label, never the event.
   */
  const createSchedule = useCallback(
    async (schedule: CreateScheduleInput, source?: string) => {
      const mutate = mutation[0];

      const result = await mutate({ variables: { schedule } });

      if (result.data?.createSchedule) {
        const metadata: Record<string, unknown> = {
          year: schedule.year,
          semester: schedule.semester,
          classCount: schedule.classes?.length ?? 0,
        };

        if (source) metadata.source = source;

        trackEvent(
          "schedule_saved",
          "schedule",
          result.data.createSchedule._id,
          metadata
        );
      }

      return result;
    },
    [mutation, trackEvent]
  );

  return [createSchedule, mutation[1]] as [
    mutate: typeof createSchedule,
    result: (typeof mutation)[1],
  ];
};
