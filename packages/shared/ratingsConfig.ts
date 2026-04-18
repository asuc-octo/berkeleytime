// criteria for a high enough confidence in quality of information to be displayed
export const MINIMUM_RESPONSES_THRESHOLD = 3;
export const CONSENSUS_THRESHOLD = 0.6;

// restriction on how many ratings a user can submit
export const USER_MAX_ALL_RATINGS = 50;
export const USER_MAX_SEMESTER_RATINGS = 8;

// ratings required from a user before unlocking ratings tab
export const USER_REQUIRED_RATINGS_TO_UNLOCK = 0;

// optional self-reported course grade in the rating form
export const REVIEWER_GRADE_OPTIONS = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "F+",
  "F",
  "F-",
] as const;
