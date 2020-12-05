// type definitions for the Stanfurdtime API

export type API_Semester = 'spring' | 'summer' | 'fall'

export const API_Semesters = ['spring', 'summer', 'fall']

// BACKEND API INTERFACE

export type API_CourseJSON = {
  courses: API_CourseShort[]
}

export type API_CourseEnrollment = {
  course_id: number
  title: string
  subtitle: string
  section_id: number | 'all'
  section_name: string
  enrolled_max: number
  enrolled_scale_max: number
  enrolled_percent_max: number
  waitlisted_max: number
  waitlisted_scale_max: number
  waitlisted_percent_max: number
  data: API_EnrollmentData[]
  telebears: API_EnrollmentTelebears
}

export type API_CourseShort = {
  id: number
  course_number: string
  abbreviation: string
}

export type API_EnrollmentSemester = {
  semester: API_Semester
  year: string
  sections: API_EnrollmentShort[]
}

export type API_EnrollmentShort = {
  instructor: string
  section_number: string
  section_id: number
}

export type API_EnrollmentData = {
  date: string
  day: number
  enrolled: number
  enrolled_max: number
  enrolled_percent: number
  waitlisted: number
  waitlisted_max: number
  waitlisted_percent: number
}

export type API_EnrollmentTelebears = {
  semester: string
  phase1_start_date: string
  phase1_start_day: number
  phase1_end_day: number
  phase2_start_date: string
  phase2_start_day: number
  phase2_end_day: number
  adj_start_date: string
  adj_start_day: number
}
