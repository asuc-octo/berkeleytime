import moment, { Moment } from "moment";
import enrollmentData from "./enrollment.json";

type EnrollmentEvent = {
  description: string;
  date: string;
};
export type EnrollmentEventReturn = {
  description: string;
  timeDelta: number;
};

type EnrollmentSchedule = Record<string, EnrollmentEvent[]>;
type EnrollmentScheduleReturn = Record<string, EnrollmentEventReturn[]>;

export const semesterEnrollments = (terms: string[], keywords: string[], firstTime): EnrollmentScheduleReturn => {
  const enrollmentSchedule = enrollmentData as EnrollmentSchedule;
  const generateSchedule: Record<string, EnrollmentEventReturn[]> = {};

  const keywordMatchers = keywords
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean);

  if (keywordMatchers.length === 0) return generateSchedule;

  for (const term of terms) {
    const events = enrollmentSchedule[term];
    if (!events) continue;
    const matchingEvents = events.filter((event) => {
      const description = event.description.toLowerCase();
      return keywordMatchers.some((keyword) => description.includes(keyword));
    });
    if (matchingEvents.length > 0) {
      const eventDelta = matchingEvents.map((event) => {
        const eventTime = moment(event.date).startOf("minute");
        const timeDelta = moment.duration(eventTime.diff(firstTime)).asMinutes();
        return {
          description: event.description,
          timeDelta,
        };
      });
      generateSchedule[term] = eventDelta;
    }
  }

  return generateSchedule;
};
