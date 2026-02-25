import { gql } from "@apollo/client";

export type DatapullerJob =
  | "TERMS_ALL"
  | "TERMS_NEARBY"
  | "COURSES"
  | "SECTIONS_ACTIVE"
  | "SECTIONS_LAST_FIVE_YEARS"
  | "CLASSES_ACTIVE"
  | "CLASSES_LAST_FIVE_YEARS"
  | "GRADES_RECENT"
  | "GRADES_LAST_FIVE_YEARS"
  | "ENROLLMENTS"
  | "ENROLLMENT_TIMEFRAME";

export interface DatapullerJobOption {
  value: DatapullerJob;
  label: string;
}

export const DATAPULLER_JOB_OPTIONS: DatapullerJobOption[] = [
  { value: "COURSES", label: "Courses" },
  { value: "SECTIONS_ACTIVE", label: "Sections (Active)" },
  { value: "SECTIONS_LAST_FIVE_YEARS", label: "Sections (Last 5 Years)" },
  { value: "CLASSES_ACTIVE", label: "Classes (Active)" },
  { value: "CLASSES_LAST_FIVE_YEARS", label: "Classes (Last 5 Years)" },
  { value: "GRADES_RECENT", label: "Grades (Recent)" },
  { value: "GRADES_LAST_FIVE_YEARS", label: "Grades (Last 5 Years)" },
  { value: "ENROLLMENTS", label: "Enrollments" },
  { value: "ENROLLMENT_TIMEFRAME", label: "Enrollment Timeframe" },
  { value: "TERMS_ALL", label: "Terms (All)" },
  { value: "TERMS_NEARBY", label: "Terms (Nearby)" },
];

export interface TriggerDatapullerResult {
  jobName: string;
  success: boolean;
  message: string | null;
}

export const TRIGGER_DATAPULLER = gql`
  mutation TriggerDatapuller($job: DatapullerJob!) {
    triggerDatapuller(job: $job) {
      jobName
      success
      message
    }
  }
`;

export type DatapullerJobPhase =
  | "Pending"
  | "Running"
  | "Succeeded"
  | "Failed"
  | "NotFound";

export interface DatapullerJobStatus {
  jobName: string;
  phase: DatapullerJobPhase;
  message: string | null;
}

export const DATAPULLER_JOB_STATUS = gql`
  query DatapullerJobStatus($jobName: String!) {
    datapullerJobStatus(jobName: $jobName) {
      jobName
      phase
      message
    }
  }
`;