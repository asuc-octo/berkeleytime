import { Semester } from "./api"

interface RecentClassData {
    subject: string,
    year: number,
    semester: Semester,
    courseNumber: string,
    number: string
}

export function addToRecent({ subject, year, semester, courseNumber, number }: RecentClassData) {
    const recents = getRecents();
    const newRcd = {
        subject: subject,
        year: year,
        semester: semester,
        courseNumber: courseNumber,
        number: number
    } as RecentClassData
    const alreadyExists = recents.reduce((v, rcd) => v || (newRcd.subject == rcd.subject && newRcd.year == rcd.year && newRcd.semester == rcd.semester && newRcd.courseNumber == rcd.courseNumber && newRcd.number == rcd.number), false)
    if (alreadyExists) return;
    recents.push(newRcd)
    localStorage.setItem("recents-data", JSON.stringify(recents))
}

export function getRecents() {
    const res = localStorage.getItem("recents-data");
    if (res) return JSON.parse(res) as RecentClassData[];
    return [];
}