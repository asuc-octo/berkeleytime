import { formatGrade } from "./formatter";
import { GradeModel } from "./model";

export async function grades() {
  // const grades = await GradeModel.find();
  const grades = [
    {
      course_id: "CS 1110",
    },
    {
      course_id: "CS 2110",
    },
  ];
  // return grades.map(formatGrade);
  return grades;
}
