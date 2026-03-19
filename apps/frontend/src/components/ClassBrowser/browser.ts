export enum SortBy {
  Relevance = "Relevance",
  Units = "Units",
  AverageGrade = "Average grade",
  OpenSeats = "Open seats",
}

export enum Level {
  LowerDivision = "Lower Division",
  UpperDivision = "Upper Division",
  Graduate = "Graduate",
  Extension = "Extension",
}

export enum Unit {
  FivePlus = "5+",
  Four = "4",
  Three = "3",
  Two = "2",
  One = "1",
  Zero = "0",
}

export type UnitRange = [number, number];

// TimeRange is [fromTime, toTime] in "HH:MM" format (24-hour)
// Default [null, null] means no filtering (all times)
export type TimeRange = [string | null, string | null];

export enum Day {
  Sunday = "0",
  Monday = "1",
  Tuesday = "2",
  Wednesday = "3",
  Thursday = "4",
  Friday = "5",
  Saturday = "6",
}

export const EMPTY_DAYS: boolean[] = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
];

export type Breadth = string;
export type UniversityRequirement = string;
export enum GradingBasis {
  ESU = "ESU",
  SUS = "SUS",
  OPT = "OPT",
  PNP = "PNP",
  BMT = "BMT",
  GRD = "GRD",
  IOP = "IOP",
}

export enum GradingFilter {
  Graded = "Graded",
  PassNoPass = "Pass/Not Pass",
  Other = "Other",
}

export enum EnrollmentFilter {
  Open = "Open Seats",
  OpenApartFromReserved = "Non-reserved Open Seats",
  WaitlistOpen = "Open Seats or Open Waitlist",
}
