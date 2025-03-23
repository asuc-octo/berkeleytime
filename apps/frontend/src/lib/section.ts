import { Component, IClass, Semester } from "./api";

export const getExternalLink = (
  yearOrClass: number | IClass,
  semester?: Semester,
  subject?: string,
  courseNumber?: string,
  sectionNumber?: string,
  kind?: Component
) => {
  // Handle case where first argument is a class object
  if (typeof yearOrClass === 'object') {
    const classObj = yearOrClass;
    const primarySection = classObj.primarySection;
    
    if (!classObj.year || !classObj.semester || !classObj.subject || 
        !classObj.courseNumber || !classObj.number || !primarySection?.component) {
      console.error('Missing required class properties for external link', classObj);
      return '#';
    }
    
    return `https://classes.berkeley.edu/content/${classObj.year}-${classObj.semester.toLowerCase()}-${classObj.subject.toLowerCase()}-${classObj.courseNumber}-${classObj.number}-${primarySection.component.toLowerCase()}-${classObj.number}`;
  }
  
  // Handle case with individual parameters
  if (!yearOrClass || !semester || !subject || !courseNumber || !sectionNumber || !kind) {
    console.error('Missing required parameters for external link');
    return '#';
  }
  
  return `https://classes.berkeley.edu/content/${yearOrClass}-${semester.toLowerCase()}-${subject.toLowerCase()}-${courseNumber}-${sectionNumber}-${kind.toLowerCase()}-${sectionNumber}`;
};

export const colors = [
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
  "var(--red-700)",
  "var(--orange-700)",
  "var(--yellow-700)",
  "var(--green-700)",
  "var(--teal-700)",
  "var(--blue-700)",
  "var(--indigo-700)",
  "var(--purple-700)",
  "var(--pink-700)",
  "var(--amber-700)",
  "var(--lime-700)",
  "var(--emerald-700)",
  "var(--cyan-700)",
  "var(--sky-700)",
  "var(--violet-700)",
  "var(--fuchsia-700)",
  "var(--rose-700)",
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
