import { IScheduleClass, ScheduleIdentifier, Semester } from "@/lib/api";

enum Recent {
  Classes,
  Schedules,
  Grades,
}

const Key = {
  [Recent.Classes]: "recent-classes",
  [Recent.Schedules]: "recent-schedule",
  [Recent.Grades]: "recent-grades",
};
const MaxLength = {
  [Recent.Classes]: 10,
  [Recent.Schedules]: 5,
  [Recent.Grades]: 5,
};

interface RecentClassData {
  subject: string;
  year: number;
  semester: Semester;
  courseNumber: string;
  number: string;
}

interface RecentScheduleData {
  _id: ScheduleIdentifier;
  name: string;
  classes: IScheduleClass[];
  semester: Semester;
  year: number;
}

interface RecentCourseGrade {
  subject: string;
  courseNumber: string;
  number: string;
}

function filterRecents(type: Recent, obj: any) {
  let recents = getRecent(type);

  recents = recents.filter((recent) => {
    let allEqual = true;
    for (let key of Object.keys(recent)) {
      if (typeof recent[key] == "string" && key !== "name")
        allEqual = allEqual && recent[key] === obj[key];
    }
    return !allEqual;
  });

  return recents;
}

function addToRecent(type: Recent, obj: any) {
  let recents = filterRecents(type, obj);

  recents.unshift(obj);

  recents = recents.slice(0, MaxLength[type]);

  const item = JSON.stringify(recents);
  localStorage.setItem(Key[type], item);
}

function removeFromRecent(type: Recent, obj: any) {
  const recents = filterRecents(type, obj);
  const item = JSON.stringify(recents);
  localStorage.setItem(Key[type], item);
}

function getRecent(type: Recent) {
  try {
    const item = localStorage.getItem(Key[type]);
    if (!item) return [];

    return JSON.parse(item) as any[];
  } catch {
    return [];
  }
}

export function addRecentClass({
  subject,
  year,
  semester,
  courseNumber,
  number,
}: RecentClassData) {
  addToRecent(Recent.Classes, {
    subject: subject,
    year: year,
    semester: semester,
    courseNumber: courseNumber,
    number: number,
  });
}

export function addRecentCourseGrade({
  subject,
  courseNumber,
  number,
}: RecentCourseGrade) {
  addToRecent(Recent.Grades, {
    subject: subject,
    courseNumber: courseNumber,
    number: number,
  });
}

export function getRecentClasses() {
  return getRecent(Recent.Classes) as RecentClassData[];
}

export function getRecentGrades() {
  return getRecent(Recent.Grades) as RecentCourseGrade[];
}

export function addRecentSchedule({
  _id,
  name,
  classes,
  semester,
  year,
}: RecentScheduleData) {
  addToRecent(Recent.Schedules, {
    _id: _id,
    name: name,
    classes: classes,
    semester: semester,
    year: year,
  });
}

export function removeRecentSchedule({
  _id,
  name,
  classes,
  semester,
  year,
}: RecentScheduleData) {
  removeFromRecent(Recent.Schedules, {
    _id: _id,
    name: name,
    classes: classes,
    semester: semester,
    year: year,
  });
}

export function getRecentSchedules() {
  return getRecent(Recent.Schedules) as RecentScheduleData[];
}
