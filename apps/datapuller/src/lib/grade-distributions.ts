import { QueryExecutor } from "./aws-athena";

export interface GradeDistributionRow {
  course_id: string;
  course_offer_nbr: string;
  semester_year_term_cd: string;
  class_number: string;
  subject_cd: string;
  course_number: string;
  session_code: string;
  class_section_cd: string;
  grade_count: string;
  distinct_grades: string;
  grade_count_a_plus: string;
  grade_count_a: string;
  grade_count_a_minus: string;
  grade_count_b_plus: string;
  grade_count_b: string;
  grade_count_b_minus: string;
  grade_count_c_plus: string;
  grade_count_c: string;
  grade_count_c_minus: string;
  grade_count_d_plus: string;
  grade_count_d: string;
  grade_count_d_minus: string;
  grade_count_f: string;
  grade_count_p: string;
  grade_count_np: string;
  grade_count_s: string;
  grade_count_u: string;
  grade_count_cr: string;
  grade_count_nc: string;
  grade_count_hh: string;
  grade_count_h: string;
  grade_count_pc: string;
}

export const formatDistribution = (distribution: GradeDistributionRow) => {
  // TODO: Pivot the data
  return {
    subject: distribution.subject_cd,
    courseNumber: distribution.course_number,
    courseOfferingNumber: parseInt(distribution.course_offer_nbr),
    termId: distribution.semester_year_term_cd,
    session: distribution.session_code,
    classNumber: distribution.class_number,
    sectionNumber: distribution.class_section_cd,
    count: parseInt(distribution.grade_count),
    distinct: parseInt(distribution.distinct_grades),
    countAPlus: parseInt(distribution.grade_count_a_plus),
    countA: parseInt(distribution.grade_count_a),
    countAMinus: parseInt(distribution.grade_count_a_minus),
    countBPlus: parseInt(distribution.grade_count_b_plus),
    countB: parseInt(distribution.grade_count_b),
    countBMinus: parseInt(distribution.grade_count_b_minus),
    countCPlus: parseInt(distribution.grade_count_c_plus),
    countC: parseInt(distribution.grade_count_c),
    countCMinus: parseInt(distribution.grade_count_c_minus),
    countDPlus: parseInt(distribution.grade_count_d_plus),
    countD: parseInt(distribution.grade_count_d),
    countDMinus: parseInt(distribution.grade_count_d_minus),
    countF: parseInt(distribution.grade_count_f),
    countP: parseInt(distribution.grade_count_p),
    countNP: parseInt(distribution.grade_count_np),
    countS: parseInt(distribution.grade_count_s),
    countU: parseInt(distribution.grade_count_u),
    countCR: parseInt(distribution.grade_count_cr),
    countNC: parseInt(distribution.grade_count_nc),
    countHH: parseInt(distribution.grade_count_hh),
    countH: parseInt(distribution.grade_count_h),
    countPC: parseInt(distribution.grade_count_pc),
  };
};

/**
 * Get grade distribution rows for a specific term
 */
export const getGradeDistributionDataByTerm = async (
  database: string,
  s3Output: string,
  regionName: string,
  workGroup: string,
  termId: string
) => {
  const query = `SELECT course_id, course_offer_nbr, semester_year_term_cd, class_number, subject_cd, course_number, session_code, class_section_cd, grade_count, distinct_grades, grade_count_a_plus, grade_count_a, grade_count_a_minus, grade_count_b_plus, grade_count_b, grade_count_b_minus, grade_count_c_plus, grade_count_c, grade_count_c_minus, grade_count_d_plus, grade_count_d, grade_count_d_minus, grade_count_f, grade_count_p, grade_count_np, grade_count_s, grade_count_u, grade_count_cr, grade_count_nc, grade_count_hh, grade_count_h, grade_count_pc FROM "lf_cs_curated"."student_grade_distribution_data" WHERE semester_year_term_cd = '${termId}'`;

  const enrollment = new QueryExecutor(
    database,
    s3Output,
    regionName,
    workGroup,
    query
  );

  const data = await enrollment.execute<GradeDistributionRow>();

  return data;
};
