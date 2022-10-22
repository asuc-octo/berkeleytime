import { formatGrade } from "./formatter";
import { GradeModel } from "./model";

export async function grades() {
    const grades = await GradeModel.find();
  
    return grades.map(formatGrade);
  }
  