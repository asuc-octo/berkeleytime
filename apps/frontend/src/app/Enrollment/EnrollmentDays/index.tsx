import enrollmentData from "./enrollment.json";

type EnrollmentEvent = {
  description: string;
  date: string;
};

type EnrollmentSchedule = Record<string, EnrollmentEvent[]>;

export const semesterEnrollments = (terms: string[], keywords: string[]): EnrollmentSchedule => {
  const enrollmentSchedule = enrollmentData as EnrollmentSchedule;
  const generateSchedule: Record<string, EnrollmentEvent[]> = {};

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
      generateSchedule[term] = matchingEvents;
    }
  }

  return generateSchedule;
};
