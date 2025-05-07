import { Semester } from "./api";

interface RecentClassData {
  subject: string;
  year: number;
  semester: Semester;
  courseNumber: string;
  number: string;
}

const RECENT_CLASSES_KEY = "recent-classes";

const RECENT_CLASSES_MAX_LENGTH = 10;

export function addRecentClass({
  subject,
  year,
  semester,
  courseNumber,
  number,
}: RecentClassData) {
  let recentClasses = getRecentClasses();

  recentClasses = recentClasses.filter(
    (recentClass) =>
      !(
        subject == recentClass.subject &&
        year == recentClass.year &&
        semester == recentClass.semester &&
        courseNumber == recentClass.courseNumber &&
        number == recentClass.number
      )
  );

  recentClasses.unshift({
    subject: subject,
    year: year,
    semester: semester,
    courseNumber: courseNumber,
    number: number,
  });

  recentClasses = recentClasses.slice(0, RECENT_CLASSES_MAX_LENGTH);

  const item = JSON.stringify(recentClasses);
  localStorage.setItem(RECENT_CLASSES_KEY, item);
}

export function getRecentClasses() {
  try {
    const item = localStorage.getItem(RECENT_CLASSES_KEY);
    if (!item) return [];

    return JSON.parse(item) as RecentClassData[];
  } catch {
    return [];
  }
}
