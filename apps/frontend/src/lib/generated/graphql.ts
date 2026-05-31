/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  ClassNumber: { input: any; output: any };
  CourseIdentifier: { input: any; output: any };
  CourseNumber: { input: any; output: any };
  ISODate: { input: any; output: any };
  JSON: { input: any; output: any };
  JSONObject: { input: any; output: any };
  SectionIdentifier: { input: any; output: any };
  SectionNumber: { input: any; output: any };
  /** Unique session identifier within a term. Maps to session.id */
  SessionIdentifier: { input: any; output: any };
  /** Unique term identifier. Maps to term.id */
  TermIdentifier: { input: any; output: any };
};

export enum AcademicCareer {
  /** Graduate */
  Grad = "GRAD",
  /** Law */
  Law = "LAW",
  /** UC Extension */
  Ucbx = "UCBX",
  /** Undergraduate */
  Ugrd = "UGRD",
}

export enum AcademicCareerCode {
  /** Graduate */
  Grad = "GRAD",
  /** Law */
  Law = "LAW",
  /** UC Berkeley Extension */
  Ucbx = "UCBX",
  /** Undergraduate */
  Ugrd = "UGRD",
}

/** Activity score distribution bucket for analytics */
export type ActivityScoreDistributionPoint = {
  __typename?: "ActivityScoreDistributionPoint";
  /** Score range label, e.g. '0.0–0.1' */
  bucket: Scalars["String"]["output"];
  /** Number of users in this bucket */
  count: Scalars["Int"]["output"];
  /** Lower bound of this bucket (e.g. 0.5 for the 0.5–0.6 bucket) */
  lowerBound: Scalars["Float"]["output"];
  /** Percentage of total users in this bucket */
  percent: Scalars["Float"]["output"];
};

export type AddClassInput = {
  classNumber: Scalars["ClassNumber"]["input"];
  collectionId: Scalars["ID"]["input"];
  courseNumber: Scalars["CourseNumber"]["input"];
  semester: Semester;
  sessionId: Scalars["SessionIdentifier"]["input"];
  subject: Scalars["String"]["input"];
  year: Scalars["Int"]["input"];
};

/** Ratings by class */
export type AggregatedRatings = {
  __typename?: "AggregatedRatings";
  classNumber?: Maybe<Scalars["String"]["output"]>;
  courseNumber: Scalars["String"]["output"];
  metrics: Array<Metric>;
  semester?: Maybe<Semester>;
  subject: Scalars["String"]["output"];
  /** Class identifier */
  year?: Maybe<Scalars["Int"]["output"]>;
};

/** A banner displayed at the top of the website. */
export type Banner = {
  __typename?: "Banner";
  clickCount: Scalars["Int"]["output"];
  clickEventLogging: Scalars["Boolean"]["output"];
  createdAt: Scalars["String"]["output"];
  currentVersion: Scalars["Int"]["output"];
  dismissCount: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  link?: Maybe<Scalars["String"]["output"]>;
  linkText?: Maybe<Scalars["String"]["output"]>;
  persistent: Scalars["Boolean"]["output"];
  reappearing: Scalars["Boolean"]["output"];
  text: Scalars["String"]["output"];
  updatedAt: Scalars["String"]["output"];
  viewCount: Scalars["Int"]["output"];
  visible: Scalars["Boolean"]["output"];
};

/** A snapshot of banner content at a specific version. */
export type BannerSnapshot = {
  __typename?: "BannerSnapshot";
  clickEventLogging?: Maybe<Scalars["Boolean"]["output"]>;
  link?: Maybe<Scalars["String"]["output"]>;
  linkText?: Maybe<Scalars["String"]["output"]>;
  persistent?: Maybe<Scalars["Boolean"]["output"]>;
  reappearing?: Maybe<Scalars["Boolean"]["output"]>;
  text?: Maybe<Scalars["String"]["output"]>;
  visible?: Maybe<Scalars["Boolean"]["output"]>;
};

/** Click statistics for a specific banner version. */
export type BannerVersionClickStats = {
  __typename?: "BannerVersionClickStats";
  clickCount: Scalars["Int"]["output"];
  uniqueVisitors: Scalars["Int"]["output"];
  version: Scalars["Int"]["output"];
};

/** A version history entry for a banner. */
export type BannerVersionEntry = {
  __typename?: "BannerVersionEntry";
  changedFields: Array<Scalars["String"]["output"]>;
  snapshot: BannerSnapshot;
  timestamp: Scalars["String"]["output"];
  version: Scalars["Int"]["output"];
};

export type BookmarkedClassInput = {
  courseNumber: Scalars["CourseNumber"]["input"];
  number: Scalars["ClassNumber"]["input"];
  semester: Semester;
  sessionId?: InputMaybe<Scalars["SessionIdentifier"]["input"]>;
  subject: Scalars["String"]["input"];
  year: Scalars["Int"]["input"];
};

export type BookmarkedCourseInput = {
  number: Scalars["CourseNumber"]["input"];
  subject: Scalars["String"]["input"];
};

export enum CacheControlScope {
  Private = "PRIVATE",
  Public = "PUBLIC",
}

export type CatalogAggregatedRatings = {
  __typename?: "CatalogAggregatedRatings";
  metrics: Array<CatalogMetric>;
};

export type CatalogClass = {
  __typename?: "CatalogClass";
  academicCareer?: Maybe<Scalars["String"]["output"]>;
  academicOrganization?: Maybe<Scalars["String"]["output"]>;
  academicOrganizationName?: Maybe<Scalars["String"]["output"]>;
  activeReservedMaxCount?: Maybe<Scalars["Int"]["output"]>;
  aggregatedRatings?: Maybe<CatalogAggregatedRatings>;
  allTimeAverageGrade?: Maybe<Scalars["Float"]["output"]>;
  allTimeNoPassCount?: Maybe<Scalars["Int"]["output"]>;
  allTimePassCount?: Maybe<Scalars["Int"]["output"]>;
  breadthRequirements?: Maybe<Array<Scalars["String"]["output"]>>;
  courseDescription?: Maybe<Scalars["String"]["output"]>;
  courseId: Scalars["String"]["output"];
  courseNumber: Scalars["String"]["output"];
  /** Course fields */
  courseTitle?: Maybe<Scalars["String"]["output"]>;
  /** DeCal */
  decal?: Maybe<CatalogDeCal>;
  departmentNicknames?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  enrolledCount?: Maybe<Scalars["Int"]["output"]>;
  /** Enrollment */
  enrollmentStatus?: Maybe<Scalars["String"]["output"]>;
  exams?: Maybe<Array<CatalogExam>>;
  finalExam?: Maybe<Scalars["String"]["output"]>;
  gradingBasis?: Maybe<Scalars["String"]["output"]>;
  /** Pre-computed */
  level?: Maybe<Scalars["String"]["output"]>;
  maxEnroll?: Maybe<Scalars["Int"]["output"]>;
  maxWaitlist?: Maybe<Scalars["Int"]["output"]>;
  meetings?: Maybe<Array<CatalogMeeting>>;
  number: Scalars["String"]["output"];
  /** Pre-computed sort */
  openSeats?: Maybe<Scalars["Int"]["output"]>;
  primaryComponent?: Maybe<Scalars["String"]["output"]>;
  primaryOnline?: Maybe<Scalars["Boolean"]["output"]>;
  /** Primary section */
  primarySectionId?: Maybe<Scalars["String"]["output"]>;
  /** Requirement designation */
  requirementDesignation?: Maybe<SectionAttributeInfo>;
  sectionAttributes?: Maybe<Array<CatalogSectionAttribute>>;
  /** Secondary sections */
  sections?: Maybe<Array<CatalogSection>>;
  semester: Scalars["String"]["output"];
  sessionId: Scalars["String"]["output"];
  subject: Scalars["String"]["output"];
  termId: Scalars["String"]["output"];
  /** Class fields */
  title?: Maybe<Scalars["String"]["output"]>;
  unitsMax: Scalars["Float"]["output"];
  unitsMin: Scalars["Float"]["output"];
  universityRequirements?: Maybe<Array<Scalars["String"]["output"]>>;
  /** Stats */
  viewCount?: Maybe<Scalars["Int"]["output"]>;
  waitlistedCount?: Maybe<Scalars["Int"]["output"]>;
  /** Identity */
  year: Scalars["Int"]["output"];
};

export type CatalogClassIdentity = {
  __typename?: "CatalogClassIdentity";
  courseNumber: Scalars["String"]["output"];
  number: Scalars["String"]["output"];
  sessionId: Scalars["String"]["output"];
  subject: Scalars["String"]["output"];
};

export type CatalogDeCal = {
  __typename?: "CatalogDeCal";
  title?: Maybe<Scalars["String"]["output"]>;
};

export type CatalogDepartment = {
  __typename?: "CatalogDepartment";
  code: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type CatalogExam = {
  __typename?: "CatalogExam";
  date?: Maybe<Scalars["String"]["output"]>;
  endTime?: Maybe<Scalars["String"]["output"]>;
  location?: Maybe<Scalars["String"]["output"]>;
  startTime?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<Scalars["String"]["output"]>;
};

export type CatalogFilterOptions = {
  __typename?: "CatalogFilterOptions";
  breadthRequirements: Array<Scalars["String"]["output"]>;
  departments: Array<CatalogDepartment>;
  gradingOptions: Array<Scalars["String"]["output"]>;
  levels: Array<Scalars["String"]["output"]>;
  semesters: Array<CatalogSemester>;
  timeRange?: Maybe<CatalogTimeRange>;
  universityRequirements: Array<Scalars["String"]["output"]>;
};

export type CatalogFilters = {
  breadths?: InputMaybe<Array<Scalars["String"]["input"]>>;
  days?: InputMaybe<Array<Scalars["Int"]["input"]>>;
  departments?: InputMaybe<Array<Scalars["String"]["input"]>>;
  enrollmentFilter?: InputMaybe<EnrollmentFilterType>;
  gradingFilters?: InputMaybe<Array<Scalars["String"]["input"]>>;
  levels?: InputMaybe<Array<Scalars["String"]["input"]>>;
  online?: InputMaybe<Scalars["Boolean"]["input"]>;
  timeFrom?: InputMaybe<Scalars["String"]["input"]>;
  timeTo?: InputMaybe<Scalars["String"]["input"]>;
  unitsMax?: InputMaybe<Scalars["Float"]["input"]>;
  unitsMin?: InputMaybe<Scalars["Float"]["input"]>;
  universityRequirements?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export type CatalogInstructor = {
  __typename?: "CatalogInstructor";
  familyName?: Maybe<Scalars["String"]["output"]>;
  givenName?: Maybe<Scalars["String"]["output"]>;
};

export type CatalogMeeting = {
  __typename?: "CatalogMeeting";
  days?: Maybe<Array<Scalars["Boolean"]["output"]>>;
  endTime?: Maybe<Scalars["String"]["output"]>;
  instructors: Array<CatalogInstructor>;
  location?: Maybe<Scalars["String"]["output"]>;
  startTime?: Maybe<Scalars["String"]["output"]>;
};

export type CatalogMetric = {
  __typename?: "CatalogMetric";
  count: Scalars["Int"]["output"];
  metricName: Scalars["String"]["output"];
  weightedAverage: Scalars["Float"]["output"];
};

export type CatalogResult = {
  __typename?: "CatalogResult";
  results: Array<CatalogClass>;
  totalCount: Scalars["Int"]["output"];
};

export type CatalogSection = {
  __typename?: "CatalogSection";
  component?: Maybe<Scalars["String"]["output"]>;
  enrolledCount?: Maybe<Scalars["Int"]["output"]>;
  enrollmentStatus?: Maybe<Scalars["String"]["output"]>;
  maxEnroll?: Maybe<Scalars["Int"]["output"]>;
  maxWaitlist?: Maybe<Scalars["Int"]["output"]>;
  meetings?: Maybe<Array<CatalogMeeting>>;
  number?: Maybe<Scalars["String"]["output"]>;
  online?: Maybe<Scalars["Boolean"]["output"]>;
  sectionId: Scalars["String"]["output"];
  waitlistedCount?: Maybe<Scalars["Int"]["output"]>;
};

export type CatalogSectionAttribute = {
  __typename?: "CatalogSectionAttribute";
  attribute?: Maybe<SectionAttributeInfo>;
  value?: Maybe<SectionAttributeInfo>;
};

export type CatalogSectionEnrollment = {
  __typename?: "CatalogSectionEnrollment";
  enrolledCount?: Maybe<Scalars["Int"]["output"]>;
  enrollmentStatus?: Maybe<Scalars["String"]["output"]>;
  maxEnroll?: Maybe<Scalars["Int"]["output"]>;
  maxWaitlist?: Maybe<Scalars["Int"]["output"]>;
  waitlistedCount?: Maybe<Scalars["Int"]["output"]>;
};

export type CatalogSemester = {
  __typename?: "CatalogSemester";
  semester: Scalars["String"]["output"];
  year: Scalars["Int"]["output"];
};

export enum CatalogSortBy {
  AverageGrade = "AVERAGE_GRADE",
  OpenSeats = "OPEN_SEATS",
  Relevance = "RELEVANCE",
  Units = "UNITS",
}

export type CatalogTimeRange = {
  __typename?: "CatalogTimeRange";
  maxEndTime: Scalars["String"]["output"];
  minStartTime: Scalars["String"]["output"];
};

export type Category = {
  __typename?: "Category";
  count: Scalars["Int"]["output"];
  value: Scalars["Int"]["output"];
};

export type Class = {
  __typename?: "Class";
  aggregatedRatings: AggregatedRatings;
  anyPrintInScheduleOfClasses?: Maybe<Scalars["Boolean"]["output"]>;
  course: Course;
  courseId: Scalars["String"]["output"];
  courseNumber: Scalars["CourseNumber"]["output"];
  decal?: Maybe<DeCal>;
  description?: Maybe<Scalars["String"]["output"]>;
  finalExam: ClassFinalExam;
  gradeDistribution: GradeDistribution;
  gradingBasis: ClassGradingBasis;
  number: Scalars["ClassNumber"]["output"];
  primarySection?: Maybe<Section>;
  requirementDesignation?: Maybe<SectionAttributeInfo>;
  sections: Array<Section>;
  semester: Semester;
  sessionId: Scalars["SessionIdentifier"]["output"];
  subject: Scalars["String"]["output"];
  /** Relationships */
  term: Term;
  /** Identifiers */
  termId: Scalars["TermIdentifier"]["output"];
  title?: Maybe<Scalars["String"]["output"]>;
  unitsMax: Scalars["Float"]["output"];
  unitsMin: Scalars["Float"]["output"];
  viewCount: Scalars["Int"]["output"];
  /** Attributes */
  year: Scalars["Int"]["output"];
};

/** Class addition data point for analytics */
export type ClassAdditionDataPoint = {
  __typename?: "ClassAdditionDataPoint";
  /** Timestamp when the class was added */
  addedAt: Scalars["String"]["output"];
  /** User ID */
  userId: Scalars["String"]["output"];
};

export enum ClassFinalExam {
  /** Alernate Method */
  A = "A",
  /** Common Final */
  C = "C",
  /** Last Class Meeting */
  L = "L",
  /** No */
  N = "N",
  /** Yes */
  Y = "Y",
}

export enum ClassGradingBasis {
  /** Multi-Term Course: Not Graded */
  Bmt = "BMT",
  /** Clinic */
  Cnc = "CNC",
  /** Elective Satisfactory/Unsat */
  Esu = "ESU",
  /** Graded */
  Grd = "GRD",
  /** Instructor Option */
  Iop = "IOP",
  /** Law */
  Law = "LAW",
  Lw1 = "LW1",
  /** Student Option */
  Opt = "OPT",
  /** Pass/Not Pass */
  Pnp = "PNP",
  /** Satisfactory/Unsatisfactory */
  Sus = "SUS",
}

export type ClassIdentifier = {
  __typename?: "ClassIdentifier";
  classNumber: Scalars["String"]["output"];
  semester: Semester;
  year: Scalars["Int"]["output"];
};

export type ClassReviews = {
  __typename?: "ClassReviews";
  count: Scalars["Int"]["output"];
  courseNumber: Scalars["String"]["output"];
  subject: Scalars["String"]["output"];
  users: Array<ClassUserReviews>;
};

export type ClassUserReviews = {
  __typename?: "ClassUserReviews";
  anonymousUserId: Scalars["String"]["output"];
  classes: Array<UserClass>;
};

export type ClassWithMostRatings = {
  __typename?: "ClassWithMostRatings";
  classNumber: Scalars["String"]["output"];
  courseNumber: Scalars["String"]["output"];
  semester: Scalars["String"]["output"];
  subject: Scalars["String"]["output"];
  totalRatings: Scalars["Int"]["output"];
  year: Scalars["Int"]["output"];
};

export type ClassWithoutCourseInput = {
  classNumber: Scalars["String"]["input"];
  semester: Scalars["Int"]["input"];
  year: Scalars["Int"]["input"];
};

/** A single click event recorded for intensive tracking. */
export type ClickEvent = {
  __typename?: "ClickEvent";
  additionalInfo?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  ipHash: Scalars["String"]["output"];
  referrer?: Maybe<Scalars["String"]["output"]>;
  sessionFingerprint: Scalars["String"]["output"];
  targetId: Scalars["ID"]["output"];
  targetType: Scalars["String"]["output"];
  targetVersion?: Maybe<Scalars["Int"]["output"]>;
  timestamp: Scalars["String"]["output"];
  userAgent?: Maybe<Scalars["String"]["output"]>;
};

/** Paginated response for click events. */
export type ClickEventConnection = {
  __typename?: "ClickEventConnection";
  events: Array<ClickEvent>;
  hasMore: Scalars["Boolean"]["output"];
  totalCount: Scalars["Int"]["output"];
};

/** A single point in a click events time series (e.g. one day). */
export type ClickEventsTimeSeriesPoint = {
  __typename?: "ClickEventsTimeSeriesPoint";
  count: Scalars["Int"]["output"];
  date: Scalars["String"]["output"];
};

/** Aggregated click statistics. */
export type ClickStats = {
  __typename?: "ClickStats";
  totalClicks: Scalars["Int"]["output"];
  uniqueVisitors: Scalars["Int"]["output"];
};

/** Cloudflare analytics data with summary statistics */
export type CloudflareAnalyticsData = {
  __typename?: "CloudflareAnalyticsData";
  /** Time series data points */
  dataPoints: Array<CloudflareAnalyticsDataPoint>;
  /** Total requests in the period */
  totalRequests: Scalars["Int"]["output"];
  /** Total unique visitors in the period */
  totalUniqueVisitors: Scalars["Int"]["output"];
};

/** A single data point for Cloudflare analytics over time */
export type CloudflareAnalyticsDataPoint = {
  __typename?: "CloudflareAnalyticsDataPoint";
  /** Date in YYYY-MM-DD format (daily) or ISO datetime (hourly) */
  date: Scalars["String"]["output"];
  /** Total number of requests */
  totalRequests: Scalars["Int"]["output"];
  /** Number of unique visitors */
  uniqueVisitors: Scalars["Int"]["output"];
};

export type Collection = {
  __typename?: "Collection";
  _id: Scalars["ID"]["output"];
  classes: Array<CollectionClass>;
  color?: Maybe<CollectionColor>;
  createdAt: Scalars["String"]["output"];
  createdBy: Scalars["String"]["output"];
  isSystem: Scalars["Boolean"]["output"];
  lastAdd: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  pinnedAt?: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["String"]["output"];
};

/** Collection analytics data */
export type CollectionAnalyticsData = {
  __typename?: "CollectionAnalyticsData";
  /** Class addition timestamps */
  classAdditions: Array<ClassAdditionDataPoint>;
  /** User first collection creation timestamps */
  collectionCreations: Array<CollectionCreationDataPoint>;
  /** Custom (non-system) collection creation timestamps */
  customCollectionCreations: Array<CollectionCreationDataPoint>;
  /** Custom collection details for table display */
  customCollections: Array<CustomCollectionDetail>;
  /** Highlights and top stats */
  highlights: CollectionHighlights;
  /** Unique users with custom collections (first custom collection per user) */
  usersWithCustomCollections: Array<CollectionCreationDataPoint>;
};

export type CollectionClass = {
  __typename?: "CollectionClass";
  addedAt?: Maybe<Scalars["String"]["output"]>;
  class?: Maybe<Class>;
  error?: Maybe<Scalars["String"]["output"]>;
};

export enum CollectionColor {
  Amber = "amber",
  Blue = "blue",
  Cyan = "cyan",
  Emerald = "emerald",
  Fuchsia = "fuchsia",
  Green = "green",
  Indigo = "indigo",
  Lime = "lime",
  Orange = "orange",
  Pink = "pink",
  Purple = "purple",
  Red = "red",
  Rose = "rose",
  Sky = "sky",
  Teal = "teal",
  Violet = "violet",
  Yellow = "yellow",
}

/** Collection creation data point for analytics */
export type CollectionCreationDataPoint = {
  __typename?: "CollectionCreationDataPoint";
  /** Timestamp when the user's first collection was created */
  createdAt: Scalars["String"]["output"];
  /** User ID */
  userId: Scalars["String"]["output"];
};

/** Collection highlights for quick stats */
export type CollectionHighlights = {
  __typename?: "CollectionHighlights";
  /** Largest collection class count */
  largestCollectionSize: Scalars["Int"]["output"];
  /** Largest custom collection name */
  largestCustomCollectionName?: Maybe<Scalars["String"]["output"]>;
  /** Largest custom collection class count */
  largestCustomCollectionSize: Scalars["Int"]["output"];
  /** Most bookmarked course identifier */
  mostBookmarkedCourse?: Maybe<Scalars["String"]["output"]>;
  /** Most bookmarked course count */
  mostBookmarkedCourseCount: Scalars["Int"]["output"];
  /** Most collections by a single user */
  mostCollectionsByUser: Scalars["Int"]["output"];
};

export type CollectionsStats = {
  __typename?: "CollectionsStats";
  nonSystemCollectionsCount: Scalars["Int"]["output"];
  uniqueUsersWithNonSystemCollections: Scalars["Int"]["output"];
};

export enum Colleges {
  /** Computing, Data Science & Society */
  Cdss = "CDSS",
  /** Chemistry */
  Chem = "CHEM",
  /** Engineering */
  CoE = "CoE",
  /** Education */
  Edu = "EDU",
  /** Environmental Design */
  Envdes = "ENVDES",
  /** Business */
  Haas = "HAAS",
  /** Information */
  Info = "INFO",
  /** Journalism */
  Journ = "JOURN",
  /** Law */
  Law = "LAW",
  /** Letters & Science */
  LnS = "LnS",
  /** Natural Resources */
  Natres = "NATRES",
  /** Optometry */
  Optom = "OPTOM",
  /** Other */
  Other = "OTHER",
  /** Public Health */
  Pubhealth = "PUBHEALTH",
  /** Public Policy */
  Pubpolicy = "PUBPOLICY",
  /** Social Welfare */
  Socwelf = "SOCWELF",
}

export enum Color {
  Amber = "amber",
  Blue = "blue",
  Cyan = "cyan",
  Emerald = "emerald",
  Fuchsia = "fuchsia",
  Gray = "gray",
  Green = "green",
  Indigo = "indigo",
  Lime = "lime",
  Neutral = "neutral",
  Orange = "orange",
  Pink = "pink",
  Purple = "purple",
  Red = "red",
  Rose = "rose",
  Sky = "sky",
  Slate = "slate",
  Stone = "stone",
  Teal = "teal",
  Violet = "violet",
  Yellow = "yellow",
  Zinc = "zinc",
}

export enum Component {
  /** Clinic */
  Cln = "CLN",
  /** Colloquium */
  Col = "COL",
  /** Conversation */
  Con = "CON",
  /** Demonstration */
  Dem = "DEM",
  /** Discussion */
  Dis = "DIS",
  /** Field Work */
  Fld = "FLD",
  /** Directed Group Study */
  Grp = "GRP",
  /** Independent Study */
  Ind = "IND",
  /** Internship */
  Int = "INT",
  /** Laboratory */
  Lab = "LAB",
  /** Lecture */
  Lec = "LEC",
  /** Practicum */
  Pra = "PRA",
  /** Reading */
  Rea = "REA",
  /** Recitation */
  Rec = "REC",
  /** Seminar */
  Sem = "SEM",
  /** Session */
  Ses = "SES",
  /** Self-paced */
  Slf = "SLF",
  /** Studio */
  Std = "STD",
  /** Supplementary */
  Sup = "SUP",
  /** Tutorial */
  Tut = "TUT",
  /** Voluntary */
  Vol = "VOL",
  /** Web-Based Discussion */
  Wbd = "WBD",
  /** Web-Based Lecture */
  Wbl = "WBL",
  /** Workshop */
  Wor = "WOR",
}

export type Course = {
  __typename?: "Course";
  academicCareer: AcademicCareer;
  academicOrganization?: Maybe<Scalars["String"]["output"]>;
  academicOrganizationName?: Maybe<Scalars["String"]["output"]>;
  aggregatedRatings: AggregatedRatings;
  /** Relationships */
  classes: Array<Class>;
  /** Identifiers */
  courseId: Scalars["CourseIdentifier"]["output"];
  crossListing: Array<Course>;
  departmentNicknames?: Maybe<Scalars["String"]["output"]>;
  description: Scalars["String"]["output"];
  finalExam?: Maybe<CourseFinalExam>;
  fromDate: Scalars["String"]["output"];
  gradeDistribution: GradeDistribution;
  gradingBasis: CourseGradingBasis;
  instructorAggregatedRatings: Array<InstructorRating>;
  mostRecentClass?: Maybe<Class>;
  number: Scalars["CourseNumber"]["output"];
  primaryInstructionMethod: InstructionMethod;
  requiredCourses: Array<Course>;
  /** Attributes */
  requirements?: Maybe<Scalars["String"]["output"]>;
  subject: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
  toDate: Scalars["String"]["output"];
  typicallyOffered?: Maybe<Array<Scalars["String"]["output"]>>;
};

export type CourseAggregatedRatingsArgs = {
  metricNames?: InputMaybe<Array<MetricName>>;
};

export type CourseClassesArgs = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  printInScheduleOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export enum CourseFinalExam {
  /** Alternative method of final assessment */
  A = "A",
  /** Common Final Exam */
  C = "C",
  /** To be decided by the instructor when the class is offered */
  D = "D",
  /** Last class meeting */
  L = "L",
  /** No final exam */
  N = "N",
  /** Written final exam conducted during the scheduled final exam period */
  Y = "Y",
}

export enum CourseGradingBasis {
  Bmt = "BMT",
  Cnc = "CNC",
  Grd = "GRD",
  Iop = "IOP",
  Law = "LAW",
  Opt = "OPT",
  Pnp = "PNP",
  Sus = "SUS",
  Trn = "TRN",
  CompletedNotation = "completedNotation",
  Graded = "graded",
  Letter = "letter",
  PassFail = "passFail",
  Satisfactory = "satisfactory",
}

export type CourseHistogramBucket = {
  __typename?: "CourseHistogramBucket";
  count: Scalars["Int"]["output"];
  range: Scalars["String"]["output"];
};

export type CourseWithMostRatings = {
  __typename?: "CourseWithMostRatings";
  courseNumber: Scalars["String"]["output"];
  subject: Scalars["String"]["output"];
  totalRatings: Scalars["Int"]["output"];
};

/** Input for creating a banner. */
export type CreateBannerInput = {
  clickEventLogging?: InputMaybe<Scalars["Boolean"]["input"]>;
  link?: InputMaybe<Scalars["String"]["input"]>;
  linkText?: InputMaybe<Scalars["String"]["input"]>;
  persistent: Scalars["Boolean"]["input"];
  reappearing: Scalars["Boolean"]["input"];
  text: Scalars["String"]["input"];
  visible?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type CreateCollectionInput = {
  color?: InputMaybe<CollectionColor>;
  name: Scalars["String"]["input"];
};

export type CreateCuratedClassInput = {
  courseNumber: Scalars["CourseNumber"]["input"];
  image: Scalars["String"]["input"];
  number: Scalars["ClassNumber"]["input"];
  semester: Semester;
  sessionId: Scalars["SessionIdentifier"]["input"];
  subject: Scalars["String"]["input"];
  text: Scalars["String"]["input"];
  year: Scalars["Int"]["input"];
};

/** Input for creating a pod. */
export type CreatePodInput = {
  name: Scalars["String"]["input"];
  semester: Semester;
  year: Scalars["Int"]["input"];
};

/** Input for creating a route redirect. */
export type CreateRouteRedirectInput = {
  clickEventLogging?: InputMaybe<Scalars["Boolean"]["input"]>;
  fromPath: Scalars["String"]["input"];
  toPath: Scalars["String"]["input"];
};

export type CreateScheduleInput = {
  classes?: InputMaybe<Array<SelectedClassInput>>;
  events?: InputMaybe<Array<EventInput>>;
  name: Scalars["String"]["input"];
  public?: InputMaybe<Scalars["Boolean"]["input"]>;
  semester: Semester;
  sessionId: Scalars["SessionIdentifier"]["input"];
  year: Scalars["Int"]["input"];
};

export type CreateTargetedMessageInput = {
  clickEventLogging?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  link?: InputMaybe<Scalars["String"]["input"]>;
  linkText?: InputMaybe<Scalars["String"]["input"]>;
  persistent: Scalars["Boolean"]["input"];
  reappearing: Scalars["Boolean"]["input"];
  targetCourses: Array<TargetedMessageCourseInput>;
  title: Scalars["String"]["input"];
};

export type CuratedClass = {
  __typename?: "CuratedClass";
  _id: Scalars["ID"]["output"];
  class: Class;
  courseNumber: Scalars["CourseNumber"]["output"];
  createdAt: Scalars["String"]["output"];
  createdBy: Scalars["ID"]["output"];
  image: Scalars["String"]["output"];
  number: Scalars["ClassNumber"]["output"];
  publishedAt?: Maybe<Scalars["String"]["output"]>;
  semester: Semester;
  sessionId: Scalars["SessionIdentifier"]["output"];
  subject: Scalars["String"]["output"];
  text: Scalars["String"]["output"];
  updatedAt: Scalars["String"]["output"];
  year: Scalars["Int"]["output"];
};

/** Custom collection detail for analytics table */
export type CustomCollectionDetail = {
  __typename?: "CustomCollectionDetail";
  /** Number of classes in collection */
  classCount: Scalars["Int"]["output"];
  /** When the collection was created */
  createdAt: Scalars["String"]["output"];
  /** Collection name */
  name: Scalars["String"]["output"];
  /** User email */
  userEmail: Scalars["String"]["output"];
};

export type DeCal = {
  __typename?: "DeCal";
  applicationDueDate?: Maybe<Scalars["String"]["output"]>;
  applicationUrl?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  instructors: Array<DeCalInstructor>;
  syllabus?: Maybe<Scalars["String"]["output"]>;
  syllabusUrl?: Maybe<Scalars["String"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
};

export type DeCalInstructor = {
  __typename?: "DeCalInstructor";
  email: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type EditPlanTermInput = {
  courses?: InputMaybe<Array<SelectedCourseInput>>;
  hidden?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  pinned?: InputMaybe<Scalars["Boolean"]["input"]>;
  status?: InputMaybe<Status>;
  term?: InputMaybe<Terms>;
  year?: InputMaybe<Scalars["Int"]["input"]>;
};

export type Enrollment = {
  __typename?: "Enrollment";
  courseNumber: Scalars["CourseNumber"]["output"];
  /** Attributes */
  history: Array<EnrollmentSingular>;
  latest?: Maybe<EnrollmentSingular>;
  sectionId: Scalars["SectionIdentifier"]["output"];
  sectionNumber: Scalars["SectionNumber"]["output"];
  semester: Semester;
  sessionId: Scalars["SessionIdentifier"]["output"];
  subject: Scalars["String"]["output"];
  /** Identifiers */
  termId: Scalars["TermIdentifier"]["output"];
  year: Scalars["Int"]["output"];
};

export type EnrollmentDay = {
  __typename?: "EnrollmentDay";
  enrollCount: Scalars["Int"]["output"];
  enrollMax: Scalars["Int"]["output"];
  waitlistCount: Scalars["Int"]["output"];
  waitlistMax: Scalars["Int"]["output"];
};

export enum EnrollmentFilterType {
  NonReservedOpen = "NON_RESERVED_OPEN",
  Open = "OPEN",
  WaitlistOpen = "WAITLIST_OPEN",
}

export type EnrollmentSingular = {
  __typename?: "EnrollmentSingular";
  activeReservedMaxCount: Scalars["Int"]["output"];
  endTime: Scalars["String"]["output"];
  enrolledCount: Scalars["Int"]["output"];
  granularitySeconds: Scalars["Int"]["output"];
  instructorAddConsentRequired?: Maybe<Scalars["Boolean"]["output"]>;
  instructorDropConsentRequired?: Maybe<Scalars["Boolean"]["output"]>;
  maxEnroll: Scalars["Int"]["output"];
  maxWaitlist: Scalars["Int"]["output"];
  minEnroll?: Maybe<Scalars["Int"]["output"]>;
  openReserved: Scalars["Int"]["output"];
  reservedCount: Scalars["Int"]["output"];
  seatReservationCount?: Maybe<Array<SeatReservationCounts>>;
  startTime: Scalars["String"]["output"];
  status?: Maybe<EnrollmentStatus>;
  waitlistedCount: Scalars["Int"]["output"];
};

export enum EnrollmentStatus {
  /** Closed */
  C = "C",
  /** Open */
  O = "O",
}

export type EnrollmentTimeframe = {
  __typename?: "EnrollmentTimeframe";
  endDate?: Maybe<Scalars["String"]["output"]>;
  group: Scalars["String"]["output"];
  isAdjustment: Scalars["Boolean"]["output"];
  phase?: Maybe<Scalars["Int"]["output"]>;
  startDate: Scalars["String"]["output"];
  startEventSummary?: Maybe<Scalars["String"]["output"]>;
};

export type Event = {
  __typename?: "Event";
  _id: Scalars["ID"]["output"];
  color?: Maybe<Color>;
  days: Array<Scalars["Boolean"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  endTime: Scalars["String"]["output"];
  hidden?: Maybe<Scalars["Boolean"]["output"]>;
  location?: Maybe<Scalars["String"]["output"]>;
  startTime: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
};

export type EventInput = {
  color?: InputMaybe<Color>;
  days: Array<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  endTime: Scalars["String"]["input"];
  hidden?: InputMaybe<Scalars["Boolean"]["input"]>;
  location?: InputMaybe<Scalars["String"]["input"]>;
  startTime: Scalars["String"]["input"];
  title: Scalars["String"]["input"];
};

export type Exam = {
  __typename?: "Exam";
  date: Scalars["String"]["output"];
  endTime: Scalars["String"]["output"];
  location?: Maybe<Scalars["String"]["output"]>;
  startTime: Scalars["String"]["output"];
  type: ExamType;
};

export enum ExamType {
  Alt = "ALT",
  /** Final */
  Fin = "FIN",
  Mak = "MAK",
  /** Midterm */
  Mid = "MID",
}

/** Daily aggregated activity across features (schedules, ratings, GradTrak, bookmarks) */
export type GeneralActivityDataPoint = {
  __typename?: "GeneralActivityDataPoint";
  bookmarksAdded: Scalars["Int"]["output"];
  date: Scalars["String"]["output"];
  gradTraksCreated: Scalars["Int"]["output"];
  ratingsSubmitted: Scalars["Int"]["output"];
  schedulesCreated: Scalars["Int"]["output"];
  totalActivity: Scalars["Int"]["output"];
};

/** GradTrak analytics data point for treemap visualization */
export type GradTrakAnalyticsDataPoint = {
  __typename?: "GradTrakAnalyticsDataPoint";
  colleges: Array<Scalars["String"]["output"]>;
  createdAt: Scalars["String"]["output"];
  majors: Array<Scalars["String"]["output"]>;
  minors: Array<Scalars["String"]["output"]>;
  planId: Scalars["ID"]["output"];
  startYear?: Maybe<Scalars["Int"]["output"]>;
  totalCourses: Scalars["Int"]["output"];
  userEmail: Scalars["String"]["output"];
};

export type Grade = {
  __typename?: "Grade";
  count: Scalars["Int"]["output"];
  letter: Scalars["String"]["output"];
  percentage: Scalars["Float"]["output"];
};

export type GradeDistribution = {
  __typename?: "GradeDistribution";
  average?: Maybe<Scalars["Float"]["output"]>;
  distribution?: Maybe<Array<Grade>>;
  pnpPercentage?: Maybe<Scalars["Float"]["output"]>;
};

export type GradtrakStats = {
  __typename?: "GradtrakStats";
  courseHistogram: Array<CourseHistogramBucket>;
  maxCoursesInOnePlan: Scalars["Int"]["output"];
  topPlansWithMostCourses: Array<PlanCourseCount>;
  totalCourses: Scalars["Int"]["output"];
};

export enum InstructionMethod {
  /** Clinic */
  Clc = "CLC",
  /** Clinic */
  Cln = "CLN",
  /** Colloquium */
  Col = "COL",
  /** Conversation */
  Con = "CON",
  /** Demonstration */
  Dem = "DEM",
  /** Discussion */
  Dis = "DIS",
  /** Field Work */
  Fld = "FLD",
  /** Directed Group Study */
  Grp = "GRP",
  /** Independent Study */
  Ind = "IND",
  /** Internship */
  Int = "INT",
  /** Laboratory */
  Lab = "LAB",
  /** Lecture */
  Lec = "LEC",
  /** Practicum */
  Pra = "PRA",
  /** Reading */
  Rea = "REA",
  /** Recitation */
  Rec = "REC",
  /** Seminar */
  Sem = "SEM",
  /** Session */
  Ses = "SES",
  /** Self-paced */
  Slf = "SLF",
  /** Studio */
  Std = "STD",
  /** Tutorial */
  Tut = "TUT",
  /** Unknown */
  Unk = "UNK",
  /** Web-Based Discussion */
  Wbd = "WBD",
  /** Web-Based Lecture */
  Wbl = "WBL",
  /** Workshop */
  Wor = "WOR",
}

/** Instructor information */
export type Instructor = {
  __typename?: "Instructor";
  familyName: Scalars["String"]["output"];
  givenName: Scalars["String"]["output"];
};

/** Ratings by instructor */
export type InstructorRating = {
  __typename?: "InstructorRating";
  aggregatedRatings: AggregatedRatings;
  classesTaught: Array<ClassIdentifier>;
  instructor: Instructor;
};

export type Label = {
  __typename?: "Label";
  color: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type LabelInput = {
  color: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
};

export type Meeting = {
  __typename?: "Meeting";
  days?: Maybe<Array<Scalars["Boolean"]["output"]>>;
  endDate?: Maybe<Scalars["String"]["output"]>;
  endTime?: Maybe<Scalars["String"]["output"]>;
  instructors: Array<Instructor>;
  location?: Maybe<Scalars["String"]["output"]>;
  startDate?: Maybe<Scalars["String"]["output"]>;
  startTime?: Maybe<Scalars["String"]["output"]>;
};

export type Metric = {
  __typename?: "Metric";
  categories: Array<Category>;
  count: Scalars["Int"]["output"];
  metricName: MetricName;
  weightedAverage: Scalars["Float"]["output"];
};

export enum MetricName {
  Attendance = "Attendance",
  Difficulty = "Difficulty",
  Recommended = "Recommended",
  Recording = "Recording",
  Usefulness = "Usefulness",
  Workload = "Workload",
}

export type MonitoredClass = {
  __typename?: "MonitoredClass";
  class: Class;
  notified: Scalars["Boolean"]["output"];
};

export type MonitoredClassInput = {
  class: MonitoredClassRefInput;
};

export type MonitoredClassRefInput = {
  courseNumber: Scalars["CourseNumber"]["input"];
  number: Scalars["ClassNumber"]["input"];
  semester: Semester;
  sessionId?: InputMaybe<Scalars["SessionIdentifier"]["input"]>;
  subject: Scalars["String"]["input"];
  year: Scalars["Int"]["input"];
};

/** Modify data */
export type Mutation = {
  __typename?: "Mutation";
  addClassToCollection: Collection;
  /** Create a new banner. Staff only. */
  createBanner: Banner;
  createCollection: Collection;
  createCuratedClass?: Maybe<CuratedClass>;
  /** Takes in user's email, a college, majors, and minors, creates a new Plan record in the database, and returns the Plan */
  createNewPlan?: Maybe<Plan>;
  /** Takes in PlanTerm fields, creates a new PlanTerm record in the database, and returns the PlanTerm. */
  createNewPlanTerm?: Maybe<PlanTerm>;
  /** Create a new pod. */
  createPod: Pod;
  createRatings: Scalars["Boolean"]["output"];
  /** Create a new route redirect. Staff only. */
  createRouteRedirect: RouteRedirect;
  createSchedule: Schedule;
  createTargetedMessage: TargetedMessage;
  deleteAccount?: Maybe<Scalars["Boolean"]["output"]>;
  /** Delete a banner by ID. Staff only. */
  deleteBanner: Scalars["Boolean"]["output"];
  deleteCollection: Scalars["Boolean"]["output"];
  deleteCuratedClass: Scalars["ID"]["output"];
  /** Deletes plan, for testing purposes */
  deletePlan?: Maybe<Scalars["String"]["output"]>;
  /** Delete a pod by ID. */
  deletePod: Scalars["Boolean"]["output"];
  deleteRatings: Scalars["Boolean"]["output"];
  /** Delete a route redirect by ID. Staff only. */
  deleteRouteRedirect: Scalars["Boolean"]["output"];
  deleteSchedule?: Maybe<Scalars["ID"]["output"]>;
  /** Delete a semester role by ID. */
  deleteSemesterRole: Scalars["Boolean"]["output"];
  /** Delete a staff member and all their roles. */
  deleteStaffMember: Scalars["Boolean"]["output"];
  deleteTargetedMessage: Scalars["Boolean"]["output"];
  editPlan?: Maybe<Plan>;
  /**
   * Takes in planTerm fields, find the planTerm record in the database corresponding to the provided term,
   * updates the record, and returns the updated planTerm
   */
  editPlanTerm?: Maybe<PlanTerm>;
  /**
   * Create or get staff member for a user. Returns the staff member.
   * If user doesn't have a staff record, creates one.
   * Also sets user.staff = true.
   * The addedBy field is automatically set from the authenticated user.
   */
  ensureStaffMember: StaffMember;
  /** Increment the click count for a banner link. Public. */
  incrementBannerClick: Banner;
  /** Increment the dismiss count for a banner. Public. */
  incrementBannerDismiss: Banner;
  /** Increment the click count for a route redirect. Public. */
  incrementRouteRedirectClick: RouteRedirect;
  incrementTargetedMessageDismiss: TargetedMessage;
  removeClassFromCollection: Collection;
  /** Takes in a PlanTerm's ObjectID, deletes the PlanTerm with that ID, and returns the ID. */
  removePlanTermByID?: Maybe<Scalars["ID"]["output"]>;
  /**
   * For the planTerm specified by the term, modifies the courses field, and returns the updated
   * planTerm.
   */
  setSelectedCourses?: Maybe<PlanTerm>;
  /**
   * Sync current Berkeleytime staff emails to the Cloudflare Access group
   * used for private backup access. Only adds missing emails; does not remove
   * any existing group members. Staff-only.
   */
  syncCloudflareStaffAccess: SyncCloudflareStaffAccessResult;
  /** Track a banner view. Public. */
  trackBannerView: Scalars["Boolean"]["output"];
  trackClassView: Scalars["Boolean"]["output"];
  /** Update a banner by ID. Staff only. */
  updateBanner: Banner;
  updateCollection: Collection;
  updateCuratedClass?: Maybe<CuratedClass>;
  /**
   * Update a manual override for a specific requirement in a SelectedPlanRequirement.
   * Used when user manually checks off a requirement.
   */
  updateManualOverride?: Maybe<Plan>;
  /** Update a route redirect by ID. Staff only. */
  updateRouteRedirect: RouteRedirect;
  updateSchedule: Schedule;
  /**
   * Update all selectedPlanRequirements for the user's plan.
   * Used when re-evaluating requirements or initializing them.
   */
  updateSelectedPlanRequirements?: Maybe<Plan>;
  /** Update staff member info (personalLink). */
  updateStaffInfo: StaffMember;
  updateTargetedMessage: TargetedMessage;
  updateUser?: Maybe<User>;
  /**
   * Upsert a semester role for a staff member.
   * Creates if no role exists for that (memberId, year, semester).
   * Updates if one exists.
   */
  upsertSemesterRole: SemesterRole;
  voteReviewHelpful: Scalars["Int"]["output"];
};

/** Modify data */
export type MutationAddClassToCollectionArgs = {
  input: AddClassInput;
};

/** Modify data */
export type MutationCreateBannerArgs = {
  input: CreateBannerInput;
};

/** Modify data */
export type MutationCreateCollectionArgs = {
  input: CreateCollectionInput;
};

/** Modify data */
export type MutationCreateCuratedClassArgs = {
  curatedClass: CreateCuratedClassInput;
};

/** Modify data */
export type MutationCreateNewPlanArgs = {
  colleges: Array<Colleges>;
  endYear: Scalars["Int"]["input"];
  majors: Array<Scalars["String"]["input"]>;
  minors: Array<Scalars["String"]["input"]>;
  startYear: Scalars["Int"]["input"];
};

/** Modify data */
export type MutationCreateNewPlanTermArgs = {
  planTerm: PlanTermInput;
};

/** Modify data */
export type MutationCreatePodArgs = {
  input: CreatePodInput;
};

/** Modify data */
export type MutationCreateRatingsArgs = {
  classNumber: Scalars["String"]["input"];
  courseNumber: Scalars["String"]["input"];
  metrics: Array<RatingMetricInput>;
  reviewContent?: InputMaybe<Scalars["String"]["input"]>;
  reviewTitle?: InputMaybe<Scalars["String"]["input"]>;
  reviewerGrade?: InputMaybe<Scalars["String"]["input"]>;
  semester: Semester;
  subject: Scalars["String"]["input"];
  year: Scalars["Int"]["input"];
};

/** Modify data */
export type MutationCreateRouteRedirectArgs = {
  input: CreateRouteRedirectInput;
};

/** Modify data */
export type MutationCreateScheduleArgs = {
  schedule: CreateScheduleInput;
};

/** Modify data */
export type MutationCreateTargetedMessageArgs = {
  input: CreateTargetedMessageInput;
};

/** Modify data */
export type MutationDeleteBannerArgs = {
  bannerId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationDeleteCollectionArgs = {
  id: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationDeleteCuratedClassArgs = {
  id: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationDeletePodArgs = {
  podId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationDeleteRatingsArgs = {
  courseNumber: Scalars["String"]["input"];
  subject: Scalars["String"]["input"];
};

/** Modify data */
export type MutationDeleteRouteRedirectArgs = {
  redirectId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationDeleteScheduleArgs = {
  id: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationDeleteSemesterRoleArgs = {
  roleId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationDeleteStaffMemberArgs = {
  memberId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationDeleteTargetedMessageArgs = {
  messageId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationEditPlanArgs = {
  plan: PlanInput;
};

/** Modify data */
export type MutationEditPlanTermArgs = {
  id: Scalars["ID"]["input"];
  planTerm: EditPlanTermInput;
};

/** Modify data */
export type MutationEnsureStaffMemberArgs = {
  userId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationIncrementBannerClickArgs = {
  bannerId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationIncrementBannerDismissArgs = {
  bannerId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationIncrementRouteRedirectClickArgs = {
  redirectId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationIncrementTargetedMessageDismissArgs = {
  messageId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationRemoveClassFromCollectionArgs = {
  input: RemoveClassInput;
};

/** Modify data */
export type MutationRemovePlanTermByIdArgs = {
  id: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationSetSelectedCoursesArgs = {
  courses: Array<SelectedCourseInput>;
  id: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationTrackBannerViewArgs = {
  bannerId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationTrackClassViewArgs = {
  courseNumber: Scalars["CourseNumber"]["input"];
  number: Scalars["ClassNumber"]["input"];
  semester: Semester;
  sessionId?: InputMaybe<Scalars["SessionIdentifier"]["input"]>;
  subject: Scalars["String"]["input"];
  year: Scalars["Int"]["input"];
};

/** Modify data */
export type MutationUpdateBannerArgs = {
  bannerId: Scalars["ID"]["input"];
  input: UpdateBannerInput;
};

/** Modify data */
export type MutationUpdateCollectionArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateCollectionInput;
};

/** Modify data */
export type MutationUpdateCuratedClassArgs = {
  curatedClass: UpdateCuratedClassInput;
  id: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationUpdateManualOverrideArgs = {
  input: UpdateManualOverrideInput;
};

/** Modify data */
export type MutationUpdateRouteRedirectArgs = {
  input: UpdateRouteRedirectInput;
  redirectId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationUpdateScheduleArgs = {
  id: Scalars["ID"]["input"];
  schedule: UpdateScheduleInput;
};

/** Modify data */
export type MutationUpdateSelectedPlanRequirementsArgs = {
  selectedPlanRequirements: Array<SelectedPlanRequirementInput>;
};

/** Modify data */
export type MutationUpdateStaffInfoArgs = {
  input: UpdateStaffInfoInput;
  memberId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationUpdateTargetedMessageArgs = {
  input: UpdateTargetedMessageInput;
  messageId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationUpdateUserArgs = {
  user: UpdateUserInput;
};

/** Modify data */
export type MutationUpsertSemesterRoleArgs = {
  input: UpsertSemesterRoleInput;
  memberId: Scalars["ID"]["input"];
};

/** Modify data */
export type MutationVoteReviewHelpfulArgs = {
  reviewId: Scalars["String"]["input"];
};

/**
 * Optional response data point for analytics
 * Indicates whether optional fields (Recording, Attendance) were filled for a rating submission
 */
export type OptionalResponseDataPoint = {
  __typename?: "OptionalResponseDataPoint";
  /** Timestamp when the rating was created */
  createdAt: Scalars["String"]["output"];
  /** Whether at least one optional field was filled */
  hasOptional: Scalars["Boolean"]["output"];
};

export type Plan = {
  __typename?: "Plan";
  _id: Scalars["ID"]["output"];
  colleges: Array<Colleges>;
  created: Scalars["String"]["output"];
  labels: Array<Label>;
  majors: Array<Scalars["String"]["output"]>;
  minors: Array<Scalars["String"]["output"]>;
  planTerms: Array<PlanTerm>;
  revised: Scalars["String"]["output"];
  /** Selected plan requirements with met status tracking */
  selectedPlanRequirements: Array<SelectedPlanRequirement>;
  userEmail: Scalars["String"]["output"];
};

export type PlanCourseCount = {
  __typename?: "PlanCourseCount";
  planId: Scalars["ID"]["output"];
  totalCourses: Scalars["Int"]["output"];
};

export type PlanInput = {
  colleges?: InputMaybe<Array<Colleges>>;
  labels?: InputMaybe<Array<LabelInput>>;
  majors?: InputMaybe<Array<Scalars["String"]["input"]>>;
  minors?: InputMaybe<Array<Scalars["String"]["input"]>>;
  selectedPlanRequirements?: InputMaybe<Array<SelectedPlanRequirementInput>>;
};

/** PlanRequirement: Stores BtLL code for evaluating requirements */
export type PlanRequirement = {
  __typename?: "PlanRequirement";
  _id: Scalars["ID"]["output"];
  code: Scalars["String"]["output"];
  college?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["String"]["output"];
  createdBy: Scalars["String"]["output"];
  isOfficial: Scalars["Boolean"]["output"];
  isUcReq: Scalars["Boolean"]["output"];
  major?: Maybe<Scalars["String"]["output"]>;
  minor?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["String"]["output"];
};

export type PlanTerm = {
  __typename?: "PlanTerm";
  _id: Scalars["ID"]["output"];
  courses: Array<SelectedCourse>;
  hidden: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  pinned: Scalars["Boolean"]["output"];
  status: Status;
  term: Terms;
  userEmail: Scalars["String"]["output"];
  year: Scalars["Int"]["output"];
};

export type PlanTermInput = {
  courses: Array<SelectedCourseInput>;
  hidden: Scalars["Boolean"]["input"];
  name: Scalars["String"]["input"];
  pinned: Scalars["Boolean"]["input"];
  status: Status;
  term: Terms;
  year: Scalars["Int"]["input"];
};

/** A pod (team) associated with a specific semester and year. */
export type Pod = {
  __typename?: "Pod";
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  semester: Semester;
  year: Scalars["Int"]["output"];
};

/** Get data */
export type Query = {
  __typename?: "Query";
  /**
   * Staff-only: Activity score distribution across all users (10 buckets of 0.1 width).
   * Pass a formula name to compare different scoring approaches without persisting to the DB.
   * Valid values: exponentialDecay | linearDecay | tiered | sigmoid
   */
  activityScoreDistribution: Array<ActivityScoreDistributionPoint>;
  aggregatedRatings: AggregatedRatings;
  /** Get all visible banners. Public. */
  allBanners: Array<Banner>;
  /** Get all banners including hidden ones. Staff only. */
  allBannersForStaff: Array<Banner>;
  /** Get all pods. */
  allPods: Array<Pod>;
  /** All raw ratings with anonymized user IDs */
  allRatings: Array<RawRating>;
  /** Get all route redirects. */
  allRouteRedirects: Array<RouteRedirect>;
  /** Get all staff members. */
  allStaffMembers: Array<StaffMember>;
  allTargetedMessagesForStaff: Array<TargetedMessage>;
  /** Get all users (staff only). */
  allUsers: Array<UserSearchResult>;
  /** Get click statistics grouped by banner version. Staff only. */
  bannerClickStatsByVersion: Array<BannerVersionClickStats>;
  /** Get the version history for a banner. Staff only. */
  bannerVersionHistory: Array<BannerVersionEntry>;
  catalog: Array<Class>;
  catalogClassIdentities: Array<CatalogClassIdentity>;
  catalogFilterOptions: CatalogFilterOptions;
  catalogSearch: CatalogResult;
  class?: Maybe<Class>;
  /** Reviews scoped to a specific course grouped by anonymous user */
  classReviews: ClassReviews;
  /** Get click events for a specific target. Staff only. */
  clickEvents: ClickEventConnection;
  /** Get click counts per day for a target. Staff only. */
  clickEventsTimeSeries: Array<ClickEventsTimeSeriesPoint>;
  /** Get aggregated click statistics for a specific target. Staff only. */
  clickStats: ClickStats;
  /** Staff-only: Cloudflare analytics data for the specified number of days and granularity */
  cloudflareAnalyticsData?: Maybe<CloudflareAnalyticsData>;
  /** Staff-only: Collection analytics data */
  collectionAnalyticsData: CollectionAnalyticsData;
  course?: Maybe<Course>;
  courseById?: Maybe<Course>;
  courses: Array<Course>;
  curatedClass?: Maybe<CuratedClass>;
  curatedClasses: Array<CuratedClass>;
  enrollment?: Maybe<Enrollment>;
  enrollmentTimeframes: Array<EnrollmentTimeframe>;
  /** Staff-only: Daily activity aggregated across all features (schedules, ratings, GradTrak, bookmarks) */
  generalActivityAnalytics: Array<GeneralActivityDataPoint>;
  /** Staff-only: GradTrak analytics data for visualization */
  gradTrakAnalyticsData: Array<GradTrakAnalyticsDataPoint>;
  grade: GradeDistribution;
  multipleClassAggregatedRatings: AggregatedRatings;
  myCollection?: Maybe<Collection>;
  myCollectionById?: Maybe<Collection>;
  myCollections: Array<Collection>;
  /** Staff-only: Optional response data for analytics (Recording/Attendance completion) */
  optionalResponseAnalyticsData: Array<OptionalResponseDataPoint>;
  /** @deprecated test */
  ping: Scalars["String"]["output"];
  /** Takes in user's email and returns their entire plan */
  planByUser: Array<Plan>;
  /** Staff-only: Rating data points for analytics timeseries */
  ratingAnalyticsData: Array<RatingDataPoint>;
  /** Staff-only: Rating metric values for analytics (average scores over time) */
  ratingMetricsAnalyticsData: Array<RatingMetricDataPoint>;
  schedule?: Maybe<Schedule>;
  /** Staff-only: Scheduler analytics data for visualization */
  schedulerAnalyticsData: Array<SchedulerAnalyticsDataPoint>;
  schedules?: Maybe<Array<Maybe<Schedule>>>;
  section?: Maybe<Section>;
  semestersWithRatings: Array<SemesterRatings>;
  /** Get all staff members for a specific semester. */
  staffBySemester: Array<SemesterRole>;
  /** Get a staff member by ID. */
  staffMember?: Maybe<StaffMember>;
  /** Get a staff member by user ID. */
  staffMemberByUserId?: Maybe<StaffMember>;
  /** Dashboard statistics aggregation */
  stats: Stats;
  targetedMessagesForCourse: Array<TargetedMessage>;
  /** Query for a term. */
  term?: Maybe<Term>;
  /** Query for terms. */
  terms: Array<Term>;
  user?: Maybe<User>;
  /** Staff-only: User activity data (lastSeenAt timestamps) for analytics */
  userActivityAnalyticsData: Array<UserActivityDataPoint>;
  userClassRatings: UserClass;
  /** Staff-only: User creation timestamps for analytics */
  userCreationAnalyticsData: Array<UserCreationDataPoint>;
  userRatings: UserRatings;
};

/** Get data */
export type QueryActivityScoreDistributionArgs = {
  formula?: InputMaybe<Scalars["String"]["input"]>;
};

/** Get data */
export type QueryAggregatedRatingsArgs = {
  classNumber?: InputMaybe<Scalars["String"]["input"]>;
  courseNumber: Scalars["String"]["input"];
  semester: Semester;
  subject: Scalars["String"]["input"];
  year: Scalars["Int"]["input"];
};

/** Get data */
export type QueryBannerClickStatsByVersionArgs = {
  bannerId: Scalars["ID"]["input"];
  endDate?: InputMaybe<Scalars["String"]["input"]>;
  startDate?: InputMaybe<Scalars["String"]["input"]>;
};

/** Get data */
export type QueryBannerVersionHistoryArgs = {
  bannerId: Scalars["ID"]["input"];
};

/** Get data */
export type QueryCatalogArgs = {
  semester: Semester;
  year: Scalars["Int"]["input"];
};

/** Get data */
export type QueryCatalogClassIdentitiesArgs = {
  semester: Semester;
  year: Scalars["Int"]["input"];
};

/** Get data */
export type QueryCatalogFilterOptionsArgs = {
  semester: Semester;
  year: Scalars["Int"]["input"];
};

/** Get data */
export type QueryCatalogSearchArgs = {
  filters?: InputMaybe<CatalogFilters>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  semanticSearch?: InputMaybe<Scalars["Boolean"]["input"]>;
  semester: Semester;
  sortBy?: InputMaybe<CatalogSortBy>;
  sortOrder?: InputMaybe<SortOrder>;
  year: Scalars["Int"]["input"];
};

/** Get data */
export type QueryClassArgs = {
  courseNumber: Scalars["CourseNumber"]["input"];
  number: Scalars["ClassNumber"]["input"];
  semester: Semester;
  sessionId?: InputMaybe<Scalars["SessionIdentifier"]["input"]>;
  subject: Scalars["String"]["input"];
  year: Scalars["Int"]["input"];
};

/** Get data */
export type QueryClassReviewsArgs = {
  courseNumber: Scalars["String"]["input"];
  subject: Scalars["String"]["input"];
};

/** Get data */
export type QueryClickEventsArgs = {
  endDate?: InputMaybe<Scalars["String"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  startDate?: InputMaybe<Scalars["String"]["input"]>;
  targetId: Scalars["ID"]["input"];
  targetType: Scalars["String"]["input"];
};

/** Get data */
export type QueryClickEventsTimeSeriesArgs = {
  endDate?: InputMaybe<Scalars["String"]["input"]>;
  startDate?: InputMaybe<Scalars["String"]["input"]>;
  targetId: Scalars["ID"]["input"];
  targetType: Scalars["String"]["input"];
};

/** Get data */
export type QueryClickStatsArgs = {
  endDate?: InputMaybe<Scalars["String"]["input"]>;
  startDate?: InputMaybe<Scalars["String"]["input"]>;
  targetId: Scalars["ID"]["input"];
  targetType: Scalars["String"]["input"];
};

/** Get data */
export type QueryCloudflareAnalyticsDataArgs = {
  days: Scalars["Int"]["input"];
  granularity?: InputMaybe<Scalars["String"]["input"]>;
};

/** Get data */
export type QueryCourseArgs = {
  number: Scalars["CourseNumber"]["input"];
  subject: Scalars["String"]["input"];
};

/** Get data */
export type QueryCourseByIdArgs = {
  courseId: Scalars["CourseIdentifier"]["input"];
};

/** Get data */
export type QueryCuratedClassArgs = {
  id: Scalars["ID"]["input"];
};

/** Get data */
export type QueryEnrollmentArgs = {
  courseNumber: Scalars["CourseNumber"]["input"];
  sectionNumber: Scalars["SectionNumber"]["input"];
  semester: Semester;
  sessionId?: InputMaybe<Scalars["SessionIdentifier"]["input"]>;
  subject: Scalars["String"]["input"];
  year: Scalars["Int"]["input"];
};

/** Get data */
export type QueryEnrollmentTimeframesArgs = {
  semester: Semester;
  year: Scalars["Int"]["input"];
};

/** Get data */
export type QueryGeneralActivityAnalyticsArgs = {
  days: Scalars["Int"]["input"];
};

/** Get data */
export type QueryGradeArgs = {
  classNumber?: InputMaybe<Scalars["ClassNumber"]["input"]>;
  courseId: Scalars["String"]["input"];
  familyName?: InputMaybe<Scalars["String"]["input"]>;
  givenName?: InputMaybe<Scalars["String"]["input"]>;
  semester?: InputMaybe<Semester>;
  sessionId?: InputMaybe<Scalars["SessionIdentifier"]["input"]>;
  subject: Scalars["String"]["input"];
  year?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Get data */
export type QueryMultipleClassAggregatedRatingsArgs = {
  classes: Array<ClassWithoutCourseInput>;
  courseNumber: Scalars["String"]["input"];
  subject: Scalars["String"]["input"];
};

/** Get data */
export type QueryMyCollectionArgs = {
  name: Scalars["String"]["input"];
};

/** Get data */
export type QueryMyCollectionByIdArgs = {
  id: Scalars["ID"]["input"];
};

/** Get data */
export type QueryScheduleArgs = {
  id: Scalars["ID"]["input"];
};

/** Get data */
export type QuerySectionArgs = {
  courseNumber: Scalars["CourseNumber"]["input"];
  number: Scalars["SectionNumber"]["input"];
  semester: Semester;
  sessionId?: InputMaybe<Scalars["SessionIdentifier"]["input"]>;
  subject: Scalars["String"]["input"];
  year: Scalars["Int"]["input"];
};

/** Get data */
export type QuerySemestersWithRatingsArgs = {
  courseNumber: Scalars["String"]["input"];
  subject: Scalars["String"]["input"];
};

/** Get data */
export type QueryStaffBySemesterArgs = {
  semester: Semester;
  year: Scalars["Int"]["input"];
};

/** Get data */
export type QueryStaffMemberArgs = {
  id: Scalars["ID"]["input"];
};

/** Get data */
export type QueryStaffMemberByUserIdArgs = {
  userId: Scalars["ID"]["input"];
};

/** Get data */
export type QueryTargetedMessagesForCourseArgs = {
  courseId: Scalars["String"]["input"];
};

/** Get data */
export type QueryTermArgs = {
  semester: Semester;
  year: Scalars["Int"]["input"];
};

/** Get data */
export type QueryTermsArgs = {
  withCatalogData?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Get data */
export type QueryUserClassRatingsArgs = {
  classNumber: Scalars["String"]["input"];
  courseNumber: Scalars["String"]["input"];
  semester: Semester;
  subject: Scalars["String"]["input"];
  year: Scalars["Int"]["input"];
};

/**
 * Minimal rating data point for analytics timeseries
 * Contains only the data needed to compute growth metrics
 */
export type RatingDataPoint = {
  __typename?: "RatingDataPoint";
  /** Course identifier (subject + courseNumber) */
  courseKey: Scalars["String"]["output"];
  /** Timestamp when the rating was created */
  createdAt: Scalars["String"]["output"];
  /** User email for counting unique users */
  userEmail: Scalars["String"]["output"];
};

/**
 * Rating metric data point for analytics
 * Contains metric name and value for computing average scores over time
 */
export type RatingMetricDataPoint = {
  __typename?: "RatingMetricDataPoint";
  /** Course identifier (subject + courseNumber) */
  courseKey: Scalars["String"]["output"];
  /** Timestamp when the rating was created */
  createdAt: Scalars["String"]["output"];
  /** The metric name (Usefulness, Difficulty, Workload) */
  metricName: MetricName;
  /** The rating value (1-5) */
  value: Scalars["Int"]["output"];
};

export type RatingMetricInput = {
  metricName: MetricName;
  value: Scalars["Int"]["input"];
};

export type RatingsStats = {
  __typename?: "RatingsStats";
  classWithMostRatings?: Maybe<ClassWithMostRatings>;
  classesWithRatings: Scalars["Int"]["output"];
  courseWithMostRatings?: Maybe<CourseWithMostRatings>;
  uniqueCreatedBy: Scalars["Int"]["output"];
};

export type RawRating = {
  __typename?: "RawRating";
  anonymousUserId: Scalars["String"]["output"];
  classNumber: Scalars["String"]["output"];
  courseNumber: Scalars["String"]["output"];
  createdAt: Scalars["String"]["output"];
  metricName: MetricName;
  semester: Semester;
  subject: Scalars["String"]["output"];
  value: Scalars["Int"]["output"];
  year: Scalars["Int"]["output"];
};

export type RemoveClassInput = {
  classNumber: Scalars["ClassNumber"]["input"];
  collectionId: Scalars["ID"]["input"];
  courseNumber: Scalars["CourseNumber"]["input"];
  semester: Semester;
  sessionId: Scalars["SessionIdentifier"]["input"];
  subject: Scalars["String"]["input"];
  year: Scalars["Int"]["input"];
};

export type RequirementGroupDescriptor = {
  __typename?: "RequirementGroupDescriptor";
  code?: Maybe<Scalars["String"]["output"]>;
  description: Scalars["String"]["output"];
};

export type Reservation = {
  __typename?: "Reservation";
  enrollCount: Scalars["Int"]["output"];
  enrollMax: Scalars["Int"]["output"];
  group: Scalars["String"]["output"];
};

/** A route redirect that maps one path to another. */
export type RouteRedirect = {
  __typename?: "RouteRedirect";
  clickCount: Scalars["Int"]["output"];
  clickEventLogging: Scalars["Boolean"]["output"];
  createdAt: Scalars["String"]["output"];
  fromPath: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  toPath: Scalars["String"]["output"];
  updatedAt: Scalars["String"]["output"];
};

export type Schedule = {
  __typename?: "Schedule";
  _id: Scalars["ID"]["output"];
  classes: Array<SelectedClass>;
  createdBy: Scalars["String"]["output"];
  events: Array<Event>;
  name: Scalars["String"]["output"];
  public: Scalars["Boolean"]["output"];
  semester: Semester;
  sessionId: Scalars["SessionIdentifier"]["output"];
  term: Term;
  year: Scalars["Int"]["output"];
};

/** Scheduler analytics data point for staff dashboard */
export type SchedulerAnalyticsDataPoint = {
  __typename?: "SchedulerAnalyticsDataPoint";
  createdAt: Scalars["String"]["output"];
  scheduleId: Scalars["ID"]["output"];
  semester: Scalars["String"]["output"];
  totalClasses: Scalars["Int"]["output"];
  userEmail: Scalars["String"]["output"];
  year: Scalars["Int"]["output"];
};

export type SchedulerStats = {
  __typename?: "SchedulerStats";
  schedulesBySemester: Array<SemesterScheduleCount>;
  totalSchedules: Scalars["Int"]["output"];
  uniqueUsersWithSchedules: Scalars["Int"]["output"];
};

export type SeatReservationCounts = {
  __typename?: "SeatReservationCounts";
  enrolledCount: Scalars["Int"]["output"];
  fromDate: Scalars["String"]["output"];
  isValid: Scalars["Boolean"]["output"];
  maxEnroll: Scalars["Int"]["output"];
  number: Scalars["Int"]["output"];
  requirementGroup: RequirementGroupDescriptor;
};

export type Section = {
  __typename?: "Section";
  attendanceRequired?: Maybe<Scalars["Boolean"]["output"]>;
  class: Class;
  classNumber: Scalars["ClassNumber"]["output"];
  component: Component;
  course: Course;
  courseNumber: Scalars["CourseNumber"]["output"];
  endDate: Scalars["String"]["output"];
  enrollment?: Maybe<Enrollment>;
  exams: Array<Exam>;
  instructionMode: Scalars["String"]["output"];
  lecturesRecorded?: Maybe<Scalars["Boolean"]["output"]>;
  meetings: Array<Meeting>;
  number: Scalars["SectionNumber"]["output"];
  online: Scalars["Boolean"]["output"];
  primary: Scalars["Boolean"]["output"];
  sectionAttributes?: Maybe<Array<SectionAttribute>>;
  sectionId: Scalars["SectionIdentifier"]["output"];
  semester: Semester;
  sessionId: Scalars["SessionIdentifier"]["output"];
  startDate: Scalars["String"]["output"];
  subject: Scalars["String"]["output"];
  /** Relationships */
  term: Term;
  /** Identifiers */
  termId: Scalars["TermIdentifier"]["output"];
  /** Attributes */
  year: Scalars["Int"]["output"];
};

export type SectionSectionAttributesArgs = {
  attributeCode?: InputMaybe<Scalars["String"]["input"]>;
};

export type SectionAttribute = {
  __typename?: "SectionAttribute";
  attribute: SectionAttributeInfo;
  value: SectionAttributeInfo;
};

export type SectionAttributeInfo = {
  __typename?: "SectionAttributeInfo";
  code?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  formalDescription?: Maybe<Scalars["String"]["output"]>;
};

export type SelectedClass = {
  __typename?: "SelectedClass";
  blockedSections?: Maybe<Array<Scalars["SectionIdentifier"]["output"]>>;
  class: Class;
  color?: Maybe<Color>;
  hidden?: Maybe<Scalars["Boolean"]["output"]>;
  locked?: Maybe<Scalars["Boolean"]["output"]>;
  lockedComponents?: Maybe<Array<Component>>;
  selectedSections: Array<Section>;
};

export type SelectedClassInput = {
  blockedSections?: InputMaybe<Array<Scalars["SectionIdentifier"]["input"]>>;
  color?: InputMaybe<Color>;
  courseNumber: Scalars["CourseNumber"]["input"];
  hidden?: InputMaybe<Scalars["Boolean"]["input"]>;
  locked?: InputMaybe<Scalars["Boolean"]["input"]>;
  lockedComponents?: InputMaybe<Array<Component>>;
  number: Scalars["ClassNumber"]["input"];
  sectionIds: Array<Scalars["SectionIdentifier"]["input"]>;
  subject: Scalars["String"]["input"];
};

export type SelectedCourse = {
  __typename?: "SelectedCourse";
  /** Identifiers (probably cs-course-ids) for the classes the user has added to their schedule. */
  courseID: Scalars["String"]["output"];
  courseName: Scalars["String"]["output"];
  courseTitle: Scalars["String"]["output"];
  courseUnits: Scalars["Int"]["output"];
  labels: Array<Label>;
  pnp: Scalars["Boolean"]["output"];
  transfer: Scalars["Boolean"]["output"];
};

export type SelectedCourseInput = {
  courseID: Scalars["String"]["input"];
  courseName: Scalars["String"]["input"];
  courseTitle: Scalars["String"]["input"];
  courseUnits: Scalars["Int"]["input"];
  labels: Array<LabelInput>;
  pnp: Scalars["Boolean"]["input"];
  transfer: Scalars["Boolean"]["input"];
};

/** SelectedPlanRequirement: Links a PlanRequirement to a Plan with met status tracking */
export type SelectedPlanRequirement = {
  __typename?: "SelectedPlanRequirement";
  /**
   * Manual overrides: when user manually checks off a requirement.
   * null = use evaluated value, true = manually marked as met, false = manually marked as not met
   */
  manualOverrides: Array<Maybe<Scalars["Boolean"]["output"]>>;
  planRequirement: PlanRequirement;
  planRequirementId: Scalars["ID"]["output"];
};

export type SelectedPlanRequirementInput = {
  manualOverrides: Array<InputMaybe<Scalars["Boolean"]["input"]>>;
  planRequirementId: Scalars["ID"]["input"];
};

export enum Semester {
  Fall = "Fall",
  Spring = "Spring",
  Summer = "Summer",
  Winter = "Winter",
}

export type SemesterRatings = {
  __typename?: "SemesterRatings";
  maxMetricCount: Scalars["Int"]["output"];
  semester: Semester;
  year: Scalars["Int"]["output"];
};

/** A staff member's role in a specific semester. */
export type SemesterRole = {
  __typename?: "SemesterRole";
  altPhoto?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isLeadership: Scalars["Boolean"]["output"];
  member: StaffMember;
  photo?: Maybe<Scalars["String"]["output"]>;
  role: Scalars["String"]["output"];
  semester: Semester;
  team?: Maybe<Scalars["String"]["output"]>;
  year: Scalars["Int"]["output"];
};

export type SemesterScheduleCount = {
  __typename?: "SemesterScheduleCount";
  count: Scalars["Int"]["output"];
  semester: Scalars["String"]["output"];
  year: Scalars["Int"]["output"];
};

/** Session, for example Summer Session A */
export type Session = {
  __typename?: "Session";
  endDate: Scalars["String"]["output"];
  /** Identifiers */
  id: Scalars["SessionIdentifier"]["output"];
  name: Scalars["String"]["output"];
  startDate: Scalars["String"]["output"];
  /** Attributes */
  temporalPosition: TemporalPosition;
};

export enum SortOrder {
  Asc = "ASC",
  Desc = "DESC",
}

/** A staff member (may or may not have a user account). */
export type StaffMember = {
  __typename?: "StaffMember";
  addedBy?: Maybe<Scalars["ID"]["output"]>;
  addedByName?: Maybe<Scalars["String"]["output"]>;
  createdAt?: Maybe<Scalars["String"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  personalLink?: Maybe<Scalars["String"]["output"]>;
  roles: Array<SemesterRole>;
  userId?: Maybe<Scalars["ID"]["output"]>;
};

export type Stats = {
  __typename?: "Stats";
  collections: CollectionsStats;
  gradtrak: GradtrakStats;
  ratings: RatingsStats;
  scheduler: SchedulerStats;
  users: UserStats;
};

export enum Status {
  Complete = "Complete",
  InProgress = "InProgress",
  Incomplete = "Incomplete",
  None = "None",
}

/** Result of syncing staff emails to the Cloudflare Access group. */
export type SyncCloudflareStaffAccessResult = {
  __typename?: "SyncCloudflareStaffAccessResult";
  /** Emails that were added to the group (previously missing). */
  added: Array<Scalars["String"]["output"]>;
  /** If present, Cloudflare sync failed (e.g. API or lock); added may be partial or empty. */
  errorMessage?: Maybe<Scalars["String"]["output"]>;
};

/** A targeted message displayed on specific course pages. */
export type TargetedMessage = {
  __typename?: "TargetedMessage";
  clickCount: Scalars["Int"]["output"];
  clickEventLogging: Scalars["Boolean"]["output"];
  createdAt: Scalars["String"]["output"];
  currentVersion: Scalars["Int"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  dismissCount: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  link?: Maybe<Scalars["String"]["output"]>;
  linkText?: Maybe<Scalars["String"]["output"]>;
  persistent: Scalars["Boolean"]["output"];
  reappearing: Scalars["Boolean"]["output"];
  targetCourses: Array<TargetedMessageCourse>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["String"]["output"];
  visible: Scalars["Boolean"]["output"];
};

/** A course targeted by a message. */
export type TargetedMessageCourse = {
  __typename?: "TargetedMessageCourse";
  courseId: Scalars["String"]["output"];
  courseNumber: Scalars["String"]["output"];
  subject: Scalars["String"]["output"];
};

export type TargetedMessageCourseInput = {
  courseId: Scalars["String"]["input"];
  courseNumber: Scalars["String"]["input"];
  subject: Scalars["String"]["input"];
};

export enum TemporalPosition {
  /** The current term.  */
  Current = "Current",
  /** The future terms. Usually only includes the immediate next term. */
  Future = "Future",
  /** All past terms. */
  Past = "Past",
}

/** Term */
export type Term = {
  __typename?: "Term";
  academicCareerCode: AcademicCareerCode;
  endDate: Scalars["String"]["output"];
  hasCatalogData: Scalars["Boolean"]["output"];
  /** Identifiers */
  id: Scalars["TermIdentifier"]["output"];
  semester: Semester;
  sessions?: Maybe<Array<Session>>;
  startDate: Scalars["String"]["output"];
  /** Attributes */
  temporalPosition: TemporalPosition;
  year: Scalars["Int"]["output"];
};

/** The combination of year and season that corresponds to a specific term. Both year and season/semester are required. */
export type TermInput = {
  semester: Semester;
  year: Scalars["Int"]["input"];
};

export enum Terms {
  Fall = "Fall",
  Misc = "Misc",
  Spring = "Spring",
  Summer = "Summer",
}

/** Input for updating a banner. */
export type UpdateBannerInput = {
  clickEventLogging?: InputMaybe<Scalars["Boolean"]["input"]>;
  link?: InputMaybe<Scalars["String"]["input"]>;
  linkText?: InputMaybe<Scalars["String"]["input"]>;
  persistent?: InputMaybe<Scalars["Boolean"]["input"]>;
  reappearing?: InputMaybe<Scalars["Boolean"]["input"]>;
  text?: InputMaybe<Scalars["String"]["input"]>;
  visible?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateCollectionInput = {
  color?: InputMaybe<CollectionColor>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  pinned?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateCuratedClassInput = {
  courseNumber?: InputMaybe<Scalars["CourseNumber"]["input"]>;
  image?: InputMaybe<Scalars["String"]["input"]>;
  number?: InputMaybe<Scalars["ClassNumber"]["input"]>;
  semester?: InputMaybe<Semester>;
  sessionId?: InputMaybe<Scalars["SessionIdentifier"]["input"]>;
  subject?: InputMaybe<Scalars["String"]["input"]>;
  text?: InputMaybe<Scalars["String"]["input"]>;
  year?: InputMaybe<Scalars["Int"]["input"]>;
};

export type UpdateManualOverrideInput = {
  /** null to clear override, true/false to set manual override */
  manualOverride?: InputMaybe<Scalars["Boolean"]["input"]>;
  planRequirementId: Scalars["ID"]["input"];
  /** Index of the requirement to update */
  requirementIndex: Scalars["Int"]["input"];
};

/** Input for updating a route redirect. */
export type UpdateRouteRedirectInput = {
  clickEventLogging?: InputMaybe<Scalars["Boolean"]["input"]>;
  fromPath?: InputMaybe<Scalars["String"]["input"]>;
  toPath?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateScheduleInput = {
  classes?: InputMaybe<Array<InputMaybe<SelectedClassInput>>>;
  events?: InputMaybe<Array<InputMaybe<EventInput>>>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  public?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Input for updating staff member info. */
export type UpdateStaffInfoInput = {
  name?: InputMaybe<Scalars["String"]["input"]>;
  personalLink?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateTargetedMessageInput = {
  clickEventLogging?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  link?: InputMaybe<Scalars["String"]["input"]>;
  linkText?: InputMaybe<Scalars["String"]["input"]>;
  persistent?: InputMaybe<Scalars["Boolean"]["input"]>;
  reappearing?: InputMaybe<Scalars["Boolean"]["input"]>;
  targetCourses?: InputMaybe<Array<TargetedMessageCourseInput>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  visible?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateUserInput = {
  bookmarkedClasses?: InputMaybe<Array<BookmarkedClassInput>>;
  bookmarkedCourses?: InputMaybe<Array<BookmarkedCourseInput>>;
  majors?: InputMaybe<Array<Scalars["String"]["input"]>>;
  minors?: InputMaybe<Array<Scalars["String"]["input"]>>;
  monitoredClasses?: InputMaybe<Array<MonitoredClassInput>>;
  notificationsOn: Scalars["Boolean"]["input"];
};

/** Input for creating/updating a semester role. */
export type UpsertSemesterRoleInput = {
  altPhoto?: InputMaybe<Scalars["String"]["input"]>;
  isLeadership?: InputMaybe<Scalars["Boolean"]["input"]>;
  photo?: InputMaybe<Scalars["String"]["input"]>;
  role: Scalars["String"]["input"];
  semester: Semester;
  team?: InputMaybe<Scalars["String"]["input"]>;
  year: Scalars["Int"]["input"];
};

export type User = {
  __typename?: "User";
  _id: Scalars["ID"]["output"];
  bookmarkedClasses: Array<Class>;
  bookmarkedCourses: Array<Course>;
  email: Scalars["String"]["output"];
  majors: Array<Scalars["String"]["output"]>;
  minors: Array<Scalars["String"]["output"]>;
  monitoredClasses: Array<MonitoredClass>;
  name: Scalars["String"]["output"];
  notificationsOn: Scalars["Boolean"]["output"];
  staff: Scalars["Boolean"]["output"];
  student: Scalars["Boolean"]["output"];
};

/** User activity data point for analytics (tracks login activity) */
export type UserActivityDataPoint = {
  __typename?: "UserActivityDataPoint";
  /** Timestamp when the user was created */
  createdAt: Scalars["String"]["output"];
  /** Timestamp when the user was last seen (logged in) */
  lastSeenAt: Scalars["String"]["output"];
};

export type UserClass = {
  __typename?: "UserClass";
  classNumber: Scalars["String"]["output"];
  courseNumber: Scalars["String"]["output"];
  helpfulCount?: Maybe<Scalars["Int"]["output"]>;
  lastUpdated?: Maybe<Scalars["String"]["output"]>;
  metrics: Array<UserMetric>;
  professorName?: Maybe<Scalars["String"]["output"]>;
  reviewContent?: Maybe<Scalars["String"]["output"]>;
  reviewId?: Maybe<Scalars["String"]["output"]>;
  reviewTitle?: Maybe<Scalars["String"]["output"]>;
  reviewerGrade?: Maybe<Scalars["String"]["output"]>;
  semester: Semester;
  subject: Scalars["String"]["output"];
  /** Class Identifiers */
  year: Scalars["Int"]["output"];
};

/** Minimal user data point for analytics */
export type UserCreationDataPoint = {
  __typename?: "UserCreationDataPoint";
  /** Timestamp when the user was created */
  createdAt: Scalars["String"]["output"];
};

export type UserMetric = {
  __typename?: "UserMetric";
  metricName: MetricName;
  value: Scalars["Int"]["output"];
};

/** Ratings by user */
export type UserRatings = {
  __typename?: "UserRatings";
  classes: Array<UserClass>;
  count: Scalars["Int"]["output"];
  createdBy: Scalars["String"]["output"];
};

/** A user account for search results. */
export type UserSearchResult = {
  __typename?: "UserSearchResult";
  _id: Scalars["ID"]["output"];
  email: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type UserStats = {
  __typename?: "UserStats";
  createdLastMonth: Scalars["Int"]["output"];
  createdLastWeek: Scalars["Int"]["output"];
  totalCount: Scalars["Int"]["output"];
};

export type GetAllBannersQueryVariables = Exact<{ [key: string]: never }>;

export type GetAllBannersQuery = {
  __typename?: "Query";
  allBanners: Array<{
    __typename?: "Banner";
    id: string;
    text: string;
    link?: string | null;
    linkText?: string | null;
    persistent: boolean;
    reappearing: boolean;
    clickCount: number;
    dismissCount: number;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type IncrementBannerClickMutationVariables = Exact<{
  bannerId: Scalars["ID"]["input"];
}>;

export type IncrementBannerClickMutation = {
  __typename?: "Mutation";
  incrementBannerClick: {
    __typename?: "Banner";
    id: string;
    clickCount: number;
  };
};

export type IncrementBannerDismissMutationVariables = Exact<{
  bannerId: Scalars["ID"]["input"];
}>;

export type IncrementBannerDismissMutation = {
  __typename?: "Mutation";
  incrementBannerDismiss: {
    __typename?: "Banner";
    id: string;
    dismissCount: number;
  };
};

export type TrackBannerViewMutationVariables = Exact<{
  bannerId: Scalars["ID"]["input"];
}>;

export type TrackBannerViewMutation = {
  __typename?: "Mutation";
  trackBannerView: boolean;
};

export type GetCatalogSearchQueryVariables = Exact<{
  year: Scalars["Int"]["input"];
  semester: Semester;
  search?: InputMaybe<Scalars["String"]["input"]>;
  filters?: InputMaybe<CatalogFilters>;
  sortBy?: InputMaybe<CatalogSortBy>;
  sortOrder?: InputMaybe<SortOrder>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  pageSize?: InputMaybe<Scalars["Int"]["input"]>;
  semanticSearch?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type GetCatalogSearchQuery = {
  __typename?: "Query";
  catalogSearch: {
    __typename?: "CatalogResult";
    totalCount: number;
    results: Array<{
      __typename?: "CatalogClass";
      year: number;
      semester: string;
      sessionId: string;
      subject: string;
      courseNumber: string;
      number: string;
      title?: string | null;
      unitsMin: number;
      unitsMax: number;
      courseTitle?: string | null;
      allTimeAverageGrade?: number | null;
      allTimePassCount?: number | null;
      allTimeNoPassCount?: number | null;
      enrolledCount?: number | null;
      maxEnroll?: number | null;
      activeReservedMaxCount?: number | null;
      aggregatedRatings?: {
        __typename?: "CatalogAggregatedRatings";
        metrics: Array<{
          __typename?: "CatalogMetric";
          metricName: string;
          count: number;
          weightedAverage: number;
        }>;
      } | null;
      decal?: { __typename?: "CatalogDeCal"; title?: string | null } | null;
      meetings?: Array<{
        __typename?: "CatalogMeeting";
        days?: Array<boolean> | null;
        startTime?: string | null;
        endTime?: string | null;
      }> | null;
    }>;
  };
};

export type GetCatalogClassIdentitiesQueryVariables = Exact<{
  year: Scalars["Int"]["input"];
  semester: Semester;
}>;

export type GetCatalogClassIdentitiesQuery = {
  __typename?: "Query";
  catalogClassIdentities: Array<{
    __typename?: "CatalogClassIdentity";
    subject: string;
    courseNumber: string;
    number: string;
    sessionId: string;
  }>;
};

export type GetCatalogFilterOptionsQueryVariables = Exact<{
  year: Scalars["Int"]["input"];
  semester: Semester;
}>;

export type GetCatalogFilterOptionsQuery = {
  __typename?: "Query";
  catalogFilterOptions: {
    __typename?: "CatalogFilterOptions";
    levels: Array<string>;
    gradingOptions: Array<string>;
    breadthRequirements: Array<string>;
    universityRequirements: Array<string>;
    timeRange?: {
      __typename?: "CatalogTimeRange";
      minStartTime: string;
      maxEndTime: string;
    } | null;
  };
};

export type GetClassQueryVariables = Exact<{
  year: Scalars["Int"]["input"];
  semester: Semester;
  sessionId: Scalars["SessionIdentifier"]["input"];
  subject: Scalars["String"]["input"];
  courseNumber: Scalars["CourseNumber"]["input"];
  number: Scalars["ClassNumber"]["input"];
}>;

export type GetClassQuery = {
  __typename?: "Query";
  class?: {
    __typename?: "Class";
    year: number;
    semester: Semester;
    subject: string;
    sessionId: any;
    courseNumber: any;
    number: any;
    title?: string | null;
    description?: string | null;
    unitsMax: number;
    unitsMin: number;
    gradingBasis: ClassGradingBasis;
    finalExam: ClassFinalExam;
    decal?: {
      __typename?: "DeCal";
      title?: string | null;
      syllabus?: string | null;
      description?: string | null;
      syllabusUrl?: string | null;
      applicationUrl?: string | null;
      applicationDueDate?: string | null;
      instructors: Array<{
        __typename?: "DeCalInstructor";
        name: string;
        email: string;
      }>;
    } | null;
    gradeDistribution: {
      __typename?: "GradeDistribution";
      average?: number | null;
      pnpPercentage?: number | null;
      distribution?: Array<{
        __typename?: "Grade";
        letter: string;
        count: number;
      }> | null;
    };
    course: {
      __typename?: "Course";
      title: string;
      description: string;
      academicCareer: AcademicCareer;
      requirements?: string | null;
      aggregatedRatings: {
        __typename?: "AggregatedRatings";
        metrics: Array<{
          __typename?: "Metric";
          count: number;
          metricName: MetricName;
          weightedAverage: number;
          categories: Array<{
            __typename?: "Category";
            count: number;
            value: number;
          }>;
        }>;
      };
      gradeDistribution: {
        __typename?: "GradeDistribution";
        average?: number | null;
        pnpPercentage?: number | null;
        distribution?: Array<{
          __typename?: "Grade";
          letter: string;
          count: number;
        }> | null;
      };
      requiredCourses: Array<{
        __typename?: "Course";
        subject: string;
        number: any;
      }>;
      classes: Array<{
        __typename?: "Class";
        semester: Semester;
        year: number;
        number: any;
        anyPrintInScheduleOfClasses?: boolean | null;
        primarySection?: {
          __typename?: "Section";
          startDate: string;
          meetings: Array<{
            __typename?: "Meeting";
            instructors: Array<{
              __typename?: "Instructor";
              familyName: string;
              givenName: string;
            }>;
          }>;
        } | null;
      }>;
    };
    primarySection?: {
      __typename?: "Section";
      number: any;
      sectionId: any;
      component: Component;
      online: boolean;
      attendanceRequired?: boolean | null;
      lecturesRecorded?: boolean | null;
      startDate: string;
      endDate: string;
      sectionAttributes?: Array<{
        __typename?: "SectionAttribute";
        attribute: {
          __typename?: "SectionAttributeInfo";
          code?: string | null;
          description?: string | null;
          formalDescription?: string | null;
        };
        value: {
          __typename?: "SectionAttributeInfo";
          code?: string | null;
          description?: string | null;
          formalDescription?: string | null;
        };
      }> | null;
      enrollment?: {
        __typename?: "Enrollment";
        history: Array<{
          __typename?: "EnrollmentSingular";
          startTime: string;
          endTime: string;
          granularitySeconds: number;
          status?: EnrollmentStatus | null;
          enrolledCount: number;
          maxEnroll: number;
          waitlistedCount: number;
          maxWaitlist: number;
        }>;
        latest?: {
          __typename?: "EnrollmentSingular";
          startTime: string;
          endTime: string;
          granularitySeconds: number;
          status?: EnrollmentStatus | null;
          enrolledCount: number;
          maxEnroll: number;
          waitlistedCount: number;
          maxWaitlist: number;
          activeReservedMaxCount: number;
          seatReservationCount?: Array<{
            __typename?: "SeatReservationCounts";
            enrolledCount: number;
            maxEnroll: number;
            isValid: boolean;
            requirementGroup: {
              __typename?: "RequirementGroupDescriptor";
              description: string;
            };
          }> | null;
        } | null;
      } | null;
      meetings: Array<{
        __typename?: "Meeting";
        days?: Array<boolean> | null;
        location?: string | null;
        endTime?: string | null;
        startTime?: string | null;
        instructors: Array<{
          __typename?: "Instructor";
          familyName: string;
          givenName: string;
        }>;
      }>;
      exams: Array<{
        __typename?: "Exam";
        date: string;
        type: ExamType;
        location?: string | null;
        startTime: string;
        endTime: string;
      }>;
    } | null;
    sections: Array<{
      __typename?: "Section";
      number: any;
      sectionId: any;
      component: Component;
      online: boolean;
      attendanceRequired?: boolean | null;
      lecturesRecorded?: boolean | null;
      startDate: string;
      endDate: string;
      sectionAttributes?: Array<{
        __typename?: "SectionAttribute";
        attribute: {
          __typename?: "SectionAttributeInfo";
          code?: string | null;
          description?: string | null;
          formalDescription?: string | null;
        };
        value: {
          __typename?: "SectionAttributeInfo";
          code?: string | null;
          description?: string | null;
          formalDescription?: string | null;
        };
      }> | null;
      enrollment?: {
        __typename?: "Enrollment";
        latest?: {
          __typename?: "EnrollmentSingular";
          startTime: string;
          endTime: string;
          granularitySeconds: number;
          status?: EnrollmentStatus | null;
          enrolledCount: number;
          maxEnroll: number;
          waitlistedCount: number;
          maxWaitlist: number;
          activeReservedMaxCount: number;
        } | null;
      } | null;
      meetings: Array<{
        __typename?: "Meeting";
        days?: Array<boolean> | null;
        location?: string | null;
        endTime?: string | null;
        startTime?: string | null;
        instructors: Array<{
          __typename?: "Instructor";
          familyName: string;
          givenName: string;
        }>;
      }>;
      exams: Array<{
        __typename?: "Exam";
        date: string;
        type: ExamType;
        location?: string | null;
        startTime: string;
        endTime: string;
      }>;
    }>;
  } | null;
};

export type GetClassDetailsQueryVariables = Exact<{
  year: Scalars["Int"]["input"];
  semester: Semester;
  sessionId: Scalars["SessionIdentifier"]["input"];
  subject: Scalars["String"]["input"];
  courseNumber: Scalars["CourseNumber"]["input"];
  number: Scalars["ClassNumber"]["input"];
}>;

export type GetClassDetailsQuery = {
  __typename?: "Query";
  class?: {
    __typename?: "Class";
    year: number;
    semester: Semester;
    subject: string;
    sessionId: any;
    courseNumber: any;
    courseId: string;
    number: any;
    unitsMax: number;
    unitsMin: number;
    finalExam: ClassFinalExam;
    decal?: {
      __typename?: "DeCal";
      title?: string | null;
      syllabus?: string | null;
      description?: string | null;
      syllabusUrl?: string | null;
      applicationUrl?: string | null;
      applicationDueDate?: string | null;
      instructors: Array<{
        __typename?: "DeCalInstructor";
        name: string;
        email: string;
      }>;
    } | null;
    course: {
      __typename?: "Course";
      title: string;
      description: string;
      requirements?: string | null;
      aggregatedRatings: {
        __typename?: "AggregatedRatings";
        metrics: Array<{
          __typename?: "Metric";
          metricName: MetricName;
          count: number;
          weightedAverage: number;
          categories: Array<{
            __typename?: "Category";
            value: number;
            count: number;
          }>;
        }>;
      };
      gradeDistribution: {
        __typename?: "GradeDistribution";
        average?: number | null;
        pnpPercentage?: number | null;
      };
    };
    primarySection?: {
      __typename?: "Section";
      sectionId: any;
      component: Component;
      sectionAttributes?: Array<{
        __typename?: "SectionAttribute";
        attribute: {
          __typename?: "SectionAttributeInfo";
          code?: string | null;
          formalDescription?: string | null;
        };
        value: {
          __typename?: "SectionAttributeInfo";
          description?: string | null;
          formalDescription?: string | null;
        };
      }> | null;
      exams: Array<{
        __typename?: "Exam";
        date: string;
        startTime: string;
        endTime: string;
        location?: string | null;
        type: ExamType;
      }>;
      enrollment?: {
        __typename?: "Enrollment";
        latest?: {
          __typename?: "EnrollmentSingular";
          endTime: string;
          enrolledCount: number;
          maxEnroll: number;
          waitlistedCount: number;
          maxWaitlist: number;
          activeReservedMaxCount: number;
          seatReservationCount?: Array<{
            __typename?: "SeatReservationCounts";
            enrolledCount: number;
            maxEnroll: number;
            isValid: boolean;
            requirementGroup: {
              __typename?: "RequirementGroupDescriptor";
              description: string;
            };
          }> | null;
        } | null;
      } | null;
      meetings: Array<{
        __typename?: "Meeting";
        days?: Array<boolean> | null;
        location?: string | null;
        endTime?: string | null;
        startTime?: string | null;
        instructors: Array<{
          __typename?: "Instructor";
          familyName: string;
          givenName: string;
        }>;
      }>;
    } | null;
  } | null;
};

export type GetClassSectionsQueryVariables = Exact<{
  year: Scalars["Int"]["input"];
  semester: Semester;
  sessionId: Scalars["SessionIdentifier"]["input"];
  subject: Scalars["String"]["input"];
  courseNumber: Scalars["CourseNumber"]["input"];
  number: Scalars["ClassNumber"]["input"];
}>;

export type GetClassSectionsQuery = {
  __typename?: "Query";
  class?: {
    __typename?: "Class";
    sections: Array<{
      __typename?: "Section";
      sectionId: any;
      number: any;
      component: Component;
      meetings: Array<{
        __typename?: "Meeting";
        days?: Array<boolean> | null;
        location?: string | null;
        endTime?: string | null;
        startTime?: string | null;
        instructors: Array<{
          __typename?: "Instructor";
          familyName: string;
          givenName: string;
        }>;
      }>;
      enrollment?: {
        __typename?: "Enrollment";
        latest?: {
          __typename?: "EnrollmentSingular";
          enrolledCount: number;
          maxEnroll: number;
          waitlistedCount: number;
          maxWaitlist: number;
        } | null;
      } | null;
    }>;
  } | null;
};

export type GetClassGradesQueryVariables = Exact<{
  year: Scalars["Int"]["input"];
  semester: Semester;
  sessionId: Scalars["SessionIdentifier"]["input"];
  subject: Scalars["String"]["input"];
  courseNumber: Scalars["CourseNumber"]["input"];
  number: Scalars["ClassNumber"]["input"];
}>;

export type GetClassGradesQuery = {
  __typename?: "Query";
  class?: {
    __typename?: "Class";
    course: {
      __typename?: "Course";
      gradeDistribution: {
        __typename?: "GradeDistribution";
        average?: number | null;
        distribution?: Array<{
          __typename?: "Grade";
          letter: string;
          count: number;
        }> | null;
      };
    };
  } | null;
};

export type GetClassEnrollmentQueryVariables = Exact<{
  year: Scalars["Int"]["input"];
  semester: Semester;
  sessionId: Scalars["SessionIdentifier"]["input"];
  subject: Scalars["String"]["input"];
  courseNumber: Scalars["CourseNumber"]["input"];
  number: Scalars["ClassNumber"]["input"];
}>;

export type GetClassEnrollmentQuery = {
  __typename?: "Query";
  class?: {
    __typename?: "Class";
    primarySection?: {
      __typename?: "Section";
      enrollment?: {
        __typename?: "Enrollment";
        history: Array<{
          __typename?: "EnrollmentSingular";
          startTime: string;
          endTime: string;
          granularitySeconds: number;
          enrolledCount: number;
          maxEnroll: number;
          waitlistedCount: number;
          maxWaitlist: number;
        }>;
      } | null;
    } | null;
  } | null;
};

export type TrackClassViewMutationVariables = Exact<{
  year: Scalars["Int"]["input"];
  semester: Semester;
  sessionId?: InputMaybe<Scalars["SessionIdentifier"]["input"]>;
  subject: Scalars["String"]["input"];
  courseNumber: Scalars["CourseNumber"]["input"];
  number: Scalars["ClassNumber"]["input"];
}>;

export type TrackClassViewMutation = {
  __typename?: "Mutation";
  trackClassView: boolean;
};

export type GetCollectionByIdQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetCollectionByIdQuery = {
  __typename?: "Query";
  myCollectionById?: {
    __typename?: "Collection";
    name: string;
    classes: Array<{
      __typename?: "CollectionClass";
      error?: string | null;
      class?: {
        __typename?: "Class";
        subject: string;
        courseNumber: any;
        number: any;
        sessionId: any;
        title?: string | null;
        year: number;
        semester: Semester;
        unitsMin: number;
        unitsMax: number;
        course: {
          __typename?: "Course";
          title: string;
          gradeDistribution: {
            __typename?: "GradeDistribution";
            average?: number | null;
          };
        };
        gradeDistribution: {
          __typename?: "GradeDistribution";
          average?: number | null;
        };
        primarySection?: {
          __typename?: "Section";
          enrollment?: {
            __typename?: "Enrollment";
            latest?: {
              __typename?: "EnrollmentSingular";
              enrolledCount: number;
              maxEnroll: number;
              endTime: string;
              activeReservedMaxCount: number;
            } | null;
          } | null;
        } | null;
      } | null;
    }>;
  } | null;
};

export type GetAllCollectionsQueryVariables = Exact<{ [key: string]: never }>;

export type GetAllCollectionsQuery = {
  __typename?: "Query";
  myCollections: Array<{
    __typename?: "Collection";
    _id: string;
    name: string;
    color?: CollectionColor | null;
    pinnedAt?: string | null;
    isSystem: boolean;
    lastAdd: string;
    classes: Array<{
      __typename?: "CollectionClass";
      class?: {
        __typename?: "Class";
        subject: string;
        courseNumber: any;
        number: any;
      } | null;
    }>;
  }>;
};

export type GetAllCollectionsWithPreviewQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetAllCollectionsWithPreviewQuery = {
  __typename?: "Query";
  myCollections: Array<{
    __typename?: "Collection";
    _id: string;
    name: string;
    color?: CollectionColor | null;
    pinnedAt?: string | null;
    isSystem: boolean;
    lastAdd: string;
    classes: Array<{
      __typename?: "CollectionClass";
      addedAt?: string | null;
      class?: {
        __typename?: "Class";
        subject: string;
        courseNumber: any;
        number: any;
        title?: string | null;
        unitsMin: number;
        unitsMax: number;
        course: {
          __typename?: "Course";
          title: string;
          gradeDistribution: {
            __typename?: "GradeDistribution";
            average?: number | null;
          };
        };
        gradeDistribution: {
          __typename?: "GradeDistribution";
          average?: number | null;
        };
        primarySection?: {
          __typename?: "Section";
          enrollment?: {
            __typename?: "Enrollment";
            latest?: {
              __typename?: "EnrollmentSingular";
              enrolledCount: number;
              maxEnroll: number;
              activeReservedMaxCount: number;
            } | null;
          } | null;
        } | null;
      } | null;
    }>;
  }>;
};

export type AddClassToCollectionMutationVariables = Exact<{
  input: AddClassInput;
}>;

export type AddClassToCollectionMutation = {
  __typename?: "Mutation";
  addClassToCollection: {
    __typename?: "Collection";
    _id: string;
    name: string;
    color?: CollectionColor | null;
    pinnedAt?: string | null;
    isSystem: boolean;
    lastAdd: string;
    classes: Array<{
      __typename?: "CollectionClass";
      class?: {
        __typename?: "Class";
        subject: string;
        courseNumber: any;
        number: any;
      } | null;
    }>;
  };
};

export type RemoveClassFromCollectionMutationVariables = Exact<{
  input: RemoveClassInput;
}>;

export type RemoveClassFromCollectionMutation = {
  __typename?: "Mutation";
  removeClassFromCollection: {
    __typename?: "Collection";
    _id: string;
    name: string;
    color?: CollectionColor | null;
    pinnedAt?: string | null;
    isSystem: boolean;
    lastAdd: string;
    classes: Array<{
      __typename?: "CollectionClass";
      class?: {
        __typename?: "Class";
        subject: string;
        courseNumber: any;
        number: any;
      } | null;
    }>;
  };
};

export type CreateCollectionMutationVariables = Exact<{
  input: CreateCollectionInput;
}>;

export type CreateCollectionMutation = {
  __typename?: "Mutation";
  createCollection: {
    __typename?: "Collection";
    _id: string;
    name: string;
    color?: CollectionColor | null;
    pinnedAt?: string | null;
    isSystem: boolean;
    lastAdd: string;
    classes: Array<{
      __typename?: "CollectionClass";
      class?: {
        __typename?: "Class";
        subject: string;
        courseNumber: any;
        number: any;
      } | null;
    }>;
  };
};

export type UpdateCollectionMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateCollectionInput;
}>;

export type UpdateCollectionMutation = {
  __typename?: "Mutation";
  updateCollection: {
    __typename?: "Collection";
    _id: string;
    name: string;
    color?: CollectionColor | null;
    pinnedAt?: string | null;
    isSystem: boolean;
    lastAdd: string;
  };
};

export type DeleteCollectionMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteCollectionMutation = {
  __typename?: "Mutation";
  deleteCollection: boolean;
};

export type GetCourseTitleQueryVariables = Exact<{
  subject: Scalars["String"]["input"];
  number: Scalars["CourseNumber"]["input"];
}>;

export type GetCourseTitleQuery = {
  __typename?: "Query";
  course?: {
    __typename?: "Course";
    courseId: any;
    subject: string;
    number: any;
    title: string;
    aggregatedRatings: {
      __typename?: "AggregatedRatings";
      metrics: Array<{
        __typename?: "Metric";
        metricName: MetricName;
        count: number;
        weightedAverage: number;
      }>;
    };
  } | null;
};

export type GetCourseUnitsQueryVariables = Exact<{
  subject: Scalars["String"]["input"];
  number: Scalars["CourseNumber"]["input"];
}>;

export type GetCourseUnitsQuery = {
  __typename?: "Query";
  course?: {
    __typename?: "Course";
    courseId: any;
    subject: string;
    number: any;
    classes: Array<{
      __typename?: "Class";
      unitsMax: number;
      semester: Semester;
      year: number;
    }>;
  } | null;
};

export type GetCourseQueryVariables = Exact<{
  subject: Scalars["String"]["input"];
  number: Scalars["CourseNumber"]["input"];
}>;

export type GetCourseQuery = {
  __typename?: "Query";
  course?: {
    __typename?: "Course";
    courseId: any;
    subject: string;
    number: any;
    title: string;
    description: string;
    academicCareer: AcademicCareer;
    gradingBasis: CourseGradingBasis;
    finalExam?: CourseFinalExam | null;
    requirements?: string | null;
    gradeDistribution: {
      __typename?: "GradeDistribution";
      average?: number | null;
      distribution?: Array<{
        __typename?: "Grade";
        letter: string;
        count: number;
      }> | null;
    };
    requiredCourses: Array<{
      __typename?: "Course";
      subject: string;
      number: any;
    }>;
    classes: Array<{
      __typename?: "Class";
      year: number;
      semester: Semester;
      number: any;
    }>;
    aggregatedRatings: {
      __typename?: "AggregatedRatings";
      metrics: Array<{
        __typename?: "Metric";
        metricName: MetricName;
        count: number;
        weightedAverage: number;
        categories: Array<{
          __typename?: "Category";
          value: number;
          count: number;
        }>;
      }>;
    };
  } | null;
};

export type GetClassOverviewQueryVariables = Exact<{
  subject: Scalars["String"]["input"];
  number: Scalars["CourseNumber"]["input"];
}>;

export type GetClassOverviewQuery = {
  __typename?: "Query";
  course?: {
    __typename?: "Course";
    title: string;
    description: string;
    requirements?: string | null;
    aggregatedRatings: {
      __typename?: "AggregatedRatings";
      metrics: Array<{
        __typename?: "Metric";
        metricName: MetricName;
        count: number;
        weightedAverage: number;
        categories: Array<{
          __typename?: "Category";
          value: number;
          count: number;
        }>;
      }>;
    };
    gradeDistribution: {
      __typename?: "GradeDistribution";
      average?: number | null;
      pnpPercentage?: number | null;
    };
  } | null;
};

export type GetCourseOverviewByIdQueryVariables = Exact<{
  courseId: Scalars["CourseIdentifier"]["input"];
}>;

export type GetCourseOverviewByIdQuery = {
  __typename?: "Query";
  courseById?: {
    __typename?: "Course";
    title: string;
    description: string;
    requirements?: string | null;
    aggregatedRatings: {
      __typename?: "AggregatedRatings";
      metrics: Array<{
        __typename?: "Metric";
        metricName: MetricName;
        count: number;
        weightedAverage: number;
        categories: Array<{
          __typename?: "Category";
          value: number;
          count: number;
        }>;
      }>;
    };
    gradeDistribution: {
      __typename?: "GradeDistribution";
      average?: number | null;
      pnpPercentage?: number | null;
    };
  } | null;
};

export type GetCourseGradeDistQueryVariables = Exact<{
  subject: Scalars["String"]["input"];
  number: Scalars["CourseNumber"]["input"];
}>;

export type GetCourseGradeDistQuery = {
  __typename?: "Query";
  course?: {
    __typename?: "Course";
    courseId: any;
    subject: string;
    number: any;
    gradeDistribution: {
      __typename?: "GradeDistribution";
      average?: number | null;
      distribution?: Array<{
        __typename?: "Grade";
        letter: string;
        count: number;
      }> | null;
    };
  } | null;
};

export type GetCourseWithInstructorQueryVariables = Exact<{
  subject: Scalars["String"]["input"];
  number: Scalars["CourseNumber"]["input"];
}>;

export type GetCourseWithInstructorQuery = {
  __typename?: "Query";
  course?: {
    __typename?: "Course";
    classes: Array<{
      __typename?: "Class";
      year: number;
      semester: Semester;
      number: any;
      sessionId: any;
      anyPrintInScheduleOfClasses?: boolean | null;
      term: { __typename?: "Term"; temporalPosition: TemporalPosition };
      primarySection?: {
        __typename?: "Section";
        startDate: string;
        number: any;
        enrollment?: {
          __typename?: "Enrollment";
          latest?: {
            __typename?: "EnrollmentSingular";
            enrolledCount: number;
          } | null;
        } | null;
        meetings: Array<{
          __typename?: "Meeting";
          instructors: Array<{
            __typename?: "Instructor";
            familyName: string;
            givenName: string;
          }>;
        }>;
      } | null;
      gradeDistribution: {
        __typename?: "GradeDistribution";
        average?: number | null;
      };
    }>;
  } | null;
};

export type GetAllClassesForCourseQueryVariables = Exact<{
  subject: Scalars["String"]["input"];
  number: Scalars["CourseNumber"]["input"];
}>;

export type GetAllClassesForCourseQuery = {
  __typename?: "Query";
  course?: {
    __typename?: "Course";
    classes: Array<{
      __typename?: "Class";
      semester: Semester;
      year: number;
      number: any;
      anyPrintInScheduleOfClasses?: boolean | null;
      primarySection?: {
        __typename?: "Section";
        startDate: string;
        meetings: Array<{
          __typename?: "Meeting";
          instructors: Array<{
            __typename?: "Instructor";
            familyName: string;
            givenName: string;
          }>;
        }>;
      } | null;
    }>;
  } | null;
};

export type GetCourseNamesQueryVariables = Exact<{ [key: string]: never }>;

export type GetCourseNamesQuery = {
  __typename?: "Query";
  courses: Array<{
    __typename?: "Course";
    courseId: any;
    subject: string;
    departmentNicknames?: string | null;
    number: any;
    title: string;
  }>;
};

export type GetCoursesQueryVariables = Exact<{ [key: string]: never }>;

export type GetCoursesQuery = {
  __typename?: "Query";
  courses: Array<{
    __typename?: "Course";
    courseId: any;
    subject: string;
    number: any;
    title: string;
    academicCareer: AcademicCareer;
    finalExam?: CourseFinalExam | null;
    gradingBasis: CourseGradingBasis;
    typicallyOffered?: Array<string> | null;
    primaryInstructionMethod: InstructionMethod;
    gradeDistribution: {
      __typename?: "GradeDistribution";
      average?: number | null;
      distribution?: Array<{
        __typename?: "Grade";
        letter: string;
        count: number;
      }> | null;
    };
  }>;
};

export type GetCuratedClassQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetCuratedClassQuery = {
  __typename?: "Query";
  curatedClass?: {
    __typename?: "CuratedClass";
    _id: string;
    text: string;
    image: string;
    subject: string;
    courseNumber: any;
    number: any;
    semester: Semester;
    year: number;
    sessionId: any;
    publishedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    class: {
      __typename?: "Class";
      number: any;
      sessionId: any;
      title?: string | null;
      unitsMax: number;
      unitsMin: number;
      finalExam: ClassFinalExam;
      gradingBasis: ClassGradingBasis;
      primarySection?: {
        __typename?: "Section";
        component: Component;
        online: boolean;
        instructionMode: string;
        attendanceRequired?: boolean | null;
        lecturesRecorded?: boolean | null;
        enrollment?: {
          __typename?: "Enrollment";
          latest?: {
            __typename?: "EnrollmentSingular";
            status?: EnrollmentStatus | null;
            enrolledCount: number;
            maxEnroll: number;
            waitlistedCount: number;
            maxWaitlist: number;
          } | null;
        } | null;
        meetings: Array<{
          __typename?: "Meeting";
          days?: Array<boolean> | null;
        }>;
      } | null;
      course: {
        __typename?: "Course";
        subject: string;
        number: any;
        title: string;
        academicCareer: AcademicCareer;
        gradeDistribution: {
          __typename?: "GradeDistribution";
          average?: number | null;
        };
      };
    };
  } | null;
};

export type CreateCuratedClassMutationVariables = Exact<{
  curatedClass: CreateCuratedClassInput;
}>;

export type CreateCuratedClassMutation = {
  __typename?: "Mutation";
  createCuratedClass?: {
    __typename?: "CuratedClass";
    _id: string;
    text: string;
    image: string;
    subject: string;
    courseNumber: any;
    number: any;
    semester: Semester;
    year: number;
    sessionId: any;
    publishedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    class: {
      __typename?: "Class";
      number: any;
      sessionId: any;
      title?: string | null;
      unitsMax: number;
      unitsMin: number;
      finalExam: ClassFinalExam;
      gradingBasis: ClassGradingBasis;
      primarySection?: {
        __typename?: "Section";
        component: Component;
        online: boolean;
        instructionMode: string;
        attendanceRequired?: boolean | null;
        lecturesRecorded?: boolean | null;
        enrollment?: {
          __typename?: "Enrollment";
          latest?: {
            __typename?: "EnrollmentSingular";
            status?: EnrollmentStatus | null;
            enrolledCount: number;
            maxEnroll: number;
            waitlistedCount: number;
            maxWaitlist: number;
          } | null;
        } | null;
        meetings: Array<{
          __typename?: "Meeting";
          days?: Array<boolean> | null;
        }>;
      } | null;
      course: {
        __typename?: "Course";
        subject: string;
        number: any;
        title: string;
        academicCareer: AcademicCareer;
        gradeDistribution: {
          __typename?: "GradeDistribution";
          average?: number | null;
        };
      };
    };
  } | null;
};

export type UpdateCuratedClassMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  curatedClass: UpdateCuratedClassInput;
}>;

export type UpdateCuratedClassMutation = {
  __typename?: "Mutation";
  updateCuratedClass?: {
    __typename?: "CuratedClass";
    _id: string;
    text: string;
    image: string;
    subject: string;
    courseNumber: any;
    number: any;
    semester: Semester;
    year: number;
    sessionId: any;
    publishedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    class: {
      __typename?: "Class";
      number: any;
      sessionId: any;
      title?: string | null;
      unitsMax: number;
      unitsMin: number;
      finalExam: ClassFinalExam;
      gradingBasis: ClassGradingBasis;
      primarySection?: {
        __typename?: "Section";
        component: Component;
        online: boolean;
        instructionMode: string;
        attendanceRequired?: boolean | null;
        lecturesRecorded?: boolean | null;
        enrollment?: {
          __typename?: "Enrollment";
          latest?: {
            __typename?: "EnrollmentSingular";
            status?: EnrollmentStatus | null;
            enrolledCount: number;
            maxEnroll: number;
            waitlistedCount: number;
            maxWaitlist: number;
          } | null;
        } | null;
        meetings: Array<{
          __typename?: "Meeting";
          days?: Array<boolean> | null;
        }>;
      } | null;
      course: {
        __typename?: "Course";
        subject: string;
        number: any;
        title: string;
        academicCareer: AcademicCareer;
        gradeDistribution: {
          __typename?: "GradeDistribution";
          average?: number | null;
        };
      };
    };
  } | null;
};

export type DeleteCuratedClassMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteCuratedClassMutation = {
  __typename?: "Mutation";
  deleteCuratedClass: string;
};

export type GetCuratedClassesQueryVariables = Exact<{ [key: string]: never }>;

export type GetCuratedClassesQuery = {
  __typename?: "Query";
  curatedClasses: Array<{
    __typename?: "CuratedClass";
    _id: string;
    text: string;
    image: string;
    subject: string;
    courseNumber: any;
    number: any;
    semester: Semester;
    year: number;
    sessionId: any;
    publishedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    class: {
      __typename?: "Class";
      number: any;
      sessionId: any;
      title?: string | null;
      unitsMax: number;
      unitsMin: number;
      finalExam: ClassFinalExam;
      gradingBasis: ClassGradingBasis;
      primarySection?: {
        __typename?: "Section";
        component: Component;
        online: boolean;
        instructionMode: string;
        attendanceRequired?: boolean | null;
        lecturesRecorded?: boolean | null;
        enrollment?: {
          __typename?: "Enrollment";
          latest?: {
            __typename?: "EnrollmentSingular";
            status?: EnrollmentStatus | null;
            enrolledCount: number;
            maxEnroll: number;
            waitlistedCount: number;
            maxWaitlist: number;
            activeReservedMaxCount: number;
            endTime: string;
          } | null;
        } | null;
        meetings: Array<{
          __typename?: "Meeting";
          days?: Array<boolean> | null;
        }>;
      } | null;
      course: {
        __typename?: "Course";
        subject: string;
        number: any;
        title: string;
        academicCareer: AcademicCareer;
        gradeDistribution: {
          __typename?: "GradeDistribution";
          average?: number | null;
        };
      };
    };
  }>;
};

export type GetEnrollmentQueryVariables = Exact<{
  year: Scalars["Int"]["input"];
  semester: Semester;
  sessionId?: InputMaybe<Scalars["SessionIdentifier"]["input"]>;
  subject: Scalars["String"]["input"];
  courseNumber: Scalars["CourseNumber"]["input"];
  sectionNumber: Scalars["SectionNumber"]["input"];
}>;

export type GetEnrollmentQuery = {
  __typename?: "Query";
  enrollment?: {
    __typename?: "Enrollment";
    year: number;
    semester: Semester;
    sessionId: any;
    sectionId: any;
    subject: string;
    courseNumber: any;
    sectionNumber: any;
    history: Array<{
      __typename?: "EnrollmentSingular";
      startTime: string;
      endTime: string;
      granularitySeconds: number;
      status?: EnrollmentStatus | null;
      enrolledCount: number;
      waitlistedCount: number;
      reservedCount: number;
      minEnroll?: number | null;
      maxEnroll: number;
      maxWaitlist: number;
      openReserved: number;
      activeReservedMaxCount: number;
      seatReservationCount?: Array<{
        __typename?: "SeatReservationCounts";
        maxEnroll: number;
        enrolledCount: number;
        isValid: boolean;
        requirementGroup: {
          __typename?: "RequirementGroupDescriptor";
          description: string;
        };
      }> | null;
    }>;
  } | null;
};

export type GetEnrollmentTimeframesQueryVariables = Exact<{
  year: Scalars["Int"]["input"];
  semester: Semester;
}>;

export type GetEnrollmentTimeframesQuery = {
  __typename?: "Query";
  enrollmentTimeframes: Array<{
    __typename?: "EnrollmentTimeframe";
    phase?: number | null;
    isAdjustment: boolean;
    group: string;
    startDate: string;
    endDate?: string | null;
    startEventSummary?: string | null;
  }>;
};

export type GetGradeDistributionQueryVariables = Exact<{
  year?: InputMaybe<Scalars["Int"]["input"]>;
  semester?: InputMaybe<Semester>;
  sessionId?: InputMaybe<Scalars["SessionIdentifier"]["input"]>;
  subject: Scalars["String"]["input"];
  courseId: Scalars["String"]["input"];
  classNumber?: InputMaybe<Scalars["ClassNumber"]["input"]>;
  familyName?: InputMaybe<Scalars["String"]["input"]>;
  givenName?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type GetGradeDistributionQuery = {
  __typename?: "Query";
  grade: {
    __typename?: "GradeDistribution";
    average?: number | null;
    pnpPercentage?: number | null;
    distribution?: Array<{
      __typename?: "Grade";
      letter: string;
      percentage: number;
      count: number;
    }> | null;
  };
};

export type CreateNewPlanMutationVariables = Exact<{
  colleges: Array<Colleges> | Colleges;
  startYear: Scalars["Int"]["input"];
  endYear: Scalars["Int"]["input"];
  majors: Array<Scalars["String"]["input"]> | Scalars["String"]["input"];
  minors: Array<Scalars["String"]["input"]> | Scalars["String"]["input"];
}>;

export type CreateNewPlanMutation = {
  __typename?: "Mutation";
  createNewPlan?: {
    __typename?: "Plan";
    _id: string;
    majors: Array<string>;
    minors: Array<string>;
    colleges: Array<Colleges>;
    planTerms: Array<{
      __typename?: "PlanTerm";
      _id: string;
      name: string;
      year: number;
      term: Terms;
      hidden: boolean;
      status: Status;
      pinned: boolean;
      courses: Array<{
        __typename?: "SelectedCourse";
        courseID: string;
        courseName: string;
        courseTitle: string;
        courseUnits: number;
        pnp: boolean;
        transfer: boolean;
        labels: Array<{ __typename?: "Label"; name: string; color: string }>;
      }>;
    }>;
    labels: Array<{ __typename?: "Label"; name: string; color: string }>;
  } | null;
};

export type GetPlanQueryVariables = Exact<{ [key: string]: never }>;

export type GetPlanQuery = {
  __typename?: "Query";
  planByUser: Array<{
    __typename?: "Plan";
    _id: string;
    majors: Array<string>;
    minors: Array<string>;
    colleges: Array<Colleges>;
    planTerms: Array<{
      __typename?: "PlanTerm";
      _id: string;
      name: string;
      year: number;
      term: Terms;
      hidden: boolean;
      status: Status;
      pinned: boolean;
      courses: Array<{
        __typename?: "SelectedCourse";
        courseID: string;
        courseName: string;
        courseTitle: string;
        courseUnits: number;
        pnp: boolean;
        transfer: boolean;
        labels: Array<{ __typename?: "Label"; name: string; color: string }>;
      }>;
    }>;
    labels: Array<{ __typename?: "Label"; name: string; color: string }>;
    selectedPlanRequirements: Array<{
      __typename?: "SelectedPlanRequirement";
      manualOverrides: Array<boolean | null>;
      planRequirement: {
        __typename?: "PlanRequirement";
        _id: string;
        name: string;
        code: string;
        isUcReq: boolean;
        college?: string | null;
        major?: string | null;
        minor?: string | null;
        isOfficial: boolean;
      };
    }>;
  }>;
};

export type GetPlansQueryVariables = Exact<{ [key: string]: never }>;

export type GetPlansQuery = {
  __typename?: "Query";
  planByUser: Array<{ __typename?: "Plan"; _id: string }>;
};

export type EditPlanMutationVariables = Exact<{
  plan: PlanInput;
}>;

export type EditPlanMutation = {
  __typename?: "Mutation";
  editPlan?: {
    __typename?: "Plan";
    _id: string;
    majors: Array<string>;
    minors: Array<string>;
    colleges: Array<Colleges>;
    labels: Array<{ __typename?: "Label"; name: string; color: string }>;
    selectedPlanRequirements: Array<{
      __typename?: "SelectedPlanRequirement";
      manualOverrides: Array<boolean | null>;
      planRequirement: {
        __typename?: "PlanRequirement";
        _id: string;
        name: string;
        code: string;
        isUcReq: boolean;
        college?: string | null;
        major?: string | null;
        minor?: string | null;
        isOfficial: boolean;
      };
    }>;
  } | null;
};

export type SetSelectedCoursesMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  courses: Array<SelectedCourseInput> | SelectedCourseInput;
}>;

export type SetSelectedCoursesMutation = {
  __typename?: "Mutation";
  setSelectedCourses?: { __typename?: "PlanTerm"; _id: string } | null;
};

export type CreateNewPlanTermMutationVariables = Exact<{
  planTerm: PlanTermInput;
}>;

export type CreateNewPlanTermMutation = {
  __typename?: "Mutation";
  createNewPlanTerm?: {
    __typename?: "PlanTerm";
    _id: string;
    name: string;
    userEmail: string;
    year: number;
    term: Terms;
    hidden: boolean;
    status: Status;
    pinned: boolean;
  } | null;
};

export type RemovePlanTermByIdMutationVariables = Exact<{
  removePlanTermByIdId: Scalars["ID"]["input"];
}>;

export type RemovePlanTermByIdMutation = {
  __typename?: "Mutation";
  removePlanTermByID?: string | null;
};

export type EditPlanTermMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  planTerm: EditPlanTermInput;
}>;

export type EditPlanTermMutation = {
  __typename?: "Mutation";
  editPlanTerm?: {
    __typename?: "PlanTerm";
    _id: string;
    name: string;
    userEmail: string;
    year: number;
    term: Terms;
    hidden: boolean;
    status: Status;
    pinned: boolean;
    courses: Array<{
      __typename?: "SelectedCourse";
      courseID: string;
      courseName: string;
      courseTitle: string;
      courseUnits: number;
      pnp: boolean;
      transfer: boolean;
      labels: Array<{ __typename?: "Label"; name: string; color: string }>;
    }>;
  } | null;
};

export type GetCourseRequirementsQueryVariables = Exact<{
  number: Scalars["CourseNumber"]["input"];
  subject: Scalars["String"]["input"];
}>;

export type GetCourseRequirementsQuery = {
  __typename?: "Query";
  course?: {
    __typename?: "Course";
    mostRecentClass?: {
      __typename?: "Class";
      requirementDesignation?: {
        __typename?: "SectionAttributeInfo";
        code?: string | null;
        description?: string | null;
        formalDescription?: string | null;
      } | null;
      primarySection?: {
        __typename?: "Section";
        sectionAttributes?: Array<{
          __typename?: "SectionAttribute";
          attribute: {
            __typename?: "SectionAttributeInfo";
            code?: string | null;
            description?: string | null;
            formalDescription?: string | null;
          };
          value: {
            __typename?: "SectionAttributeInfo";
            code?: string | null;
            description?: string | null;
            formalDescription?: string | null;
          };
        }> | null;
      } | null;
    } | null;
  } | null;
};

export type UpdateManualOverrideMutationVariables = Exact<{
  input: UpdateManualOverrideInput;
}>;

export type UpdateManualOverrideMutation = {
  __typename?: "Mutation";
  updateManualOverride?: {
    __typename?: "Plan";
    _id: string;
    selectedPlanRequirements: Array<{
      __typename?: "SelectedPlanRequirement";
      manualOverrides: Array<boolean | null>;
      planRequirement: { __typename?: "PlanRequirement"; _id: string };
    }>;
  } | null;
};

export type UpdateSelectedPlanRequirementsMutationVariables = Exact<{
  selectedPlanRequirements:
    | Array<SelectedPlanRequirementInput>
    | SelectedPlanRequirementInput;
}>;

export type UpdateSelectedPlanRequirementsMutation = {
  __typename?: "Mutation";
  updateSelectedPlanRequirements?: {
    __typename?: "Plan";
    _id: string;
    selectedPlanRequirements: Array<{
      __typename?: "SelectedPlanRequirement";
      manualOverrides: Array<boolean | null>;
      planRequirement: {
        __typename?: "PlanRequirement";
        _id: string;
        name: string;
        code: string;
        isUcReq: boolean;
        college?: string | null;
        major?: string | null;
        minor?: string | null;
        isOfficial: boolean;
      };
    }>;
  } | null;
};

export type GetAggregatedRatingsQueryVariables = Exact<{
  subject: Scalars["String"]["input"];
  courseNumber: Scalars["String"]["input"];
  semester: Semester;
  year: Scalars["Int"]["input"];
  classNumber?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type GetAggregatedRatingsQuery = {
  __typename?: "Query";
  aggregatedRatings: {
    __typename?: "AggregatedRatings";
    metrics: Array<{
      __typename?: "Metric";
      metricName: MetricName;
      count: number;
      weightedAverage: number;
      categories: Array<{
        __typename?: "Category";
        value: number;
        count: number;
      }>;
    }>;
  };
};

export type GetSemestersWithRatingsQueryVariables = Exact<{
  subject: Scalars["String"]["input"];
  courseNumber: Scalars["String"]["input"];
}>;

export type GetSemestersWithRatingsQuery = {
  __typename?: "Query";
  semestersWithRatings: Array<{
    __typename?: "SemesterRatings";
    semester: Semester;
    year: number;
    maxMetricCount: number;
  }>;
};

export type CreateRatingsMutationVariables = Exact<{
  subject: Scalars["String"]["input"];
  courseNumber: Scalars["String"]["input"];
  semester: Semester;
  year: Scalars["Int"]["input"];
  classNumber: Scalars["String"]["input"];
  metrics: Array<RatingMetricInput> | RatingMetricInput;
  reviewTitle?: InputMaybe<Scalars["String"]["input"]>;
  reviewContent?: InputMaybe<Scalars["String"]["input"]>;
  reviewerGrade?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type CreateRatingsMutation = {
  __typename?: "Mutation";
  createRatings: boolean;
};

export type DeleteRatingsMutationVariables = Exact<{
  subject: Scalars["String"]["input"];
  courseNumber: Scalars["String"]["input"];
}>;

export type DeleteRatingsMutation = {
  __typename?: "Mutation";
  deleteRatings: boolean;
};

export type GetUserRatingsQueryVariables = Exact<{ [key: string]: never }>;

export type GetUserRatingsQuery = {
  __typename?: "Query";
  userRatings: {
    __typename?: "UserRatings";
    classes: Array<{
      __typename?: "UserClass";
      subject: string;
      courseNumber: string;
      semester: Semester;
      year: number;
      classNumber: string;
      reviewTitle?: string | null;
      reviewContent?: string | null;
      reviewerGrade?: string | null;
      lastUpdated?: string | null;
      metrics: Array<{
        __typename?: "UserMetric";
        metricName: MetricName;
        value: number;
      }>;
    }>;
  };
};

export type GetCourseRatingsQueryVariables = Exact<{
  subject: Scalars["String"]["input"];
  number: Scalars["CourseNumber"]["input"];
}>;

export type GetCourseRatingsQuery = {
  __typename?: "Query";
  course?: {
    __typename?: "Course";
    subject: string;
    number: any;
    aggregatedRatings: {
      __typename?: "AggregatedRatings";
      metrics: Array<{
        __typename?: "Metric";
        metricName: MetricName;
        count: number;
        weightedAverage: number;
        categories: Array<{
          __typename?: "Category";
          value: number;
          count: number;
        }>;
      }>;
    };
  } | null;
};

export type GetClassRatingsDataQueryVariables = Exact<{
  subject: Scalars["String"]["input"];
  courseNumber: Scalars["String"]["input"];
  courseNumberTyped: Scalars["CourseNumber"]["input"];
}>;

export type GetClassRatingsDataQuery = {
  __typename?: "Query";
  course?: {
    __typename?: "Course";
    subject: string;
    number: any;
    aggregatedRatings: {
      __typename?: "AggregatedRatings";
      metrics: Array<{
        __typename?: "Metric";
        metricName: MetricName;
        count: number;
        weightedAverage: number;
        categories: Array<{
          __typename?: "Category";
          value: number;
          count: number;
        }>;
      }>;
    };
    instructorAggregatedRatings: Array<{
      __typename?: "InstructorRating";
      instructor: {
        __typename?: "Instructor";
        givenName: string;
        familyName: string;
      };
      aggregatedRatings: {
        __typename?: "AggregatedRatings";
        metrics: Array<{
          __typename?: "Metric";
          metricName: MetricName;
          count: number;
          weightedAverage: number;
          categories: Array<{
            __typename?: "Category";
            value: number;
            count: number;
          }>;
        }>;
      };
    }>;
    classes: Array<{
      __typename?: "Class";
      semester: Semester;
      year: number;
      number: any;
      anyPrintInScheduleOfClasses?: boolean | null;
      primarySection?: {
        __typename?: "Section";
        startDate: string;
        meetings: Array<{
          __typename?: "Meeting";
          instructors: Array<{
            __typename?: "Instructor";
            familyName: string;
            givenName: string;
          }>;
        }>;
      } | null;
    }>;
  } | null;
  semestersWithRatings: Array<{
    __typename?: "SemesterRatings";
    semester: Semester;
    year: number;
    maxMetricCount: number;
  }>;
};

export type GetAllRatingsQueryVariables = Exact<{ [key: string]: never }>;

export type GetAllRatingsQuery = {
  __typename?: "Query";
  allRatings: Array<{
    __typename?: "RawRating";
    anonymousUserId: string;
    subject: string;
    courseNumber: string;
    semester: Semester;
    year: number;
    classNumber: string;
    metricName: MetricName;
    value: number;
    createdAt: string;
  }>;
};

export type GetClassReviewsQueryVariables = Exact<{
  subject: Scalars["String"]["input"];
  courseNumber: Scalars["String"]["input"];
}>;

export type GetClassReviewsQuery = {
  __typename?: "Query";
  classReviews: {
    __typename?: "ClassReviews";
    subject: string;
    courseNumber: string;
    count: number;
    users: Array<{
      __typename?: "ClassUserReviews";
      anonymousUserId: string;
      classes: Array<{
        __typename?: "UserClass";
        subject: string;
        courseNumber: string;
        semester: Semester;
        year: number;
        classNumber: string;
        professorName?: string | null;
        reviewTitle?: string | null;
        reviewContent?: string | null;
        reviewerGrade?: string | null;
        lastUpdated?: string | null;
        reviewId?: string | null;
        helpfulCount?: number | null;
        metrics: Array<{
          __typename?: "UserMetric";
          metricName: MetricName;
          value: number;
        }>;
      }>;
    }>;
  };
};

export type VoteReviewHelpfulMutationVariables = Exact<{
  reviewId: Scalars["String"]["input"];
}>;

export type VoteReviewHelpfulMutation = {
  __typename?: "Mutation";
  voteReviewHelpful: number;
};

export type GetAllRouteRedirectsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetAllRouteRedirectsQuery = {
  __typename?: "Query";
  allRouteRedirects: Array<{
    __typename?: "RouteRedirect";
    id: string;
    fromPath: string;
    toPath: string;
    clickCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type IncrementRouteRedirectClickMutationVariables = Exact<{
  redirectId: Scalars["ID"]["input"];
}>;

export type IncrementRouteRedirectClickMutation = {
  __typename?: "Mutation";
  incrementRouteRedirectClick: {
    __typename?: "RouteRedirect";
    id: string;
    clickCount: number;
  };
};

export type ReadScheduleQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type ReadScheduleQuery = {
  __typename?: "Query";
  schedule?: {
    __typename?: "Schedule";
    _id: string;
    name: string;
    public: boolean;
    createdBy: string;
    year: number;
    semester: Semester;
    sessionId: any;
    term: { __typename?: "Term"; startDate: string; endDate: string };
    events: Array<{
      __typename?: "Event";
      _id: string;
      title: string;
      description?: string | null;
      startTime: string;
      endTime: string;
      days: Array<boolean>;
      color?: Color | null;
      hidden?: boolean | null;
    }>;
    classes: Array<{
      __typename?: "SelectedClass";
      color?: Color | null;
      hidden?: boolean | null;
      locked?: boolean | null;
      blockedSections?: Array<any> | null;
      lockedComponents?: Array<Component> | null;
      class: {
        __typename?: "Class";
        subject: string;
        courseNumber: any;
        number: any;
        unitsMax: number;
        unitsMin: number;
        course: {
          __typename?: "Course";
          title: string;
          gradeDistribution: {
            __typename?: "GradeDistribution";
            average?: number | null;
            distribution?: Array<{
              __typename?: "Grade";
              letter: string;
              count: number;
            }> | null;
          };
        };
        primarySection?: {
          __typename?: "Section";
          sectionId: any;
          subject: string;
          courseNumber: any;
          classNumber: any;
          number: any;
          startDate: string;
          endDate: string;
          component: Component;
          enrollment?: {
            __typename?: "Enrollment";
            latest?: {
              __typename?: "EnrollmentSingular";
              status?: EnrollmentStatus | null;
              enrolledCount: number;
              maxEnroll: number;
              waitlistedCount: number;
              maxWaitlist: number;
            } | null;
          } | null;
          meetings: Array<{
            __typename?: "Meeting";
            days?: Array<boolean> | null;
            location?: string | null;
            endTime?: string | null;
            startTime?: string | null;
            instructors: Array<{
              __typename?: "Instructor";
              familyName: string;
              givenName: string;
            }>;
          }>;
          exams: Array<{
            __typename?: "Exam";
            date: string;
            type: ExamType;
            location?: string | null;
            startTime: string;
            endTime: string;
          }>;
        } | null;
        sections: Array<{
          __typename?: "Section";
          sectionId: any;
          subject: string;
          courseNumber: any;
          classNumber: any;
          number: any;
          startDate: string;
          endDate: string;
          component: Component;
          enrollment?: {
            __typename?: "Enrollment";
            latest?: {
              __typename?: "EnrollmentSingular";
              status?: EnrollmentStatus | null;
              enrolledCount: number;
              maxEnroll: number;
              waitlistedCount: number;
              maxWaitlist: number;
            } | null;
          } | null;
          meetings: Array<{
            __typename?: "Meeting";
            days?: Array<boolean> | null;
            location?: string | null;
            endTime?: string | null;
            startTime?: string | null;
            instructors: Array<{
              __typename?: "Instructor";
              familyName: string;
              givenName: string;
            }>;
          }>;
          exams: Array<{
            __typename?: "Exam";
            date: string;
            type: ExamType;
            location?: string | null;
            startTime: string;
            endTime: string;
          }>;
        }>;
      };
      selectedSections: Array<{ __typename?: "Section"; sectionId: any }>;
    }>;
  } | null;
};

export type UpdateScheduleMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  schedule: UpdateScheduleInput;
}>;

export type UpdateScheduleMutation = {
  __typename?: "Mutation";
  updateSchedule: {
    __typename?: "Schedule";
    _id: string;
    name: string;
    public: boolean;
    createdBy: string;
    year: number;
    semester: Semester;
    sessionId: any;
    term: { __typename?: "Term"; startDate: string; endDate: string };
    events: Array<{
      __typename?: "Event";
      _id: string;
      title: string;
      description?: string | null;
      startTime: string;
      endTime: string;
      days: Array<boolean>;
      color?: Color | null;
      hidden?: boolean | null;
    }>;
    classes: Array<{
      __typename?: "SelectedClass";
      color?: Color | null;
      hidden?: boolean | null;
      locked?: boolean | null;
      blockedSections?: Array<any> | null;
      lockedComponents?: Array<Component> | null;
      class: {
        __typename?: "Class";
        subject: string;
        courseNumber: any;
        number: any;
        unitsMax: number;
        unitsMin: number;
        course: {
          __typename?: "Course";
          title: string;
          gradeDistribution: {
            __typename?: "GradeDistribution";
            average?: number | null;
            distribution?: Array<{
              __typename?: "Grade";
              letter: string;
              count: number;
            }> | null;
          };
        };
        primarySection?: {
          __typename?: "Section";
          sectionId: any;
          subject: string;
          courseNumber: any;
          classNumber: any;
          number: any;
          startDate: string;
          endDate: string;
          component: Component;
          enrollment?: {
            __typename?: "Enrollment";
            latest?: {
              __typename?: "EnrollmentSingular";
              status?: EnrollmentStatus | null;
              enrolledCount: number;
              maxEnroll: number;
              waitlistedCount: number;
              maxWaitlist: number;
            } | null;
          } | null;
          meetings: Array<{
            __typename?: "Meeting";
            days?: Array<boolean> | null;
            location?: string | null;
            endTime?: string | null;
            startTime?: string | null;
            instructors: Array<{
              __typename?: "Instructor";
              familyName: string;
              givenName: string;
            }>;
          }>;
          exams: Array<{
            __typename?: "Exam";
            date: string;
            type: ExamType;
            location?: string | null;
            startTime: string;
            endTime: string;
          }>;
        } | null;
        sections: Array<{
          __typename?: "Section";
          sectionId: any;
          subject: string;
          courseNumber: any;
          classNumber: any;
          number: any;
          startDate: string;
          endDate: string;
          component: Component;
          enrollment?: {
            __typename?: "Enrollment";
            latest?: {
              __typename?: "EnrollmentSingular";
              status?: EnrollmentStatus | null;
              enrolledCount: number;
              maxEnroll: number;
              waitlistedCount: number;
              maxWaitlist: number;
            } | null;
          } | null;
          meetings: Array<{
            __typename?: "Meeting";
            days?: Array<boolean> | null;
            location?: string | null;
            endTime?: string | null;
            startTime?: string | null;
            instructors: Array<{
              __typename?: "Instructor";
              familyName: string;
              givenName: string;
            }>;
          }>;
          exams: Array<{
            __typename?: "Exam";
            date: string;
            type: ExamType;
            location?: string | null;
            startTime: string;
            endTime: string;
          }>;
        }>;
      };
      selectedSections: Array<{ __typename?: "Section"; sectionId: any }>;
    }>;
  };
};

export type DeleteScheduleMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteScheduleMutation = {
  __typename?: "Mutation";
  deleteSchedule?: string | null;
};

export type CreateScheduleMutationVariables = Exact<{
  schedule: CreateScheduleInput;
}>;

export type CreateScheduleMutation = {
  __typename?: "Mutation";
  createSchedule: {
    __typename?: "Schedule";
    _id: string;
    name: string;
    public: boolean;
    createdBy: string;
    year: number;
    semester: Semester;
    sessionId: any;
    term: { __typename?: "Term"; startDate: string; endDate: string };
    events: Array<{
      __typename?: "Event";
      _id: string;
      title: string;
      description?: string | null;
      startTime: string;
      endTime: string;
      days: Array<boolean>;
      color?: Color | null;
      hidden?: boolean | null;
    }>;
    classes: Array<{
      __typename?: "SelectedClass";
      color?: Color | null;
      hidden?: boolean | null;
      locked?: boolean | null;
      blockedSections?: Array<any> | null;
      lockedComponents?: Array<Component> | null;
      class: {
        __typename?: "Class";
        subject: string;
        courseNumber: any;
        number: any;
        unitsMax: number;
        unitsMin: number;
        course: {
          __typename?: "Course";
          title: string;
          gradeDistribution: {
            __typename?: "GradeDistribution";
            average?: number | null;
            distribution?: Array<{
              __typename?: "Grade";
              letter: string;
              count: number;
            }> | null;
          };
        };
        primarySection?: {
          __typename?: "Section";
          sectionId: any;
          subject: string;
          courseNumber: any;
          classNumber: any;
          number: any;
          startDate: string;
          endDate: string;
          component: Component;
          enrollment?: {
            __typename?: "Enrollment";
            latest?: {
              __typename?: "EnrollmentSingular";
              status?: EnrollmentStatus | null;
              enrolledCount: number;
              maxEnroll: number;
              waitlistedCount: number;
              maxWaitlist: number;
            } | null;
          } | null;
          meetings: Array<{
            __typename?: "Meeting";
            days?: Array<boolean> | null;
            location?: string | null;
            endTime?: string | null;
            startTime?: string | null;
            instructors: Array<{
              __typename?: "Instructor";
              familyName: string;
              givenName: string;
            }>;
          }>;
          exams: Array<{
            __typename?: "Exam";
            date: string;
            type: ExamType;
            location?: string | null;
            startTime: string;
            endTime: string;
          }>;
        } | null;
        sections: Array<{
          __typename?: "Section";
          sectionId: any;
          subject: string;
          courseNumber: any;
          classNumber: any;
          number: any;
          startDate: string;
          endDate: string;
          component: Component;
          enrollment?: {
            __typename?: "Enrollment";
            latest?: {
              __typename?: "EnrollmentSingular";
              status?: EnrollmentStatus | null;
              enrolledCount: number;
              maxEnroll: number;
              waitlistedCount: number;
              maxWaitlist: number;
            } | null;
          } | null;
          meetings: Array<{
            __typename?: "Meeting";
            days?: Array<boolean> | null;
            location?: string | null;
            endTime?: string | null;
            startTime?: string | null;
            instructors: Array<{
              __typename?: "Instructor";
              familyName: string;
              givenName: string;
            }>;
          }>;
          exams: Array<{
            __typename?: "Exam";
            date: string;
            type: ExamType;
            location?: string | null;
            startTime: string;
            endTime: string;
          }>;
        }>;
      };
      selectedSections: Array<{ __typename?: "Section"; sectionId: any }>;
    }>;
  };
};

export type ReadSchedulesQueryVariables = Exact<{ [key: string]: never }>;

export type ReadSchedulesQuery = {
  __typename?: "Query";
  schedules?: Array<{
    __typename?: "Schedule";
    _id: string;
    name: string;
    year: number;
    semester: Semester;
    sessionId: any;
    events: Array<{
      __typename?: "Event";
      _id: string;
      title: string;
      description?: string | null;
      startTime: string;
      endTime: string;
      days: Array<boolean>;
      color?: Color | null;
      hidden?: boolean | null;
    }>;
    classes: Array<{
      __typename?: "SelectedClass";
      color?: Color | null;
      hidden?: boolean | null;
      class: {
        __typename?: "Class";
        subject: string;
        courseNumber: any;
        number: any;
        primarySection?: {
          __typename?: "Section";
          sectionId: any;
          number: any;
          component: Component;
          meetings: Array<{
            __typename?: "Meeting";
            days?: Array<boolean> | null;
            endTime?: string | null;
            startTime?: string | null;
          }>;
        } | null;
        sections: Array<{
          __typename?: "Section";
          sectionId: any;
          number: any;
          component: Component;
          meetings: Array<{
            __typename?: "Meeting";
            days?: Array<boolean> | null;
            endTime?: string | null;
            startTime?: string | null;
          }>;
        }>;
      };
      selectedSections: Array<{ __typename?: "Section"; sectionId: any }>;
    }>;
  } | null> | null;
};

export type GetAllStaffMembersQueryVariables = Exact<{ [key: string]: never }>;

export type GetAllStaffMembersQuery = {
  __typename?: "Query";
  allStaffMembers: Array<{
    __typename?: "StaffMember";
    id: string;
    userId?: string | null;
    name: string;
    email?: string | null;
    personalLink?: string | null;
    roles: Array<{
      __typename?: "SemesterRole";
      id: string;
      year: number;
      semester: Semester;
      role: string;
      team?: string | null;
      photo?: string | null;
      altPhoto?: string | null;
      isLeadership: boolean;
    }>;
  }>;
};

export type GetTargetedMessagesForCourseQueryVariables = Exact<{
  courseId: Scalars["String"]["input"];
}>;

export type GetTargetedMessagesForCourseQuery = {
  __typename?: "Query";
  targetedMessagesForCourse: Array<{
    __typename?: "TargetedMessage";
    id: string;
    title: string;
    description?: string | null;
    link?: string | null;
    linkText?: string | null;
    persistent: boolean;
    reappearing: boolean;
  }>;
};

export type IncrementTargetedMessageDismissMutationVariables = Exact<{
  messageId: Scalars["ID"]["input"];
}>;

export type IncrementTargetedMessageDismissMutation = {
  __typename?: "Mutation";
  incrementTargetedMessageDismiss: {
    __typename?: "TargetedMessage";
    id: string;
    dismissCount: number;
  };
};

export type GetTermsQueryVariables = Exact<{ [key: string]: never }>;

export type GetTermsQuery = {
  __typename?: "Query";
  terms: Array<{
    __typename?: "Term";
    year: number;
    semester: Semester;
    temporalPosition: TemporalPosition;
    hasCatalogData: boolean;
    startDate: string;
    endDate: string;
    sessions?: Array<{
      __typename?: "Session";
      id: any;
      name: string;
      startDate: string;
      endDate: string;
      temporalPosition: TemporalPosition;
    }> | null;
  }>;
};

export type GetTermQueryVariables = Exact<{
  year: Scalars["Int"]["input"];
  semester: Semester;
}>;

export type GetTermQuery = {
  __typename?: "Query";
  term?: {
    __typename?: "Term";
    year: number;
    semester: Semester;
    temporalPosition: TemporalPosition;
    startDate: string;
    endDate: string;
    sessions?: Array<{
      __typename?: "Session";
      name: string;
      startDate: string;
      endDate: string;
      temporalPosition: TemporalPosition;
    }> | null;
  } | null;
};

export type GetUserQueryVariables = Exact<{ [key: string]: never }>;

export type GetUserQuery = {
  __typename?: "Query";
  user?: {
    __typename?: "User";
    _id: string;
    email: string;
    name: string;
    student: boolean;
  } | null;
};

export type UpdateUserMutationVariables = Exact<{
  user: UpdateUserInput;
}>;

export type UpdateUserMutation = {
  __typename?: "Mutation";
  updateUser?: {
    __typename?: "User";
    _id: string;
    name: string;
    email: string;
    student: boolean;
  } | null;
};

export type DeleteAccountMutationVariables = Exact<{ [key: string]: never }>;

export type DeleteAccountMutation = {
  __typename?: "Mutation";
  deleteAccount?: boolean | null;
};

export const GetAllBannersDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetAllBanners" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "allBanners" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "text" } },
                { kind: "Field", name: { kind: "Name", value: "link" } },
                { kind: "Field", name: { kind: "Name", value: "linkText" } },
                { kind: "Field", name: { kind: "Name", value: "persistent" } },
                { kind: "Field", name: { kind: "Name", value: "reappearing" } },
                { kind: "Field", name: { kind: "Name", value: "clickCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "dismissCount" },
                },
                { kind: "Field", name: { kind: "Name", value: "viewCount" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAllBannersQuery, GetAllBannersQueryVariables>;
export const IncrementBannerClickDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "IncrementBannerClick" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "bannerId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "incrementBannerClick" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "bannerId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "bannerId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "clickCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  IncrementBannerClickMutation,
  IncrementBannerClickMutationVariables
>;
export const IncrementBannerDismissDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "IncrementBannerDismiss" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "bannerId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "incrementBannerDismiss" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "bannerId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "bannerId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "dismissCount" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  IncrementBannerDismissMutation,
  IncrementBannerDismissMutationVariables
>;
export const TrackBannerViewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "TrackBannerView" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "bannerId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "trackBannerView" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "bannerId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "bannerId" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  TrackBannerViewMutation,
  TrackBannerViewMutationVariables
>;
export const GetCatalogSearchDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCatalogSearch" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semester" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Semester" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "search" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "filters" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "CatalogFilters" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sortBy" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "CatalogSortBy" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sortOrder" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "SortOrder" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "pageSize" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semanticSearch" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "catalogSearch" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "year" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "year" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semester" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semester" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "search" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "search" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "filters" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "filters" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sortBy" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sortBy" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sortOrder" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sortOrder" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "pageSize" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "pageSize" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semanticSearch" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semanticSearch" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "results" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "year" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "semester" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sessionId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "subject" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "courseNumber" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "number" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unitsMin" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unitsMax" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "courseTitle" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "allTimeAverageGrade" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "allTimePassCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "allTimeNoPassCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "enrolledCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "maxEnroll" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "activeReservedMaxCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "aggregatedRatings" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "metrics" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "metricName" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "count" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "weightedAverage",
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "decal" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "meetings" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "days" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "startTime" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "endTime" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "totalCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCatalogSearchQuery,
  GetCatalogSearchQueryVariables
>;
export const GetCatalogClassIdentitiesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCatalogClassIdentities" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semester" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Semester" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "catalogClassIdentities" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "year" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "year" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semester" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semester" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "courseNumber" },
                },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "sessionId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCatalogClassIdentitiesQuery,
  GetCatalogClassIdentitiesQueryVariables
>;
export const GetCatalogFilterOptionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCatalogFilterOptions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semester" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Semester" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "catalogFilterOptions" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "year" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "year" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semester" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semester" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "levels" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "gradingOptions" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "breadthRequirements" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "universityRequirements" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "timeRange" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "minStartTime" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "maxEndTime" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCatalogFilterOptionsQuery,
  GetCatalogFilterOptionsQueryVariables
>;
export const GetClassDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetClass" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semester" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Semester" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sessionId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SessionIdentifier" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseNumber" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "number" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ClassNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "class" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "year" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "year" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semester" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semester" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sessionId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sessionId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseNumber" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "number" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                { kind: "Field", name: { kind: "Name", value: "sessionId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "courseNumber" },
                },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "decal" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "syllabus" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "syllabusUrl" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "applicationUrl" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "applicationDueDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "instructors" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "email" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "unitsMax" } },
                { kind: "Field", name: { kind: "Name", value: "unitsMin" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "gradingBasis" },
                },
                { kind: "Field", name: { kind: "Name", value: "finalExam" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "gradeDistribution" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "average" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pnpPercentage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "distribution" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "letter" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "count" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "course" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "aggregatedRatings" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "metrics" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "categories" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "count",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "value",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "count" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "metricName" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "weightedAverage",
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "gradeDistribution" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "average" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "pnpPercentage" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "distribution" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "letter" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "count" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "academicCareer" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "requirements" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "requiredCourses" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "classes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "semester" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "year" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                            {
                              kind: "Field",
                              name: {
                                kind: "Name",
                                value: "anyPrintInScheduleOfClasses",
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "primarySection" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "startDate" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "meetings" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "instructors",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "familyName",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "givenName",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "primarySection" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "number" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sectionId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "component" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "online" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "attendanceRequired" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lecturesRecorded" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sectionAttributes" },
                        arguments: [
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "attributeCode" },
                            value: {
                              kind: "StringValue",
                              value: "NOTE",
                              block: false,
                            },
                          },
                        ],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "attribute" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "code" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "description",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "formalDescription",
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "value" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "code" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "description",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "formalDescription",
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "enrollment" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "history" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "startTime" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endTime" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "granularitySeconds",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "status" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "enrolledCount",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "maxEnroll" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "waitlistedCount",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "maxWaitlist",
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "latest" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "startTime" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endTime" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "granularitySeconds",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "status" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "enrolledCount",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "maxEnroll" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "waitlistedCount",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "maxWaitlist",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "activeReservedMaxCount",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "seatReservationCount",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "enrolledCount",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "maxEnroll",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "requirementGroup",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "description",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "isValid",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "meetings" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "days" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "location" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "endTime" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "startTime" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "instructors" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "familyName" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "givenName" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "exams" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "date" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "type" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "location" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "startTime" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "endTime" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sections" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "number" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sectionId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "component" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "online" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "attendanceRequired" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lecturesRecorded" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sectionAttributes" },
                        arguments: [
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "attributeCode" },
                            value: {
                              kind: "StringValue",
                              value: "NOTE",
                              block: false,
                            },
                          },
                        ],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "attribute" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "code" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "description",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "formalDescription",
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "value" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "code" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "description",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "formalDescription",
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "enrollment" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "latest" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "startTime" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endTime" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "granularitySeconds",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "status" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "enrolledCount",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "maxEnroll" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "waitlistedCount",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "maxWaitlist",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "activeReservedMaxCount",
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "meetings" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "days" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "location" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "endTime" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "startTime" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "instructors" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "familyName" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "givenName" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "exams" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "date" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "type" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "location" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "startTime" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "endTime" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetClassQuery, GetClassQueryVariables>;
export const GetClassDetailsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetClassDetails" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semester" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Semester" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sessionId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SessionIdentifier" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseNumber" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "number" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ClassNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "class" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "year" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "year" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semester" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semester" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sessionId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sessionId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseNumber" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "number" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                { kind: "Field", name: { kind: "Name", value: "sessionId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "courseNumber" },
                },
                { kind: "Field", name: { kind: "Name", value: "courseId" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "unitsMax" } },
                { kind: "Field", name: { kind: "Name", value: "unitsMin" } },
                { kind: "Field", name: { kind: "Name", value: "finalExam" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "decal" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "course" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "requirements" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "aggregatedRatings" },
                        arguments: [
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "metricNames" },
                            value: {
                              kind: "ListValue",
                              values: [
                                { kind: "EnumValue", value: "Attendance" },
                                { kind: "EnumValue", value: "Recording" },
                              ],
                            },
                          },
                        ],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "metrics" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "metricName" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "count" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "weightedAverage",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "categories" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "value",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "count",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "gradeDistribution" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "average" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "pnpPercentage" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "primarySection" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sectionId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "component" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sectionAttributes" },
                        arguments: [
                          {
                            kind: "Argument",
                            name: { kind: "Name", value: "attributeCode" },
                            value: {
                              kind: "StringValue",
                              value: "NOTE",
                              block: false,
                            },
                          },
                        ],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "attribute" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "code" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "formalDescription",
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "value" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "description",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "formalDescription",
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "exams" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "date" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "startTime" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "endTime" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "location" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "type" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "enrollment" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "latest" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endTime" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "enrolledCount",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "maxEnroll" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "waitlistedCount",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "maxWaitlist",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "activeReservedMaxCount",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "seatReservationCount",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "enrolledCount",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "maxEnroll",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "requirementGroup",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "description",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "isValid",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "meetings" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "days" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "location" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "endTime" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "startTime" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "instructors" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "familyName" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "givenName" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "decal" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "syllabus" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "syllabusUrl" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "applicationUrl" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "applicationDueDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "instructors" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "email" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetClassDetailsQuery,
  GetClassDetailsQueryVariables
>;
export const GetClassSectionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetClassSections" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semester" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Semester" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sessionId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SessionIdentifier" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseNumber" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "number" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ClassNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "class" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "year" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "year" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semester" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semester" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sessionId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sessionId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseNumber" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "number" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sections" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sectionId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "number" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "component" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "meetings" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "days" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "location" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "endTime" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "startTime" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "instructors" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "familyName" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "givenName" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "enrollment" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "latest" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "enrolledCount",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "maxEnroll" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "waitlistedCount",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "maxWaitlist",
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetClassSectionsQuery,
  GetClassSectionsQueryVariables
>;
export const GetClassGradesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetClassGrades" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semester" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Semester" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sessionId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SessionIdentifier" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseNumber" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "number" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ClassNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "class" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "year" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "year" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semester" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semester" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sessionId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sessionId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseNumber" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "number" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "course" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "gradeDistribution" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "average" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "distribution" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "letter" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "count" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetClassGradesQuery, GetClassGradesQueryVariables>;
export const GetClassEnrollmentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetClassEnrollment" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semester" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Semester" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sessionId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SessionIdentifier" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseNumber" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "number" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ClassNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "class" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "year" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "year" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semester" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semester" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sessionId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sessionId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseNumber" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "number" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "primarySection" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "enrollment" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "history" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "startTime" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endTime" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "granularitySeconds",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "enrolledCount",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "maxEnroll" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "waitlistedCount",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "maxWaitlist",
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetClassEnrollmentQuery,
  GetClassEnrollmentQueryVariables
>;
export const TrackClassViewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "TrackClassView" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semester" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Semester" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sessionId" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "SessionIdentifier" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseNumber" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "number" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ClassNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "trackClassView" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "year" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "year" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semester" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semester" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sessionId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sessionId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseNumber" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "number" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  TrackClassViewMutation,
  TrackClassViewMutationVariables
>;
export const GetCollectionByIdDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCollectionById" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "myCollectionById" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "name" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "class" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseNumber" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "sessionId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "year" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "semester" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "unitsMin" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "unitsMax" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "course" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "title" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "gradeDistribution",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "average",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: {
                                kind: "Name",
                                value: "gradeDistribution",
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "average" },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "primarySection" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "enrollment" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "latest",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "enrolledCount",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "maxEnroll",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "endTime",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value:
                                                    "activeReservedMaxCount",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCollectionByIdQuery,
  GetCollectionByIdQueryVariables
>;
export const GetAllCollectionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetAllCollections" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "myCollections" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "color" } },
                { kind: "Field", name: { kind: "Name", value: "pinnedAt" } },
                { kind: "Field", name: { kind: "Name", value: "isSystem" } },
                { kind: "Field", name: { kind: "Name", value: "lastAdd" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "class" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseNumber" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllCollectionsQuery,
  GetAllCollectionsQueryVariables
>;
export const GetAllCollectionsWithPreviewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetAllCollectionsWithPreview" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "myCollections" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "color" } },
                { kind: "Field", name: { kind: "Name", value: "pinnedAt" } },
                { kind: "Field", name: { kind: "Name", value: "isSystem" } },
                { kind: "Field", name: { kind: "Name", value: "lastAdd" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "addedAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "class" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseNumber" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "unitsMin" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "unitsMax" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "course" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "title" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "gradeDistribution",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "average",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: {
                                kind: "Name",
                                value: "gradeDistribution",
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "average" },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "primarySection" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "enrollment" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "latest",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "enrolledCount",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "maxEnroll",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value:
                                                    "activeReservedMaxCount",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllCollectionsWithPreviewQuery,
  GetAllCollectionsWithPreviewQueryVariables
>;
export const AddClassToCollectionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AddClassToCollection" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "AddClassInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "addClassToCollection" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "color" } },
                { kind: "Field", name: { kind: "Name", value: "pinnedAt" } },
                { kind: "Field", name: { kind: "Name", value: "isSystem" } },
                { kind: "Field", name: { kind: "Name", value: "lastAdd" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "class" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseNumber" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AddClassToCollectionMutation,
  AddClassToCollectionMutationVariables
>;
export const RemoveClassFromCollectionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RemoveClassFromCollection" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "RemoveClassInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "removeClassFromCollection" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "color" } },
                { kind: "Field", name: { kind: "Name", value: "pinnedAt" } },
                { kind: "Field", name: { kind: "Name", value: "isSystem" } },
                { kind: "Field", name: { kind: "Name", value: "lastAdd" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "class" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseNumber" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RemoveClassFromCollectionMutation,
  RemoveClassFromCollectionMutationVariables
>;
export const CreateCollectionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateCollection" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateCollectionInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createCollection" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "color" } },
                { kind: "Field", name: { kind: "Name", value: "pinnedAt" } },
                { kind: "Field", name: { kind: "Name", value: "isSystem" } },
                { kind: "Field", name: { kind: "Name", value: "lastAdd" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "class" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseNumber" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateCollectionMutation,
  CreateCollectionMutationVariables
>;
export const UpdateCollectionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateCollection" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateCollectionInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateCollection" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "color" } },
                { kind: "Field", name: { kind: "Name", value: "pinnedAt" } },
                { kind: "Field", name: { kind: "Name", value: "isSystem" } },
                { kind: "Field", name: { kind: "Name", value: "lastAdd" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateCollectionMutation,
  UpdateCollectionMutationVariables
>;
export const DeleteCollectionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteCollection" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteCollection" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteCollectionMutation,
  DeleteCollectionMutationVariables
>;
export const GetCourseTitleDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCourseTitle" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "number" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "course" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "number" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "courseId" } },
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "aggregatedRatings" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "metrics" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "metricName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "count" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "weightedAverage" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetCourseTitleQuery, GetCourseTitleQueryVariables>;
export const GetCourseUnitsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCourseUnits" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "number" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "course" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "number" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "courseId" } },
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unitsMax" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "semester" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "year" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetCourseUnitsQuery, GetCourseUnitsQueryVariables>;
export const GetCourseDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCourse" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "number" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "course" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "number" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "courseId" } },
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "academicCareer" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "gradeDistribution" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "average" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "distribution" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "letter" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "count" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "gradingBasis" },
                },
                { kind: "Field", name: { kind: "Name", value: "finalExam" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "requirements" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "requiredCourses" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "subject" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "number" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "year" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "semester" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "number" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "aggregatedRatings" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "metrics" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "metricName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "count" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "weightedAverage" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "categories" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "value" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "count" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetCourseQuery, GetCourseQueryVariables>;
export const GetClassOverviewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetClassOverview" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "number" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "course" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "number" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "requirements" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "aggregatedRatings" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "metricNames" },
                      value: {
                        kind: "ListValue",
                        values: [
                          { kind: "EnumValue", value: "Attendance" },
                          { kind: "EnumValue", value: "Recording" },
                        ],
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "metrics" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "metricName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "count" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "weightedAverage" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "categories" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "value" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "count" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "gradeDistribution" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "average" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pnpPercentage" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetClassOverviewQuery,
  GetClassOverviewQueryVariables
>;
export const GetCourseOverviewByIdDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCourseOverviewById" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseIdentifier" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "courseById" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "requirements" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "aggregatedRatings" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "metricNames" },
                      value: {
                        kind: "ListValue",
                        values: [
                          { kind: "EnumValue", value: "Attendance" },
                          { kind: "EnumValue", value: "Recording" },
                        ],
                      },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "metrics" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "metricName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "count" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "weightedAverage" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "categories" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "value" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "count" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "gradeDistribution" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "average" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pnpPercentage" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCourseOverviewByIdQuery,
  GetCourseOverviewByIdQueryVariables
>;
export const GetCourseGradeDistDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCourseGradeDist" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "number" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "course" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "number" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "courseId" } },
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "gradeDistribution" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "average" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "distribution" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "letter" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "count" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCourseGradeDistQuery,
  GetCourseGradeDistQueryVariables
>;
export const GetCourseWithInstructorDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCourseWithInstructor" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "number" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "course" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "number" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "year" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "semester" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "number" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sessionId" },
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "anyPrintInScheduleOfClasses",
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "term" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "temporalPosition" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "primarySection" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "enrollment" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "latest" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "enrolledCount",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "startDate" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "meetings" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "instructors",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "familyName",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "givenName",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "gradeDistribution" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "average" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCourseWithInstructorQuery,
  GetCourseWithInstructorQueryVariables
>;
export const GetAllClassesForCourseDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetAllClassesForCourse" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "number" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "course" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "number" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "semester" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "year" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "number" },
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "anyPrintInScheduleOfClasses",
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "primarySection" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "startDate" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "meetings" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "instructors",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "familyName",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "givenName",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllClassesForCourseQuery,
  GetAllClassesForCourseQueryVariables
>;
export const GetCourseNamesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCourseNames" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "courses" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "courseId" } },
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "departmentNicknames" },
                },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetCourseNamesQuery, GetCourseNamesQueryVariables>;
export const GetCoursesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCourses" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "courses" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "courseId" } },
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "gradeDistribution" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "average" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "distribution" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "letter" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "count" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "academicCareer" },
                },
                { kind: "Field", name: { kind: "Name", value: "finalExam" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "gradingBasis" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "typicallyOffered" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "primaryInstructionMethod" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetCoursesQuery, GetCoursesQueryVariables>;
export const GetCuratedClassDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCuratedClass" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "curatedClass" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "text" } },
                { kind: "Field", name: { kind: "Name", value: "image" } },
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "courseNumber" },
                },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "sessionId" } },
                { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "class" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "number" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sessionId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unitsMax" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unitsMin" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "finalExam" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "gradingBasis" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "primarySection" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "component" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "online" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "instructionMode" },
                            },
                            {
                              kind: "Field",
                              name: {
                                kind: "Name",
                                value: "attendanceRequired",
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "lecturesRecorded" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "enrollment" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "latest" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "status",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "enrolledCount",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "maxEnroll",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "waitlistedCount",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "maxWaitlist",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "meetings" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "days" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "course" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                            {
                              kind: "Field",
                              name: {
                                kind: "Name",
                                value: "gradeDistribution",
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "average" },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "academicCareer" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCuratedClassQuery,
  GetCuratedClassQueryVariables
>;
export const CreateCuratedClassDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateCuratedClass" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "curatedClass" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateCuratedClassInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createCuratedClass" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "curatedClass" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "curatedClass" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "text" } },
                { kind: "Field", name: { kind: "Name", value: "image" } },
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "courseNumber" },
                },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "sessionId" } },
                { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "class" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "number" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sessionId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unitsMax" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unitsMin" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "finalExam" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "gradingBasis" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "primarySection" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "component" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "online" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "instructionMode" },
                            },
                            {
                              kind: "Field",
                              name: {
                                kind: "Name",
                                value: "attendanceRequired",
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "lecturesRecorded" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "enrollment" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "latest" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "status",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "enrolledCount",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "maxEnroll",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "waitlistedCount",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "maxWaitlist",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "meetings" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "days" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "course" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                            {
                              kind: "Field",
                              name: {
                                kind: "Name",
                                value: "gradeDistribution",
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "average" },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "academicCareer" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateCuratedClassMutation,
  CreateCuratedClassMutationVariables
>;
export const UpdateCuratedClassDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateCuratedClass" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "curatedClass" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateCuratedClassInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateCuratedClass" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "curatedClass" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "curatedClass" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "text" } },
                { kind: "Field", name: { kind: "Name", value: "image" } },
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "courseNumber" },
                },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "sessionId" } },
                { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "class" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "number" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sessionId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unitsMax" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unitsMin" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "finalExam" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "gradingBasis" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "primarySection" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "component" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "online" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "instructionMode" },
                            },
                            {
                              kind: "Field",
                              name: {
                                kind: "Name",
                                value: "attendanceRequired",
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "lecturesRecorded" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "enrollment" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "latest" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "status",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "enrolledCount",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "maxEnroll",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "waitlistedCount",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "maxWaitlist",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "meetings" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "days" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "course" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                            {
                              kind: "Field",
                              name: {
                                kind: "Name",
                                value: "gradeDistribution",
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "average" },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "academicCareer" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateCuratedClassMutation,
  UpdateCuratedClassMutationVariables
>;
export const DeleteCuratedClassDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteCuratedClass" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteCuratedClass" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteCuratedClassMutation,
  DeleteCuratedClassMutationVariables
>;
export const GetCuratedClassesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCuratedClasses" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "curatedClasses" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "text" } },
                { kind: "Field", name: { kind: "Name", value: "image" } },
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "courseNumber" },
                },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "sessionId" } },
                { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "class" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "number" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sessionId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unitsMax" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unitsMin" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "finalExam" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "gradingBasis" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "primarySection" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "component" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "online" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "instructionMode" },
                            },
                            {
                              kind: "Field",
                              name: {
                                kind: "Name",
                                value: "attendanceRequired",
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "lecturesRecorded" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "enrollment" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "latest" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "status",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "enrolledCount",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "maxEnroll",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "waitlistedCount",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "maxWaitlist",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "activeReservedMaxCount",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "endTime",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "meetings" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "days" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "course" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                            {
                              kind: "Field",
                              name: {
                                kind: "Name",
                                value: "gradeDistribution",
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "average" },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "academicCareer" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCuratedClassesQuery,
  GetCuratedClassesQueryVariables
>;
export const GetEnrollmentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetEnrollment" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semester" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Semester" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sessionId" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "SessionIdentifier" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseNumber" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sectionNumber" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SectionNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "enrollment" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "year" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "year" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semester" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semester" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sessionId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sessionId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseNumber" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sectionNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sectionNumber" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                { kind: "Field", name: { kind: "Name", value: "sessionId" } },
                { kind: "Field", name: { kind: "Name", value: "sectionId" } },
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "courseNumber" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sectionNumber" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "history" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startTime" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endTime" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "granularitySeconds" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "enrolledCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "waitlistedCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "reservedCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "minEnroll" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "maxEnroll" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "maxWaitlist" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "openReserved" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "activeReservedMaxCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "seatReservationCount" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "maxEnroll" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "enrolledCount" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "requirementGroup" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "description",
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "isValid" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetEnrollmentQuery, GetEnrollmentQueryVariables>;
export const GetEnrollmentTimeframesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetEnrollmentTimeframes" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semester" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Semester" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "enrollmentTimeframes" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "year" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "year" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semester" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semester" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "phase" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "isAdjustment" },
                },
                { kind: "Field", name: { kind: "Name", value: "group" } },
                { kind: "Field", name: { kind: "Name", value: "startDate" } },
                { kind: "Field", name: { kind: "Name", value: "endDate" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "startEventSummary" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetEnrollmentTimeframesQuery,
  GetEnrollmentTimeframesQueryVariables
>;
export const GetGradeDistributionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetGradeDistribution" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semester" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "Semester" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sessionId" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "SessionIdentifier" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "classNumber" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "ClassNumber" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "familyName" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "givenName" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "grade" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "year" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "year" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semester" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semester" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sessionId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sessionId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "classNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "classNumber" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "familyName" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "familyName" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "givenName" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "givenName" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "average" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pnpPercentage" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "distribution" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "letter" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "percentage" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "count" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetGradeDistributionQuery,
  GetGradeDistributionQueryVariables
>;
export const CreateNewPlanDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateNewPlan" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "colleges" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "Colleges" },
                },
              },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "startYear" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "endYear" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "majors" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "String" },
                },
              },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "minors" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "String" },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createNewPlan" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "colleges" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "colleges" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "startYear" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "startYear" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "endYear" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "endYear" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "majors" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "majors" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "minors" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "minors" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "planTerms" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "_id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "year" } },
                      { kind: "Field", name: { kind: "Name", value: "term" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "courses" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseID" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseTitle" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseUnits" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "pnp" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "transfer" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "labels" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "name" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "color" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hidden" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pinned" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "majors" } },
                { kind: "Field", name: { kind: "Name", value: "minors" } },
                { kind: "Field", name: { kind: "Name", value: "colleges" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "labels" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "color" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateNewPlanMutation,
  CreateNewPlanMutationVariables
>;
export const GetPlanDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetPlan" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "planByUser" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "planTerms" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "_id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "year" } },
                      { kind: "Field", name: { kind: "Name", value: "term" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "courses" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseID" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseTitle" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseUnits" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "pnp" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "transfer" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "labels" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "name" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "color" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hidden" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pinned" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "majors" } },
                { kind: "Field", name: { kind: "Name", value: "minors" } },
                { kind: "Field", name: { kind: "Name", value: "colleges" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "labels" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "color" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "selectedPlanRequirements" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "planRequirement" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "_id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "code" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "isUcReq" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "college" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "major" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "minor" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "isOfficial" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "manualOverrides" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetPlanQuery, GetPlanQueryVariables>;
export const GetPlansDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetPlans" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "planByUser" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetPlansQuery, GetPlansQueryVariables>;
export const EditPlanDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "EditPlan" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "plan" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "PlanInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "editPlan" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "plan" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "plan" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "majors" } },
                { kind: "Field", name: { kind: "Name", value: "minors" } },
                { kind: "Field", name: { kind: "Name", value: "colleges" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "labels" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "color" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "selectedPlanRequirements" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "planRequirement" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "_id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "code" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "isUcReq" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "college" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "major" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "minor" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "isOfficial" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "manualOverrides" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<EditPlanMutation, EditPlanMutationVariables>;
export const SetSelectedCoursesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetSelectedCourses" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courses" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "SelectedCourseInput" },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setSelectedCourses" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "courses" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courses" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SetSelectedCoursesMutation,
  SetSelectedCoursesMutationVariables
>;
export const CreateNewPlanTermDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateNewPlanTerm" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "planTerm" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "PlanTermInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createNewPlanTerm" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "planTerm" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "planTerm" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "userEmail" } },
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "term" } },
                { kind: "Field", name: { kind: "Name", value: "hidden" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "pinned" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateNewPlanTermMutation,
  CreateNewPlanTermMutationVariables
>;
export const RemovePlanTermByIdDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RemovePlanTermByID" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "removePlanTermByIdId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "removePlanTermByID" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "removePlanTermByIdId" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RemovePlanTermByIdMutation,
  RemovePlanTermByIdMutationVariables
>;
export const EditPlanTermDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "EditPlanTerm" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "planTerm" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "EditPlanTermInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "editPlanTerm" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "planTerm" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "planTerm" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "userEmail" } },
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "term" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "courses" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "courseID" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "courseName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "courseTitle" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "courseUnits" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "pnp" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "transfer" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "labels" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "color" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "hidden" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "pinned" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  EditPlanTermMutation,
  EditPlanTermMutationVariables
>;
export const GetCourseRequirementsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCourseRequirements" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "number" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "course" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "number" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mostRecentClass" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "requirementDesignation" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "code" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "description" },
                            },
                            {
                              kind: "Field",
                              name: {
                                kind: "Name",
                                value: "formalDescription",
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "primarySection" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: {
                                kind: "Name",
                                value: "sectionAttributes",
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "attribute" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "code" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "description",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "formalDescription",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "value" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "code" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "description",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "formalDescription",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCourseRequirementsQuery,
  GetCourseRequirementsQueryVariables
>;
export const UpdateManualOverrideDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateManualOverride" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateManualOverrideInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateManualOverride" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "selectedPlanRequirements" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "planRequirement" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "_id" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "manualOverrides" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateManualOverrideMutation,
  UpdateManualOverrideMutationVariables
>;
export const UpdateSelectedPlanRequirementsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateSelectedPlanRequirements" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "selectedPlanRequirements" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "SelectedPlanRequirementInput" },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateSelectedPlanRequirements" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "selectedPlanRequirements" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "selectedPlanRequirements" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "selectedPlanRequirements" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "planRequirement" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "_id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "code" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "isUcReq" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "college" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "major" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "minor" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "isOfficial" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "manualOverrides" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateSelectedPlanRequirementsMutation,
  UpdateSelectedPlanRequirementsMutationVariables
>;
export const GetAggregatedRatingsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetAggregatedRatings" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseNumber" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semester" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Semester" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "classNumber" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "aggregatedRatings" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseNumber" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semester" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semester" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "year" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "year" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "classNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "classNumber" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "metrics" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "metricName" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "count" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "weightedAverage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "categories" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "value" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "count" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAggregatedRatingsQuery,
  GetAggregatedRatingsQueryVariables
>;
export const GetSemestersWithRatingsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetSemestersWithRatings" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseNumber" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "semestersWithRatings" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseNumber" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                { kind: "Field", name: { kind: "Name", value: "year" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "maxMetricCount" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetSemestersWithRatingsQuery,
  GetSemestersWithRatingsQueryVariables
>;
export const CreateRatingsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateRatings" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseNumber" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semester" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Semester" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "classNumber" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "metrics" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "RatingMetricInput" },
                },
              },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "reviewTitle" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "reviewContent" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "reviewerGrade" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createRatings" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseNumber" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semester" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semester" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "year" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "year" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "classNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "classNumber" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "metrics" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "metrics" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "reviewTitle" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "reviewTitle" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "reviewContent" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "reviewContent" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "reviewerGrade" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "reviewerGrade" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateRatingsMutation,
  CreateRatingsMutationVariables
>;
export const DeleteRatingsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteRatings" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseNumber" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteRatings" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseNumber" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteRatingsMutation,
  DeleteRatingsMutationVariables
>;
export const GetUserRatingsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetUserRatings" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userRatings" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "subject" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "courseNumber" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "semester" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "year" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "classNumber" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "metrics" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "metricName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "value" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "reviewTitle" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "reviewContent" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "reviewerGrade" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lastUpdated" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUserRatingsQuery, GetUserRatingsQueryVariables>;
export const GetCourseRatingsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCourseRatings" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "number" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "course" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "number" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "aggregatedRatings" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "metrics" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "metricName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "count" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "weightedAverage" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "categories" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "value" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "count" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCourseRatingsQuery,
  GetCourseRatingsQueryVariables
>;
export const GetClassRatingsDataDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetClassRatingsData" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseNumber" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseNumberTyped" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CourseNumber" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "course" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "number" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseNumberTyped" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                { kind: "Field", name: { kind: "Name", value: "number" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "aggregatedRatings" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "metrics" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "metricName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "count" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "weightedAverage" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "categories" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "value" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "count" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "instructorAggregatedRatings" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "instructor" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "givenName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "familyName" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "aggregatedRatings" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "metrics" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "metricName" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "count" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "weightedAverage",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "categories" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "value",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "count",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "printInScheduleOnly" },
                      value: { kind: "BooleanValue", value: true },
                    },
                  ],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "semester" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "year" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "number" },
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "anyPrintInScheduleOfClasses",
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "primarySection" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "startDate" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "meetings" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "instructors",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "familyName",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "givenName",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "semestersWithRatings" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseNumber" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                { kind: "Field", name: { kind: "Name", value: "year" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "maxMetricCount" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetClassRatingsDataQuery,
  GetClassRatingsDataQueryVariables
>;
export const GetAllRatingsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetAllRatings" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "allRatings" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "anonymousUserId" },
                },
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "courseNumber" },
                },
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "classNumber" } },
                { kind: "Field", name: { kind: "Name", value: "metricName" } },
                { kind: "Field", name: { kind: "Name", value: "value" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAllRatingsQuery, GetAllRatingsQueryVariables>;
export const GetClassReviewsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetClassReviews" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "subject" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseNumber" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "classReviews" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "subject" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "subject" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseNumber" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseNumber" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "subject" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "courseNumber" },
                },
                { kind: "Field", name: { kind: "Name", value: "count" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "users" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "anonymousUserId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "classes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseNumber" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "semester" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "year" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "classNumber" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "professorName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "metrics" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "metricName" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "value" },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "reviewTitle" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "reviewContent" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "reviewerGrade" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "lastUpdated" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "reviewId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "helpfulCount" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetClassReviewsQuery,
  GetClassReviewsQueryVariables
>;
export const VoteReviewHelpfulDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "VoteReviewHelpful" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "reviewId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "voteReviewHelpful" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "reviewId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "reviewId" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  VoteReviewHelpfulMutation,
  VoteReviewHelpfulMutationVariables
>;
export const GetAllRouteRedirectsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetAllRouteRedirects" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "allRouteRedirects" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "fromPath" } },
                { kind: "Field", name: { kind: "Name", value: "toPath" } },
                { kind: "Field", name: { kind: "Name", value: "clickCount" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllRouteRedirectsQuery,
  GetAllRouteRedirectsQueryVariables
>;
export const IncrementRouteRedirectClickDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "IncrementRouteRedirectClick" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "redirectId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "incrementRouteRedirectClick" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "redirectId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "redirectId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "clickCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  IncrementRouteRedirectClickMutation,
  IncrementRouteRedirectClickMutationVariables
>;
export const ReadScheduleDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ReadSchedule" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "schedule" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "public" } },
                { kind: "Field", name: { kind: "Name", value: "createdBy" } },
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                { kind: "Field", name: { kind: "Name", value: "sessionId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "term" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endDate" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "events" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "_id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startTime" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endTime" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "days" } },
                      { kind: "Field", name: { kind: "Name", value: "color" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hidden" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "class" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseNumber" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "unitsMax" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "unitsMin" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "course" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "title" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "gradeDistribution",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "average",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "distribution",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "letter",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "count",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "primarySection" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "sectionId" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "subject" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "courseNumber",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "classNumber",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "number" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "startDate" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endDate" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "component" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "enrollment" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "latest",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "status",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "enrolledCount",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "maxEnroll",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "waitlistedCount",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "maxWaitlist",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "meetings" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "days" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "location",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "endTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "startTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "instructors",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "familyName",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "givenName",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "exams" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "date" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "type" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "location",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "startTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "endTime",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "sections" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "sectionId" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "subject" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "courseNumber",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "classNumber",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "number" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "startDate" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endDate" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "component" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "enrollment" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "latest",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "status",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "enrolledCount",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "maxEnroll",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "waitlistedCount",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "maxWaitlist",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "meetings" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "days" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "location",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "endTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "startTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "instructors",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "familyName",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "givenName",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "exams" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "date" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "type" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "location",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "startTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "endTime",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "selectedSections" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "sectionId" },
                            },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "color" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hidden" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "locked" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "blockedSections" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lockedComponents" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReadScheduleQuery, ReadScheduleQueryVariables>;
export const UpdateScheduleDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateSchedule" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "schedule" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateScheduleInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateSchedule" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "schedule" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "schedule" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "public" } },
                { kind: "Field", name: { kind: "Name", value: "createdBy" } },
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                { kind: "Field", name: { kind: "Name", value: "sessionId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "term" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endDate" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "events" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "_id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startTime" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endTime" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "days" } },
                      { kind: "Field", name: { kind: "Name", value: "color" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hidden" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "class" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseNumber" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "unitsMax" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "unitsMin" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "course" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "title" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "gradeDistribution",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "average",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "distribution",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "letter",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "count",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "primarySection" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "sectionId" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "subject" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "courseNumber",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "classNumber",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "number" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "startDate" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endDate" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "component" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "enrollment" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "latest",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "status",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "enrolledCount",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "maxEnroll",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "waitlistedCount",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "maxWaitlist",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "meetings" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "days" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "location",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "endTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "startTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "instructors",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "familyName",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "givenName",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "exams" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "date" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "type" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "location",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "startTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "endTime",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "sections" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "sectionId" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "subject" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "courseNumber",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "classNumber",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "number" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "startDate" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endDate" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "component" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "enrollment" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "latest",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "status",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "enrolledCount",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "maxEnroll",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "waitlistedCount",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "maxWaitlist",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "meetings" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "days" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "location",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "endTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "startTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "instructors",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "familyName",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "givenName",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "exams" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "date" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "type" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "location",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "startTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "endTime",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "selectedSections" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "sectionId" },
                            },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "color" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hidden" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "locked" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "blockedSections" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lockedComponents" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateScheduleMutation,
  UpdateScheduleMutationVariables
>;
export const DeleteScheduleDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteSchedule" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteSchedule" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteScheduleMutation,
  DeleteScheduleMutationVariables
>;
export const CreateScheduleDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateSchedule" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "schedule" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateScheduleInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createSchedule" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "schedule" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "schedule" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "public" } },
                { kind: "Field", name: { kind: "Name", value: "createdBy" } },
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                { kind: "Field", name: { kind: "Name", value: "sessionId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "term" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endDate" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "events" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "_id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startTime" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endTime" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "days" } },
                      { kind: "Field", name: { kind: "Name", value: "color" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hidden" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "class" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseNumber" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "unitsMax" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "unitsMin" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "course" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "title" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "gradeDistribution",
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "average",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "distribution",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "letter",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "count",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "primarySection" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "sectionId" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "subject" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "courseNumber",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "classNumber",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "number" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "startDate" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endDate" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "component" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "enrollment" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "latest",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "status",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "enrolledCount",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "maxEnroll",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "waitlistedCount",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "maxWaitlist",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "meetings" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "days" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "location",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "endTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "startTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "instructors",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "familyName",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "givenName",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "exams" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "date" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "type" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "location",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "startTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "endTime",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "sections" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "sectionId" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "subject" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "courseNumber",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "classNumber",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "number" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "startDate" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "endDate" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "component" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "enrollment" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "latest",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "status",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "enrolledCount",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "maxEnroll",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "waitlistedCount",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "maxWaitlist",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "meetings" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "days" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "location",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "endTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "startTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "instructors",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "familyName",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "givenName",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "exams" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "date" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "type" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "location",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "startTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "endTime",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "selectedSections" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "sectionId" },
                            },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "color" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hidden" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "locked" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "blockedSections" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lockedComponents" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateScheduleMutation,
  CreateScheduleMutationVariables
>;
export const ReadSchedulesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ReadSchedules" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "schedules" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                { kind: "Field", name: { kind: "Name", value: "sessionId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "events" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "_id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startTime" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endTime" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "days" } },
                      { kind: "Field", name: { kind: "Name", value: "color" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hidden" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "class" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "subject" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "courseNumber" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "number" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "primarySection" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "sectionId" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "number" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "component" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "meetings" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "days" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "endTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "startTime",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "sections" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "sectionId" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "number" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "component" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "meetings" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "days" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "endTime",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "startTime",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "selectedSections" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "sectionId" },
                            },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "color" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "hidden" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReadSchedulesQuery, ReadSchedulesQueryVariables>;
export const GetAllStaffMembersDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetAllStaffMembers" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "allStaffMembers" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "personalLink" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "roles" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "year" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "semester" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      { kind: "Field", name: { kind: "Name", value: "team" } },
                      { kind: "Field", name: { kind: "Name", value: "photo" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "altPhoto" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "isLeadership" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllStaffMembersQuery,
  GetAllStaffMembersQueryVariables
>;
export const GetTargetedMessagesForCourseDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetTargetedMessagesForCourse" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "courseId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "targetedMessagesForCourse" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "courseId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "courseId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "link" } },
                { kind: "Field", name: { kind: "Name", value: "linkText" } },
                { kind: "Field", name: { kind: "Name", value: "persistent" } },
                { kind: "Field", name: { kind: "Name", value: "reappearing" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetTargetedMessagesForCourseQuery,
  GetTargetedMessagesForCourseQueryVariables
>;
export const IncrementTargetedMessageDismissDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "IncrementTargetedMessageDismiss" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "messageId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "incrementTargetedMessageDismiss" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "messageId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "messageId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "dismissCount" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  IncrementTargetedMessageDismissMutation,
  IncrementTargetedMessageDismissMutationVariables
>;
export const GetTermsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetTerms" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "terms" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "withCatalogData" },
                value: { kind: "BooleanValue", value: true },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "temporalPosition" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "hasCatalogData" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sessions" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "temporalPosition" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "startDate" } },
                { kind: "Field", name: { kind: "Name", value: "endDate" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetTermsQuery, GetTermsQueryVariables>;
export const GetTermDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetTerm" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "year" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "semester" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Semester" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "term" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "year" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "year" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "semester" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "semester" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "year" } },
                { kind: "Field", name: { kind: "Name", value: "semester" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "temporalPosition" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sessions" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "endDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "temporalPosition" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "startDate" } },
                { kind: "Field", name: { kind: "Name", value: "endDate" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetTermQuery, GetTermQueryVariables>;
export const GetUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetUser" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "user" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "student" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUserQuery, GetUserQueryVariables>;
export const UpdateUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateUser" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "user" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateUserInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateUser" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "user" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "user" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "student" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const DeleteAccountDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteAccount" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "deleteAccount" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteAccountMutation,
  DeleteAccountMutationVariables
>;
