import { Semester } from "./api";

interface RecentClassData {
  subject: string;
  year: number;
  semester: Semester;
  courseNumber: string;
  number: string;
}

const RECENTS_LIST_MAX_LENGTH = 10;

export function addToRecent({
  subject,
  year,
  semester,
  courseNumber,
  number,
}: RecentClassData) {
  let recents = getRecents();
  const newRcd = {
    subject: subject,
    year: year,
    semester: semester,
    courseNumber: courseNumber,
    number: number,
  } as RecentClassData;
  recents = recents.filter(
    (rcd) =>
      !(
        newRcd.subject == rcd.subject &&
        newRcd.year == rcd.year &&
        newRcd.semester == rcd.semester &&
        newRcd.courseNumber == rcd.courseNumber &&
        newRcd.number == rcd.number
      )
  );
  recents.push(newRcd);
  recents.splice(0, recents.length - RECENTS_LIST_MAX_LENGTH);
  localStorage.setItem("recents-data", JSON.stringify(recents));
}

export function getRecents() {
  const res = localStorage.getItem("recents-data");
  if (res) return JSON.parse(res) as RecentClassData[];
  return [];
}
