import { Component, Semester } from "./api";

export const getExternalLink = (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  sectionNumber: string,
  kind: Component
) => {
  return `https://classes.berkeley.edu/content/${year}-${semester.toLowerCase()}-${subject.toLowerCase()}-${courseNumber}-${sectionNumber}-${kind.toLowerCase()}-${sectionNumber}`;
};

const colors = [
  "var(--red-500)",
  "var(--orange-500)",
  "var(--yellow-500)",
  "var(--green-500)",
  "var(--teal-500)",
  "var(--blue-500)",
  "var(--indigo-500)",
  "var(--purple-500)",
  "var(--pink-500)",
  "var(--amber-500)",
  "var(--lime-500)",
  "var(--emerald-500)",
  "var(--cyan-500)",
  "var(--sky-500)",
  "var(--violet-500)",
  "var(--fuchsia-500)",
  "var(--rose-500)",
];

export const getColor = (subject: string, number: string) => {
  const value = `${subject} ${number}`;

  let hash = 0;
  let character;

  for (let i = 0; i < value.length; i++) {
    character = value.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash |= 0;
  }

  return colors[Math.abs(hash) % colors.length];
};
