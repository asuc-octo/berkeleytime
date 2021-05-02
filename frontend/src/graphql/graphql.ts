import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * The `Date` scalar type represents a Date
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  Date: any;
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: any;
  /**
   * The `GenericScalar` scalar type represents a generic
   * GraphQL scalar value that could be:
   * String, Boolean, Int, Float, List or Object.
   */
  GenericScalar: any;
  /**
   * Allows use of a JSON String for input / output from the GraphQL schema.
   *
   * Use of this type is *not recommended* as you lose the benefits of having a defined, static
   * schema (one of the key benefits of GraphQL).
   */
  JSONString: any;
  /**
   * The `Time` scalar type represents a Time value as
   * specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  Time: any;
}

export interface BerkeleytimeUserType {
  __typename?: 'BerkeleytimeUserType';
  id: Scalars['ID'];
  user: UserType;
  major: Scalars['String'];
  savedClasses?: Maybe<Array<Maybe<CourseType>>>;
  emailClassUpdate?: Maybe<Scalars['Boolean']>;
  emailGradeUpdate?: Maybe<Scalars['Boolean']>;
  emailEnrollmentOpening?: Maybe<Scalars['Boolean']>;
  emailBerkeleytimeUpdate?: Maybe<Scalars['Boolean']>;
  schedules: ScheduleTypeConnection;
}


export interface BerkeleytimeUserTypeSchedulesArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
}

export interface CourseType extends Node {
  __typename?: 'CourseType';
  /** The ID of the object. */
  id: Scalars['ID'];
  title: Scalars['String'];
  department: Scalars['String'];
  abbreviation: Scalars['String'];
  courseNumber: Scalars['String'];
  description: Scalars['String'];
  units?: Maybe<Scalars['String']>;
  crossListing: CourseTypeConnection;
  prerequisites: Scalars['String'];
  gradeAverage?: Maybe<Scalars['Float']>;
  letterAverage: Scalars['String'];
  hasEnrollment: Scalars['Boolean'];
  enrolled: Scalars['Int'];
  enrolledMax: Scalars['Int'];
  enrolledPercentage: Scalars['Float'];
  waitlisted: Scalars['Int'];
  openSeats: Scalars['Int'];
  lastUpdated: Scalars['DateTime'];
  sectionSet: SectionTypeConnection;
  gradeSet: GradeTypeConnection;
  playlistSet: PlaylistTypeConnection;
  berkeleytimeuserSet: Array<BerkeleytimeUserType>;
  schedulerSections: SectionSelectionTypeConnection;
}


export interface CourseTypeCrossListingArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  department?: Maybe<Scalars['String']>;
  abbreviation?: Maybe<Scalars['String']>;
  courseNumber?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  units?: Maybe<Scalars['String']>;
  crossListing?: Maybe<Array<Maybe<Scalars['ID']>>>;
  prerequisites?: Maybe<Scalars['String']>;
  gradeAverage?: Maybe<Scalars['Float']>;
  letterAverage?: Maybe<Scalars['String']>;
  hasEnrollment?: Maybe<Scalars['Boolean']>;
  enrolled?: Maybe<Scalars['Int']>;
  enrolledMax?: Maybe<Scalars['Int']>;
  enrolledPercentage?: Maybe<Scalars['Float']>;
  waitlisted?: Maybe<Scalars['Int']>;
  openSeats?: Maybe<Scalars['Int']>;
  lastUpdated?: Maybe<Scalars['DateTime']>;
  hasGrades?: Maybe<Scalars['Boolean']>;
  inPlaylists?: Maybe<Scalars['String']>;
  idIn?: Maybe<Scalars['String']>;
}


export interface CourseTypeSectionSetArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  course?: Maybe<Scalars['ID']>;
  abbreviation?: Maybe<Scalars['String']>;
  courseNumber?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['String']>;
  semester?: Maybe<Scalars['String']>;
  courseTitle?: Maybe<Scalars['String']>;
  sectionNumber?: Maybe<Scalars['String']>;
  ccn?: Maybe<Scalars['String']>;
  kind?: Maybe<Scalars['String']>;
  isPrimary?: Maybe<Scalars['Boolean']>;
  associatedSections?: Maybe<Array<Maybe<Scalars['ID']>>>;
  days?: Maybe<Scalars['String']>;
  startTime?: Maybe<Scalars['DateTime']>;
  endTime?: Maybe<Scalars['DateTime']>;
  finalDay?: Maybe<Scalars['String']>;
  finalEnd?: Maybe<Scalars['DateTime']>;
  finalStart?: Maybe<Scalars['DateTime']>;
  instructor?: Maybe<Scalars['String']>;
  disabled?: Maybe<Scalars['Boolean']>;
  locationName?: Maybe<Scalars['String']>;
  instructionMode?: Maybe<Scalars['String']>;
  lastUpdated?: Maybe<Scalars['DateTime']>;
  enrolled?: Maybe<Scalars['Int']>;
  enrolledMax?: Maybe<Scalars['Int']>;
  waitlisted?: Maybe<Scalars['Int']>;
  waitlistedMax?: Maybe<Scalars['Int']>;
}


export interface CourseTypeGradeSetArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  course?: Maybe<Scalars['ID']>;
  semester?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['String']>;
  abbreviation?: Maybe<Scalars['String']>;
  courseNumber?: Maybe<Scalars['String']>;
  sectionNumber?: Maybe<Scalars['String']>;
  instructor?: Maybe<Scalars['String']>;
  gradedTotal?: Maybe<Scalars['Int']>;
  average?: Maybe<Scalars['Float']>;
}


export interface CourseTypePlaylistSetArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  category?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  semester?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['String']>;
  courses?: Maybe<Array<Maybe<Scalars['ID']>>>;
}


export interface CourseTypeSchedulerSectionsArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
}

export interface CourseTypeConnection {
  __typename?: 'CourseTypeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<CourseTypeEdge>>;
}

/** A Relay edge containing a `CourseType` and its cursor. */
export interface CourseTypeEdge {
  __typename?: 'CourseTypeEdge';
  /** The item at the end of the edge */
  node?: Maybe<CourseType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
}

export interface CreateSchedule {
  __typename?: 'CreateSchedule';
  schedule?: Maybe<ScheduleType>;
}



export interface DeleteUser {
  __typename?: 'DeleteUser';
  success?: Maybe<Scalars['Boolean']>;
}

/**
 * Proxy for enrollment object. Using this instead of
 * a DjangoObjectType gives us higher flexibility of the data.
 */
export interface EnrollmentData {
  __typename?: 'EnrollmentData';
  day?: Maybe<Scalars['Int']>;
  dateCreated?: Maybe<Scalars['Date']>;
  enrolled?: Maybe<Scalars['Int']>;
  enrolledMax?: Maybe<Scalars['Int']>;
  enrolledPercent?: Maybe<Scalars['Float']>;
  waitlisted?: Maybe<Scalars['Int']>;
  waitlistedMax?: Maybe<Scalars['Int']>;
  waitlistedPercent?: Maybe<Scalars['Float']>;
}

/** The return format of both queries  */
export interface EnrollmentInfo {
  __typename?: 'EnrollmentInfo';
  course?: Maybe<CourseType>;
  section?: Maybe<Array<Maybe<SectionType>>>;
  telebears?: Maybe<TelebearData>;
  data?: Maybe<Array<Maybe<EnrollmentData>>>;
  enrolledMax?: Maybe<Scalars['Int']>;
  enrolledPercentMax?: Maybe<Scalars['Float']>;
  enrolledScaleMax?: Maybe<Scalars['Int']>;
  waitlistedMax?: Maybe<Scalars['Int']>;
  waitlistedPercentMax?: Maybe<Scalars['Float']>;
  waitlistedScaleMax?: Maybe<Scalars['Int']>;
}

export interface FormConfigType {
  __typename?: 'FormConfigType';
  field?: Maybe<Scalars['JSONString']>;
}


export interface GradeType extends Node {
  __typename?: 'GradeType';
  /** The ID of the object. */
  id: Scalars['ID'];
  course: CourseType;
  semester: Scalars['String'];
  year: Scalars['String'];
  abbreviation: Scalars['String'];
  courseNumber: Scalars['String'];
  sectionNumber: Scalars['String'];
  instructor: Scalars['String'];
  instructors: Array<Scalars['String']>;
  gradedTotal: Scalars['Int'];
  average: Scalars['Float'];
  distribution?: Maybe<Array<Maybe<LetterGradeType>>>;
  sectionGpa?: Maybe<Scalars['Float']>;
  sectionLetter?: Maybe<Scalars['String']>;
  denominator?: Maybe<Scalars['Int']>;
}

export interface GradeTypeConnection {
  __typename?: 'GradeTypeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<GradeTypeEdge>>;
}

/** A Relay edge containing a `GradeType` and its cursor. */
export interface GradeTypeEdge {
  __typename?: 'GradeTypeEdge';
  /** The item at the end of the edge */
  node?: Maybe<GradeType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
}


export interface LetterGradeType {
  __typename?: 'LetterGradeType';
  letter?: Maybe<Scalars['String']>;
  numerator?: Maybe<Scalars['Int']>;
  percent?: Maybe<Scalars['Float']>;
  percentileHigh?: Maybe<Scalars['Float']>;
  percentileLow?: Maybe<Scalars['Float']>;
}

export interface Logout {
  __typename?: 'Logout';
  success?: Maybe<Scalars['Boolean']>;
}

export interface Mutation {
  __typename?: 'Mutation';
  createSchedule?: Maybe<CreateSchedule>;
  updateSchedule?: Maybe<UpdateSchedule>;
  removeSchedule?: Maybe<RemoveSchedule>;
  updateUser?: Maybe<UpdateUser>;
  saveClass?: Maybe<SaveClass>;
  removeClass?: Maybe<RemoveClass>;
  /** Login mutation using graphql_jwt  */
  login?: Maybe<ObtainJsonWebToken>;
  logout?: Maybe<Logout>;
  verifyToken?: Maybe<Verify>;
  refreshToken?: Maybe<Refresh>;
  deleteUser?: Maybe<DeleteUser>;
}


export interface MutationCreateScheduleArgs {
  name?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  selectedSections?: Maybe<Array<Maybe<SectionSelectionInput>>>;
  semester?: Maybe<Scalars['String']>;
  timeblocks?: Maybe<Array<Maybe<TimeBlockInput>>>;
  totalUnits?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['String']>;
}


export interface MutationUpdateScheduleArgs {
  name?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  scheduleId?: Maybe<Scalars['ID']>;
  selectedSections?: Maybe<Array<Maybe<SectionSelectionInput>>>;
  timeblocks?: Maybe<Array<Maybe<TimeBlockInput>>>;
  totalUnits?: Maybe<Scalars['String']>;
}


export interface MutationRemoveScheduleArgs {
  scheduleId?: Maybe<Scalars['ID']>;
}


export interface MutationUpdateUserArgs {
  emailBerkeleytimeUpdate?: Maybe<Scalars['Boolean']>;
  emailClassUpdate?: Maybe<Scalars['Boolean']>;
  emailEnrollmentOpening?: Maybe<Scalars['Boolean']>;
  emailGradeUpdate?: Maybe<Scalars['Boolean']>;
  major?: Maybe<Scalars['String']>;
}


export interface MutationSaveClassArgs {
  classId?: Maybe<Scalars['ID']>;
}


export interface MutationRemoveClassArgs {
  classId?: Maybe<Scalars['ID']>;
}


export interface MutationLoginArgs {
  tokenId?: Maybe<Scalars['String']>;
}


export interface MutationVerifyTokenArgs {
  token?: Maybe<Scalars['String']>;
}


export interface MutationRefreshTokenArgs {
  token?: Maybe<Scalars['String']>;
}

/** An object with an ID */
export interface Node {
  /** The ID of the object. */
  id: Scalars['ID'];
}

/** Login mutation using graphql_jwt  */
export interface ObtainJsonWebToken {
  __typename?: 'ObtainJSONWebToken';
  payload: Scalars['GenericScalar'];
  refreshExpiresIn: Scalars['Int'];
  user?: Maybe<BerkeleytimeUserType>;
  newUser?: Maybe<Scalars['Boolean']>;
}

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export interface PageInfo {
  __typename?: 'PageInfo';
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
}

export interface PlaylistType extends Node {
  __typename?: 'PlaylistType';
  /** The ID of the object. */
  id: Scalars['ID'];
  category: Scalars['String'];
  name: Scalars['String'];
  semester: Scalars['String'];
  year: Scalars['String'];
  courses: CourseTypeConnection;
}


export interface PlaylistTypeCoursesArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  department?: Maybe<Scalars['String']>;
  abbreviation?: Maybe<Scalars['String']>;
  courseNumber?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  units?: Maybe<Scalars['String']>;
  crossListing?: Maybe<Array<Maybe<Scalars['ID']>>>;
  prerequisites?: Maybe<Scalars['String']>;
  gradeAverage?: Maybe<Scalars['Float']>;
  letterAverage?: Maybe<Scalars['String']>;
  hasEnrollment?: Maybe<Scalars['Boolean']>;
  enrolled?: Maybe<Scalars['Int']>;
  enrolledMax?: Maybe<Scalars['Int']>;
  enrolledPercentage?: Maybe<Scalars['Float']>;
  waitlisted?: Maybe<Scalars['Int']>;
  openSeats?: Maybe<Scalars['Int']>;
  lastUpdated?: Maybe<Scalars['DateTime']>;
  hasGrades?: Maybe<Scalars['Boolean']>;
  inPlaylists?: Maybe<Scalars['String']>;
  idIn?: Maybe<Scalars['String']>;
}

export interface PlaylistTypeConnection {
  __typename?: 'PlaylistTypeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<PlaylistTypeEdge>>;
}

/** A Relay edge containing a `PlaylistType` and its cursor. */
export interface PlaylistTypeEdge {
  __typename?: 'PlaylistTypeEdge';
  /** The item at the end of the edge */
  node?: Maybe<PlaylistType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
}

export interface Query {
  __typename?: 'Query';
  schedules?: Maybe<Array<Maybe<ScheduleType>>>;
  schedule?: Maybe<ScheduleType>;
  user?: Maybe<BerkeleytimeUserType>;
  allPlaylists?: Maybe<PlaylistTypeConnection>;
  /** The ID of the object */
  playlist?: Maybe<PlaylistType>;
  allGrades?: Maybe<GradeTypeConnection>;
  /** The ID of the object */
  grade?: Maybe<GradeType>;
  formConfig?: Maybe<FormConfigType>;
  courseEnrollmentBySection?: Maybe<EnrollmentInfo>;
  courseEnrollmentBySemester?: Maybe<EnrollmentInfo>;
  /** The ID of the object */
  course?: Maybe<CourseType>;
  allCourses?: Maybe<CourseTypeConnection>;
  /** The ID of the object */
  section?: Maybe<SectionType>;
  allSections?: Maybe<SectionTypeConnection>;
  ping?: Maybe<Scalars['String']>;
}


export interface QueryScheduleArgs {
  id?: Maybe<Scalars['ID']>;
}


export interface QueryAllPlaylistsArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  category?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  semester?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['String']>;
  courses?: Maybe<Array<Maybe<Scalars['ID']>>>;
}


export interface QueryPlaylistArgs {
  id: Scalars['ID'];
}


export interface QueryAllGradesArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  course?: Maybe<Scalars['ID']>;
  semester?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['String']>;
  abbreviation?: Maybe<Scalars['String']>;
  courseNumber?: Maybe<Scalars['String']>;
  sectionNumber?: Maybe<Scalars['String']>;
  instructor?: Maybe<Scalars['String']>;
  gradedTotal?: Maybe<Scalars['Int']>;
  average?: Maybe<Scalars['Float']>;
}


export interface QueryGradeArgs {
  id: Scalars['ID'];
}


export interface QueryCourseEnrollmentBySectionArgs {
  sectionId?: Maybe<Scalars['ID']>;
}


export interface QueryCourseEnrollmentBySemesterArgs {
  courseId?: Maybe<Scalars['ID']>;
  semester?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['Int']>;
}


export interface QueryCourseArgs {
  id: Scalars['ID'];
}


export interface QueryAllCoursesArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  department?: Maybe<Scalars['String']>;
  abbreviation?: Maybe<Scalars['String']>;
  courseNumber?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  units?: Maybe<Scalars['String']>;
  crossListing?: Maybe<Array<Maybe<Scalars['ID']>>>;
  prerequisites?: Maybe<Scalars['String']>;
  gradeAverage?: Maybe<Scalars['Float']>;
  letterAverage?: Maybe<Scalars['String']>;
  hasEnrollment?: Maybe<Scalars['Boolean']>;
  enrolled?: Maybe<Scalars['Int']>;
  enrolledMax?: Maybe<Scalars['Int']>;
  enrolledPercentage?: Maybe<Scalars['Float']>;
  waitlisted?: Maybe<Scalars['Int']>;
  openSeats?: Maybe<Scalars['Int']>;
  lastUpdated?: Maybe<Scalars['DateTime']>;
  hasGrades?: Maybe<Scalars['Boolean']>;
  inPlaylists?: Maybe<Scalars['String']>;
  idIn?: Maybe<Scalars['String']>;
}


export interface QuerySectionArgs {
  id: Scalars['ID'];
}


export interface QueryAllSectionsArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  course?: Maybe<Scalars['ID']>;
  abbreviation?: Maybe<Scalars['String']>;
  courseNumber?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['String']>;
  semester?: Maybe<Scalars['String']>;
  courseTitle?: Maybe<Scalars['String']>;
  sectionNumber?: Maybe<Scalars['String']>;
  ccn?: Maybe<Scalars['String']>;
  kind?: Maybe<Scalars['String']>;
  isPrimary?: Maybe<Scalars['Boolean']>;
  associatedSections?: Maybe<Array<Maybe<Scalars['ID']>>>;
  days?: Maybe<Scalars['String']>;
  startTime?: Maybe<Scalars['DateTime']>;
  endTime?: Maybe<Scalars['DateTime']>;
  finalDay?: Maybe<Scalars['String']>;
  finalEnd?: Maybe<Scalars['DateTime']>;
  finalStart?: Maybe<Scalars['DateTime']>;
  instructor?: Maybe<Scalars['String']>;
  disabled?: Maybe<Scalars['Boolean']>;
  locationName?: Maybe<Scalars['String']>;
  instructionMode?: Maybe<Scalars['String']>;
  lastUpdated?: Maybe<Scalars['DateTime']>;
  enrolled?: Maybe<Scalars['Int']>;
  enrolledMax?: Maybe<Scalars['Int']>;
  waitlisted?: Maybe<Scalars['Int']>;
  waitlistedMax?: Maybe<Scalars['Int']>;
}

export interface Refresh {
  __typename?: 'Refresh';
  payload: Scalars['GenericScalar'];
  refreshExpiresIn: Scalars['Int'];
}

export interface RemoveClass {
  __typename?: 'RemoveClass';
  user?: Maybe<BerkeleytimeUserType>;
}

export interface RemoveSchedule {
  __typename?: 'RemoveSchedule';
  schedule?: Maybe<ScheduleType>;
}

export interface SaveClass {
  __typename?: 'SaveClass';
  user?: Maybe<BerkeleytimeUserType>;
}

export interface ScheduleType extends Node {
  __typename?: 'ScheduleType';
  /** The ID of the object. */
  id: Scalars['ID'];
  user: BerkeleytimeUserType;
  name: Scalars['String'];
  year: Scalars['String'];
  semester: Scalars['String'];
  dateCreated: Scalars['DateTime'];
  dateModified: Scalars['DateTime'];
  totalUnits: Scalars['String'];
  public: Scalars['Boolean'];
  selectedSections: SectionSelectionTypeConnection;
  timeblocks: TimeBlockTypeConnection;
}


export interface ScheduleTypeSelectedSectionsArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
}


export interface ScheduleTypeTimeblocksArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
}

export interface ScheduleTypeConnection {
  __typename?: 'ScheduleTypeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ScheduleTypeEdge>>;
}

/** A Relay edge containing a `ScheduleType` and its cursor. */
export interface ScheduleTypeEdge {
  __typename?: 'ScheduleTypeEdge';
  /** The item at the end of the edge */
  node?: Maybe<ScheduleType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
}

export interface SectionSelectionInput {
  course: Scalars['ID'];
  primary?: Maybe<Scalars['ID']>;
  secondary?: Maybe<Array<Maybe<Scalars['ID']>>>;
}

export interface SectionSelectionType extends Node {
  __typename?: 'SectionSelectionType';
  /** The ID of the object. */
  id: Scalars['ID'];
  schedule: ScheduleType;
  course: CourseType;
  primary?: Maybe<SectionType>;
  secondary: SectionTypeConnection;
}


export interface SectionSelectionTypeSecondaryArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  course?: Maybe<Scalars['ID']>;
  abbreviation?: Maybe<Scalars['String']>;
  courseNumber?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['String']>;
  semester?: Maybe<Scalars['String']>;
  courseTitle?: Maybe<Scalars['String']>;
  sectionNumber?: Maybe<Scalars['String']>;
  ccn?: Maybe<Scalars['String']>;
  kind?: Maybe<Scalars['String']>;
  isPrimary?: Maybe<Scalars['Boolean']>;
  associatedSections?: Maybe<Array<Maybe<Scalars['ID']>>>;
  days?: Maybe<Scalars['String']>;
  startTime?: Maybe<Scalars['DateTime']>;
  endTime?: Maybe<Scalars['DateTime']>;
  finalDay?: Maybe<Scalars['String']>;
  finalEnd?: Maybe<Scalars['DateTime']>;
  finalStart?: Maybe<Scalars['DateTime']>;
  instructor?: Maybe<Scalars['String']>;
  disabled?: Maybe<Scalars['Boolean']>;
  locationName?: Maybe<Scalars['String']>;
  instructionMode?: Maybe<Scalars['String']>;
  lastUpdated?: Maybe<Scalars['DateTime']>;
  enrolled?: Maybe<Scalars['Int']>;
  enrolledMax?: Maybe<Scalars['Int']>;
  waitlisted?: Maybe<Scalars['Int']>;
  waitlistedMax?: Maybe<Scalars['Int']>;
}

export interface SectionSelectionTypeConnection {
  __typename?: 'SectionSelectionTypeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<SectionSelectionTypeEdge>>;
}

/** A Relay edge containing a `SectionSelectionType` and its cursor. */
export interface SectionSelectionTypeEdge {
  __typename?: 'SectionSelectionTypeEdge';
  /** The item at the end of the edge */
  node?: Maybe<SectionSelectionType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
}

export interface SectionType extends Node {
  __typename?: 'SectionType';
  /** The ID of the object. */
  id: Scalars['ID'];
  course: CourseType;
  abbreviation: Scalars['String'];
  courseNumber: Scalars['String'];
  year: Scalars['String'];
  semester: Scalars['String'];
  courseTitle: Scalars['String'];
  sectionNumber: Scalars['String'];
  ccn: Scalars['String'];
  kind: Scalars['String'];
  isPrimary: Scalars['Boolean'];
  associatedSections: SectionTypeConnection;
  days: Scalars['String'];
  startTime?: Maybe<Scalars['DateTime']>;
  endTime?: Maybe<Scalars['DateTime']>;
  finalDay: Scalars['String'];
  finalEnd?: Maybe<Scalars['DateTime']>;
  finalStart?: Maybe<Scalars['DateTime']>;
  instructor: Scalars['String'];
  disabled: Scalars['Boolean'];
  locationName: Scalars['String'];
  instructionMode: Scalars['String'];
  lastUpdated: Scalars['DateTime'];
  enrolled?: Maybe<Scalars['Int']>;
  enrolledMax?: Maybe<Scalars['Int']>;
  waitlisted?: Maybe<Scalars['Int']>;
  waitlistedMax?: Maybe<Scalars['Int']>;
  schedulerPrimarySections: SectionSelectionTypeConnection;
  schedulerSecondarySections: SectionSelectionTypeConnection;
  wordDays?: Maybe<Scalars['String']>;
}


export interface SectionTypeAssociatedSectionsArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  course?: Maybe<Scalars['ID']>;
  abbreviation?: Maybe<Scalars['String']>;
  courseNumber?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['String']>;
  semester?: Maybe<Scalars['String']>;
  courseTitle?: Maybe<Scalars['String']>;
  sectionNumber?: Maybe<Scalars['String']>;
  ccn?: Maybe<Scalars['String']>;
  kind?: Maybe<Scalars['String']>;
  isPrimary?: Maybe<Scalars['Boolean']>;
  associatedSections?: Maybe<Array<Maybe<Scalars['ID']>>>;
  days?: Maybe<Scalars['String']>;
  startTime?: Maybe<Scalars['DateTime']>;
  endTime?: Maybe<Scalars['DateTime']>;
  finalDay?: Maybe<Scalars['String']>;
  finalEnd?: Maybe<Scalars['DateTime']>;
  finalStart?: Maybe<Scalars['DateTime']>;
  instructor?: Maybe<Scalars['String']>;
  disabled?: Maybe<Scalars['Boolean']>;
  locationName?: Maybe<Scalars['String']>;
  instructionMode?: Maybe<Scalars['String']>;
  lastUpdated?: Maybe<Scalars['DateTime']>;
  enrolled?: Maybe<Scalars['Int']>;
  enrolledMax?: Maybe<Scalars['Int']>;
  waitlisted?: Maybe<Scalars['Int']>;
  waitlistedMax?: Maybe<Scalars['Int']>;
}


export interface SectionTypeSchedulerPrimarySectionsArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
}


export interface SectionTypeSchedulerSecondarySectionsArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
}

export interface SectionTypeConnection {
  __typename?: 'SectionTypeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<SectionTypeEdge>>;
}

/** A Relay edge containing a `SectionType` and its cursor. */
export interface SectionTypeEdge {
  __typename?: 'SectionTypeEdge';
  /** The item at the end of the edge */
  node?: Maybe<SectionType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
}

/** Telebears JSON  */
export interface TelebearData {
  __typename?: 'TelebearData';
  phase1Start?: Maybe<Scalars['Date']>;
  phase1End?: Maybe<Scalars['Date']>;
  phase2Start?: Maybe<Scalars['Date']>;
  phase2End?: Maybe<Scalars['Date']>;
  adjStart?: Maybe<Scalars['Date']>;
}


export interface TimeBlockInput {
  name: Scalars['String'];
  startTime: Scalars['Time'];
  endTime: Scalars['Time'];
  days: Scalars['String'];
}

export interface TimeBlockType extends Node {
  __typename?: 'TimeBlockType';
  /** The ID of the object. */
  id: Scalars['ID'];
  name: Scalars['String'];
  startTime: Scalars['Time'];
  endTime: Scalars['Time'];
  days: Scalars['String'];
  schedule: ScheduleType;
}

export interface TimeBlockTypeConnection {
  __typename?: 'TimeBlockTypeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<TimeBlockTypeEdge>>;
}

/** A Relay edge containing a `TimeBlockType` and its cursor. */
export interface TimeBlockTypeEdge {
  __typename?: 'TimeBlockTypeEdge';
  /** The item at the end of the edge */
  node?: Maybe<TimeBlockType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
}

export interface UpdateSchedule {
  __typename?: 'UpdateSchedule';
  schedule?: Maybe<ScheduleType>;
}

export interface UpdateUser {
  __typename?: 'UpdateUser';
  user?: Maybe<BerkeleytimeUserType>;
}

export interface UserType {
  __typename?: 'UserType';
  id: Scalars['ID'];
  /** Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. */
  username: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email: Scalars['String'];
}

export interface Verify {
  __typename?: 'Verify';
  payload: Scalars['GenericScalar'];
}

export type CourseFragment = (
  { __typename?: 'CourseType' }
  & Pick<CourseType, 'title' | 'units' | 'waitlisted' | 'openSeats' | 'letterAverage' | 'gradeAverage' | 'lastUpdated' | 'id' | 'hasEnrollment' | 'enrolledPercentage' | 'enrolledMax' | 'courseNumber' | 'department' | 'description' | 'enrolled' | 'abbreviation' | 'prerequisites'>
  & { playlistSet: (
    { __typename?: 'PlaylistTypeConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'PlaylistTypeEdge' }
      & { node?: Maybe<(
        { __typename?: 'PlaylistType' }
        & Pick<PlaylistType, 'category' | 'id' | 'name' | 'semester' | 'year'>
      )> }
    )>> }
  ), sectionSet: (
    { __typename?: 'SectionTypeConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'SectionTypeEdge' }
      & { node?: Maybe<(
        { __typename?: 'SectionType' }
        & SectionFragment
      )> }
    )>> }
  ) }
);

export type CourseOverviewFragment = (
  { __typename?: 'CourseType' }
  & Pick<CourseType, 'id' | 'abbreviation' | 'courseNumber' | 'description' | 'title' | 'gradeAverage' | 'letterAverage' | 'openSeats' | 'enrolledPercentage' | 'enrolled' | 'enrolledMax' | 'units'>
);

export type FilterFragment = (
  { __typename?: 'PlaylistType' }
  & Pick<PlaylistType, 'id' | 'name' | 'category'>
);

export type LectureFragment = (
  { __typename?: 'SectionType' }
  & { associatedSections: (
    { __typename?: 'SectionTypeConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'SectionTypeEdge' }
      & { node?: Maybe<(
        { __typename?: 'SectionType' }
        & SectionFragment
      )> }
    )>> }
  ) }
  & SectionFragment
);

export type ScheduleFragment = (
  { __typename?: 'ScheduleType' }
  & Pick<ScheduleType, 'id' | 'year' | 'semester' | 'name' | 'totalUnits' | 'dateCreated' | 'dateModified' | 'public'>
  & { user: (
    { __typename?: 'BerkeleytimeUserType' }
    & { user: (
      { __typename?: 'UserType' }
      & Pick<UserType, 'id' | 'firstName' | 'lastName'>
    ) }
  ), selectedSections: (
    { __typename?: 'SectionSelectionTypeConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'SectionSelectionTypeEdge' }
      & { node?: Maybe<(
        { __typename?: 'SectionSelectionType' }
        & SectionSelectionFragment
      )> }
    )>> }
  ) }
);

export type ScheduleOverviewFragment = (
  { __typename?: 'ScheduleType' }
  & Pick<ScheduleType, 'id' | 'year' | 'semester' | 'name' | 'totalUnits' | 'dateCreated' | 'dateModified'>
  & { selectedSections: (
    { __typename?: 'SectionSelectionTypeConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'SectionSelectionTypeEdge' }
      & { node?: Maybe<(
        { __typename?: 'SectionSelectionType' }
        & { course: (
          { __typename?: 'CourseType' }
          & Pick<CourseType, 'abbreviation' | 'courseNumber' | 'units'>
        ) }
      )> }
    )>> }
  ) }
);

export type SchedulerCourseFragment = (
  { __typename?: 'CourseType' }
  & Pick<CourseType, 'id' | 'title' | 'units' | 'waitlisted' | 'openSeats' | 'enrolled' | 'enrolledMax' | 'courseNumber' | 'department' | 'description' | 'abbreviation'>
  & { sectionSet: (
    { __typename?: 'SectionTypeConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'SectionTypeEdge' }
      & { node?: Maybe<(
        { __typename?: 'SectionType' }
        & LectureFragment
      )> }
    )>> }
  ) }
);

export type SectionFragment = (
  { __typename?: 'SectionType' }
  & Pick<SectionType, 'id' | 'ccn' | 'kind' | 'instructor' | 'startTime' | 'endTime' | 'enrolled' | 'enrolledMax' | 'locationName' | 'waitlisted' | 'waitlistedMax' | 'days' | 'wordDays' | 'disabled' | 'sectionNumber' | 'isPrimary'>
);

export type SectionSelectionFragment = (
  { __typename?: 'SectionSelectionType' }
  & Pick<SectionSelectionType, 'id'>
  & { course: (
    { __typename?: 'CourseType' }
    & CourseOverviewFragment
  ), primary?: Maybe<(
    { __typename?: 'SectionType' }
    & SectionFragment
  )>, secondary: (
    { __typename?: 'SectionTypeConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'SectionTypeEdge' }
      & { node?: Maybe<(
        { __typename?: 'SectionType' }
        & SectionFragment
      )> }
    )>> }
  ) }
);

export type UserProfileFragment = (
  { __typename?: 'BerkeleytimeUserType' }
  & Pick<BerkeleytimeUserType, 'id' | 'major' | 'emailClassUpdate' | 'emailGradeUpdate' | 'emailEnrollmentOpening' | 'emailBerkeleytimeUpdate'>
  & { user: (
    { __typename?: 'UserType' }
    & Pick<UserType, 'id' | 'username' | 'firstName' | 'lastName' | 'email'>
  ), savedClasses?: Maybe<Array<Maybe<(
    { __typename?: 'CourseType' }
    & CourseOverviewFragment
  )>>>, schedules: (
    { __typename?: 'ScheduleTypeConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'ScheduleTypeEdge' }
      & { node?: Maybe<(
        { __typename?: 'ScheduleType' }
        & ScheduleOverviewFragment
      )> }
    )>> }
  ) }
);

export type CreateScheduleMutationVariables = Exact<{
  name: Scalars['String'];
  selectedSections: Array<Maybe<SectionSelectionInput>> | Maybe<SectionSelectionInput>;
  timeblocks: Array<Maybe<TimeBlockInput>> | Maybe<TimeBlockInput>;
  totalUnits: Scalars['String'];
  semester: Scalars['String'];
  year: Scalars['String'];
  public: Scalars['Boolean'];
}>;


export type CreateScheduleMutation = (
  { __typename?: 'Mutation' }
  & { createSchedule?: Maybe<(
    { __typename?: 'CreateSchedule' }
    & { schedule?: Maybe<(
      { __typename?: 'ScheduleType' }
      & ScheduleFragment
    )> }
  )> }
);

export type DeleteScheduleMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteScheduleMutation = (
  { __typename?: 'Mutation' }
  & { removeSchedule?: Maybe<(
    { __typename?: 'RemoveSchedule' }
    & { schedule?: Maybe<(
      { __typename?: 'ScheduleType' }
      & Pick<ScheduleType, 'id'>
    )> }
  )> }
);

export type DeleteUserMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteUserMutation = (
  { __typename?: 'Mutation' }
  & { deleteUser?: Maybe<(
    { __typename?: 'DeleteUser' }
    & Pick<DeleteUser, 'success'>
  )> }
);

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & { logout?: Maybe<(
    { __typename?: 'Logout' }
    & Pick<Logout, 'success'>
  )> }
);

export type SaveCourseMutationVariables = Exact<{
  courseId: Scalars['ID'];
}>;


export type SaveCourseMutation = (
  { __typename?: 'Mutation' }
  & { saveClass?: Maybe<(
    { __typename?: 'SaveClass' }
    & { user?: Maybe<(
      { __typename?: 'BerkeleytimeUserType' }
      & Pick<BerkeleytimeUserType, 'id'>
      & { savedClasses?: Maybe<Array<Maybe<(
        { __typename?: 'CourseType' }
        & CourseOverviewFragment
      )>>> }
    )> }
  )> }
);

export type UnsaveCourseMutationVariables = Exact<{
  courseId: Scalars['ID'];
}>;


export type UnsaveCourseMutation = (
  { __typename?: 'Mutation' }
  & { removeClass?: Maybe<(
    { __typename?: 'RemoveClass' }
    & { user?: Maybe<(
      { __typename?: 'BerkeleytimeUserType' }
      & Pick<BerkeleytimeUserType, 'id'>
      & { savedClasses?: Maybe<Array<Maybe<(
        { __typename?: 'CourseType' }
        & CourseOverviewFragment
      )>>> }
    )> }
  )> }
);

export type UpdateScheduleMutationVariables = Exact<{
  scheduleId: Scalars['ID'];
  name: Scalars['String'];
  selectedSections: Array<Maybe<SectionSelectionInput>> | Maybe<SectionSelectionInput>;
  timeblocks: Array<Maybe<TimeBlockInput>> | Maybe<TimeBlockInput>;
  totalUnits: Scalars['String'];
  public: Scalars['Boolean'];
}>;


export type UpdateScheduleMutation = (
  { __typename?: 'Mutation' }
  & { updateSchedule?: Maybe<(
    { __typename?: 'UpdateSchedule' }
    & { schedule?: Maybe<(
      { __typename?: 'ScheduleType' }
      & ScheduleFragment
    )> }
  )> }
);

export type UpdateUserMutationVariables = Exact<{
  emailBerkeleytimeUpdate?: Maybe<Scalars['Boolean']>;
  emailClassUpdate?: Maybe<Scalars['Boolean']>;
  emailEnrollmentOpening?: Maybe<Scalars['Boolean']>;
  emailGradeUpdate?: Maybe<Scalars['Boolean']>;
  major?: Maybe<Scalars['String']>;
}>;


export type UpdateUserMutation = (
  { __typename?: 'Mutation' }
  & { updateUser?: Maybe<(
    { __typename?: 'UpdateUser' }
    & { user?: Maybe<(
      { __typename?: 'BerkeleytimeUserType' }
      & Pick<BerkeleytimeUserType, 'id' | 'major' | 'emailGradeUpdate' | 'emailEnrollmentOpening' | 'emailClassUpdate' | 'emailBerkeleytimeUpdate'>
    )> }
  )> }
);

export type LoginMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login?: Maybe<(
    { __typename?: 'ObtainJSONWebToken' }
    & Pick<ObtainJsonWebToken, 'newUser' | 'refreshExpiresIn' | 'payload'>
    & { user?: Maybe<(
      { __typename?: 'BerkeleytimeUserType' }
      & UserProfileFragment
    )> }
  )> }
);

export type GetCourseForIdQueryVariables = Exact<{
  id: Scalars['ID'];
  year?: Maybe<Scalars['String']>;
  semester?: Maybe<Scalars['String']>;
}>;


export type GetCourseForIdQuery = (
  { __typename?: 'Query' }
  & { course?: Maybe<(
    { __typename?: 'CourseType' }
    & CourseFragment
  )> }
);

export type GetCourseForNameQueryVariables = Exact<{
  abbreviation: Scalars['String'];
  courseNumber: Scalars['String'];
  year?: Maybe<Scalars['String']>;
  semester?: Maybe<Scalars['String']>;
}>;


export type GetCourseForNameQuery = (
  { __typename?: 'Query' }
  & { allCourses?: Maybe<(
    { __typename?: 'CourseTypeConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'CourseTypeEdge' }
      & { node?: Maybe<(
        { __typename?: 'CourseType' }
        & CourseFragment
      )> }
    )>> }
  )> }
);

export type GetCoursesForFilterQueryVariables = Exact<{
  playlists: Scalars['String'];
}>;


export type GetCoursesForFilterQuery = (
  { __typename?: 'Query' }
  & { allCourses?: Maybe<(
    { __typename?: 'CourseTypeConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'CourseTypeEdge' }
      & { node?: Maybe<(
        { __typename?: 'CourseType' }
        & CourseOverviewFragment
      )> }
    )>> }
  )> }
);

export type GetFiltersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFiltersQuery = (
  { __typename?: 'Query' }
  & { allPlaylists?: Maybe<(
    { __typename?: 'PlaylistTypeConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'PlaylistTypeEdge' }
      & { node?: Maybe<(
        { __typename?: 'PlaylistType' }
        & FilterFragment
      )> }
    )>> }
  )> }
);

export type GetScheduleForIdQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetScheduleForIdQuery = (
  { __typename?: 'Query' }
  & { schedule?: Maybe<(
    { __typename?: 'ScheduleType' }
    & ScheduleFragment
  )> }
);

export type GetSchedulerCourseForIdQueryVariables = Exact<{
  id: Scalars['ID'];
  year?: Maybe<Scalars['String']>;
  semester?: Maybe<Scalars['String']>;
}>;


export type GetSchedulerCourseForIdQuery = (
  { __typename?: 'Query' }
  & { course?: Maybe<(
    { __typename?: 'CourseType' }
    & SchedulerCourseFragment
  )> }
);

export type GetSemestersQueryVariables = Exact<{
  name?: Maybe<Scalars['String']>;
}>;


export type GetSemestersQuery = (
  { __typename?: 'Query' }
  & { allPlaylists?: Maybe<(
    { __typename?: 'PlaylistTypeConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'PlaylistTypeEdge' }
      & { node?: Maybe<(
        { __typename?: 'PlaylistType' }
        & FilterFragment
      )> }
    )>> }
  )> }
);

export type GetUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserQuery = (
  { __typename?: 'Query' }
  & { user?: Maybe<(
    { __typename?: 'BerkeleytimeUserType' }
    & UserProfileFragment
  )> }
);

export type StubQueryVariables = Exact<{ [key: string]: never; }>;


export type StubQuery = { __typename: 'Query' };

export const SectionFragmentDoc = gql`
    fragment Section on SectionType {
  id
  ccn
  kind
  instructor
  startTime
  endTime
  enrolled
  enrolledMax
  locationName
  waitlisted
  waitlistedMax
  days
  wordDays
  disabled
  sectionNumber
  isPrimary
}
    `;
export const CourseFragmentDoc = gql`
    fragment Course on CourseType {
  title
  units
  waitlisted
  openSeats
  letterAverage
  gradeAverage
  lastUpdated
  id
  hasEnrollment
  gradeAverage
  enrolledPercentage
  enrolledMax
  courseNumber
  department
  description
  enrolled
  abbreviation
  prerequisites
  playlistSet {
    edges {
      node {
        category
        id
        name
        semester
        year
      }
    }
  }
  sectionSet(year: $year, semester: $semester) {
    edges {
      node {
        ...Section
      }
    }
  }
}
    ${SectionFragmentDoc}`;
export const FilterFragmentDoc = gql`
    fragment Filter on PlaylistType {
  id
  name
  category
}
    `;
export const CourseOverviewFragmentDoc = gql`
    fragment CourseOverview on CourseType {
  id
  abbreviation
  courseNumber
  description
  title
  gradeAverage
  letterAverage
  openSeats
  enrolledPercentage
  enrolled
  enrolledMax
  units
}
    `;
export const SectionSelectionFragmentDoc = gql`
    fragment SectionSelection on SectionSelectionType {
  id
  course {
    ...CourseOverview
  }
  primary {
    ...Section
  }
  secondary {
    edges {
      node {
        ...Section
      }
    }
  }
}
    ${CourseOverviewFragmentDoc}
${SectionFragmentDoc}`;
export const ScheduleFragmentDoc = gql`
    fragment Schedule on ScheduleType {
  id
  year
  semester
  name
  totalUnits
  dateCreated
  dateModified
  public
  user {
    user {
      id
      firstName
      lastName
    }
  }
  selectedSections {
    edges {
      node {
        ...SectionSelection
      }
    }
  }
}
    ${SectionSelectionFragmentDoc}`;
export const LectureFragmentDoc = gql`
    fragment Lecture on SectionType {
  ...Section
  associatedSections {
    edges {
      node {
        ...Section
      }
    }
  }
}
    ${SectionFragmentDoc}`;
export const SchedulerCourseFragmentDoc = gql`
    fragment SchedulerCourse on CourseType {
  id
  title
  units
  waitlisted
  openSeats
  enrolled
  enrolledMax
  courseNumber
  department
  description
  abbreviation
  sectionSet(isPrimary: true, year: $year, semester: $semester) {
    edges {
      node {
        ...Lecture
      }
    }
  }
}
    ${LectureFragmentDoc}`;
export const ScheduleOverviewFragmentDoc = gql`
    fragment ScheduleOverview on ScheduleType {
  id
  year
  semester
  name
  totalUnits
  dateCreated
  dateModified
  selectedSections {
    edges {
      node {
        course {
          abbreviation
          courseNumber
          units
        }
      }
    }
  }
}
    `;
export const UserProfileFragmentDoc = gql`
    fragment UserProfile on BerkeleytimeUserType {
  id
  major
  user {
    id
    username
    firstName
    lastName
    email
  }
  emailClassUpdate
  emailGradeUpdate
  emailEnrollmentOpening
  emailBerkeleytimeUpdate
  savedClasses {
    ...CourseOverview
  }
  schedules {
    edges {
      node {
        ...ScheduleOverview
      }
    }
  }
}
    ${CourseOverviewFragmentDoc}
${ScheduleOverviewFragmentDoc}`;
export const CreateScheduleDocument = gql`
    mutation CreateSchedule($name: String!, $selectedSections: [SectionSelectionInput]!, $timeblocks: [TimeBlockInput]!, $totalUnits: String!, $semester: String!, $year: String!, $public: Boolean!) {
  createSchedule(
    name: $name
    selectedSections: $selectedSections
    timeblocks: $timeblocks
    semester: $semester
    year: $year
    public: $public
    totalUnits: $totalUnits
  ) {
    schedule {
      ...Schedule
    }
  }
}
    ${ScheduleFragmentDoc}`;
export type CreateScheduleMutationFn = Apollo.MutationFunction<CreateScheduleMutation, CreateScheduleMutationVariables>;

/**
 * __useCreateScheduleMutation__
 *
 * To run a mutation, you first call `useCreateScheduleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateScheduleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createScheduleMutation, { data, loading, error }] = useCreateScheduleMutation({
 *   variables: {
 *      name: // value for 'name'
 *      selectedSections: // value for 'selectedSections'
 *      timeblocks: // value for 'timeblocks'
 *      totalUnits: // value for 'totalUnits'
 *      semester: // value for 'semester'
 *      year: // value for 'year'
 *      public: // value for 'public'
 *   },
 * });
 */
export function useCreateScheduleMutation(baseOptions?: Apollo.MutationHookOptions<CreateScheduleMutation, CreateScheduleMutationVariables>) {
        return Apollo.useMutation<CreateScheduleMutation, CreateScheduleMutationVariables>(CreateScheduleDocument, baseOptions);
      }
export type CreateScheduleMutationHookResult = ReturnType<typeof useCreateScheduleMutation>;
export type CreateScheduleMutationResult = Apollo.MutationResult<CreateScheduleMutation>;
export type CreateScheduleMutationOptions = Apollo.BaseMutationOptions<CreateScheduleMutation, CreateScheduleMutationVariables>;
export const DeleteScheduleDocument = gql`
    mutation DeleteSchedule($id: ID!) {
  removeSchedule(scheduleId: $id) {
    schedule {
      id
    }
  }
}
    `;
export type DeleteScheduleMutationFn = Apollo.MutationFunction<DeleteScheduleMutation, DeleteScheduleMutationVariables>;

/**
 * __useDeleteScheduleMutation__
 *
 * To run a mutation, you first call `useDeleteScheduleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteScheduleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteScheduleMutation, { data, loading, error }] = useDeleteScheduleMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteScheduleMutation(baseOptions?: Apollo.MutationHookOptions<DeleteScheduleMutation, DeleteScheduleMutationVariables>) {
        return Apollo.useMutation<DeleteScheduleMutation, DeleteScheduleMutationVariables>(DeleteScheduleDocument, baseOptions);
      }
export type DeleteScheduleMutationHookResult = ReturnType<typeof useDeleteScheduleMutation>;
export type DeleteScheduleMutationResult = Apollo.MutationResult<DeleteScheduleMutation>;
export type DeleteScheduleMutationOptions = Apollo.BaseMutationOptions<DeleteScheduleMutation, DeleteScheduleMutationVariables>;
export const DeleteUserDocument = gql`
    mutation DeleteUser {
  deleteUser {
    success
  }
}
    `;
export type DeleteUserMutationFn = Apollo.MutationFunction<DeleteUserMutation, DeleteUserMutationVariables>;

/**
 * __useDeleteUserMutation__
 *
 * To run a mutation, you first call `useDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserMutation, { data, loading, error }] = useDeleteUserMutation({
 *   variables: {
 *   },
 * });
 */
export function useDeleteUserMutation(baseOptions?: Apollo.MutationHookOptions<DeleteUserMutation, DeleteUserMutationVariables>) {
        return Apollo.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, baseOptions);
      }
export type DeleteUserMutationHookResult = ReturnType<typeof useDeleteUserMutation>;
export type DeleteUserMutationResult = Apollo.MutationResult<DeleteUserMutation>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<DeleteUserMutation, DeleteUserMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout {
    success
  }
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, baseOptions);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const SaveCourseDocument = gql`
    mutation SaveCourse($courseId: ID!) {
  saveClass(classId: $courseId) {
    user {
      id
      savedClasses {
        ...CourseOverview
      }
    }
  }
}
    ${CourseOverviewFragmentDoc}`;
export type SaveCourseMutationFn = Apollo.MutationFunction<SaveCourseMutation, SaveCourseMutationVariables>;

/**
 * __useSaveCourseMutation__
 *
 * To run a mutation, you first call `useSaveCourseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveCourseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveCourseMutation, { data, loading, error }] = useSaveCourseMutation({
 *   variables: {
 *      courseId: // value for 'courseId'
 *   },
 * });
 */
export function useSaveCourseMutation(baseOptions?: Apollo.MutationHookOptions<SaveCourseMutation, SaveCourseMutationVariables>) {
        return Apollo.useMutation<SaveCourseMutation, SaveCourseMutationVariables>(SaveCourseDocument, baseOptions);
      }
export type SaveCourseMutationHookResult = ReturnType<typeof useSaveCourseMutation>;
export type SaveCourseMutationResult = Apollo.MutationResult<SaveCourseMutation>;
export type SaveCourseMutationOptions = Apollo.BaseMutationOptions<SaveCourseMutation, SaveCourseMutationVariables>;
export const UnsaveCourseDocument = gql`
    mutation UnsaveCourse($courseId: ID!) {
  removeClass(classId: $courseId) {
    user {
      id
      savedClasses {
        ...CourseOverview
      }
    }
  }
}
    ${CourseOverviewFragmentDoc}`;
export type UnsaveCourseMutationFn = Apollo.MutationFunction<UnsaveCourseMutation, UnsaveCourseMutationVariables>;

/**
 * __useUnsaveCourseMutation__
 *
 * To run a mutation, you first call `useUnsaveCourseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnsaveCourseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unsaveCourseMutation, { data, loading, error }] = useUnsaveCourseMutation({
 *   variables: {
 *      courseId: // value for 'courseId'
 *   },
 * });
 */
export function useUnsaveCourseMutation(baseOptions?: Apollo.MutationHookOptions<UnsaveCourseMutation, UnsaveCourseMutationVariables>) {
        return Apollo.useMutation<UnsaveCourseMutation, UnsaveCourseMutationVariables>(UnsaveCourseDocument, baseOptions);
      }
export type UnsaveCourseMutationHookResult = ReturnType<typeof useUnsaveCourseMutation>;
export type UnsaveCourseMutationResult = Apollo.MutationResult<UnsaveCourseMutation>;
export type UnsaveCourseMutationOptions = Apollo.BaseMutationOptions<UnsaveCourseMutation, UnsaveCourseMutationVariables>;
export const UpdateScheduleDocument = gql`
    mutation UpdateSchedule($scheduleId: ID!, $name: String!, $selectedSections: [SectionSelectionInput]!, $timeblocks: [TimeBlockInput]!, $totalUnits: String!, $public: Boolean!) {
  updateSchedule(
    scheduleId: $scheduleId
    name: $name
    selectedSections: $selectedSections
    timeblocks: $timeblocks
    totalUnits: $totalUnits
    public: $public
  ) {
    schedule {
      ...Schedule
    }
  }
}
    ${ScheduleFragmentDoc}`;
export type UpdateScheduleMutationFn = Apollo.MutationFunction<UpdateScheduleMutation, UpdateScheduleMutationVariables>;

/**
 * __useUpdateScheduleMutation__
 *
 * To run a mutation, you first call `useUpdateScheduleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateScheduleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateScheduleMutation, { data, loading, error }] = useUpdateScheduleMutation({
 *   variables: {
 *      scheduleId: // value for 'scheduleId'
 *      name: // value for 'name'
 *      selectedSections: // value for 'selectedSections'
 *      timeblocks: // value for 'timeblocks'
 *      totalUnits: // value for 'totalUnits'
 *      public: // value for 'public'
 *   },
 * });
 */
export function useUpdateScheduleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateScheduleMutation, UpdateScheduleMutationVariables>) {
        return Apollo.useMutation<UpdateScheduleMutation, UpdateScheduleMutationVariables>(UpdateScheduleDocument, baseOptions);
      }
export type UpdateScheduleMutationHookResult = ReturnType<typeof useUpdateScheduleMutation>;
export type UpdateScheduleMutationResult = Apollo.MutationResult<UpdateScheduleMutation>;
export type UpdateScheduleMutationOptions = Apollo.BaseMutationOptions<UpdateScheduleMutation, UpdateScheduleMutationVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($emailBerkeleytimeUpdate: Boolean, $emailClassUpdate: Boolean, $emailEnrollmentOpening: Boolean, $emailGradeUpdate: Boolean, $major: String) {
  updateUser(
    emailBerkeleytimeUpdate: $emailBerkeleytimeUpdate
    emailClassUpdate: $emailClassUpdate
    emailEnrollmentOpening: $emailEnrollmentOpening
    emailGradeUpdate: $emailGradeUpdate
    major: $major
  ) {
    user {
      id
      major
      emailGradeUpdate
      emailEnrollmentOpening
      emailClassUpdate
      emailBerkeleytimeUpdate
    }
  }
}
    `;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      emailBerkeleytimeUpdate: // value for 'emailBerkeleytimeUpdate'
 *      emailClassUpdate: // value for 'emailClassUpdate'
 *      emailEnrollmentOpening: // value for 'emailEnrollmentOpening'
 *      emailGradeUpdate: // value for 'emailGradeUpdate'
 *      major: // value for 'major'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, baseOptions);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
export const LoginDocument = gql`
    mutation Login($token: String!) {
  login(tokenId: $token) {
    newUser
    refreshExpiresIn
    payload
    user {
      ...UserProfile
    }
  }
}
    ${UserProfileFragmentDoc}`;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, baseOptions);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const GetCourseForIdDocument = gql`
    query GetCourseForId($id: ID!, $year: String, $semester: String) {
  course(id: $id) {
    ...Course
  }
}
    ${CourseFragmentDoc}`;

/**
 * __useGetCourseForIdQuery__
 *
 * To run a query within a React component, call `useGetCourseForIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCourseForIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCourseForIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *      year: // value for 'year'
 *      semester: // value for 'semester'
 *   },
 * });
 */
export function useGetCourseForIdQuery(baseOptions: Apollo.QueryHookOptions<GetCourseForIdQuery, GetCourseForIdQueryVariables>) {
        return Apollo.useQuery<GetCourseForIdQuery, GetCourseForIdQueryVariables>(GetCourseForIdDocument, baseOptions);
      }
export function useGetCourseForIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCourseForIdQuery, GetCourseForIdQueryVariables>) {
          return Apollo.useLazyQuery<GetCourseForIdQuery, GetCourseForIdQueryVariables>(GetCourseForIdDocument, baseOptions);
        }
export type GetCourseForIdQueryHookResult = ReturnType<typeof useGetCourseForIdQuery>;
export type GetCourseForIdLazyQueryHookResult = ReturnType<typeof useGetCourseForIdLazyQuery>;
export type GetCourseForIdQueryResult = Apollo.QueryResult<GetCourseForIdQuery, GetCourseForIdQueryVariables>;
export const GetCourseForNameDocument = gql`
    query GetCourseForName($abbreviation: String!, $courseNumber: String!, $year: String, $semester: String) {
  allCourses(abbreviation: $abbreviation, courseNumber: $courseNumber, first: 1) {
    edges {
      node {
        ...Course
      }
    }
  }
}
    ${CourseFragmentDoc}`;

/**
 * __useGetCourseForNameQuery__
 *
 * To run a query within a React component, call `useGetCourseForNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCourseForNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCourseForNameQuery({
 *   variables: {
 *      abbreviation: // value for 'abbreviation'
 *      courseNumber: // value for 'courseNumber'
 *      year: // value for 'year'
 *      semester: // value for 'semester'
 *   },
 * });
 */
export function useGetCourseForNameQuery(baseOptions: Apollo.QueryHookOptions<GetCourseForNameQuery, GetCourseForNameQueryVariables>) {
        return Apollo.useQuery<GetCourseForNameQuery, GetCourseForNameQueryVariables>(GetCourseForNameDocument, baseOptions);
      }
export function useGetCourseForNameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCourseForNameQuery, GetCourseForNameQueryVariables>) {
          return Apollo.useLazyQuery<GetCourseForNameQuery, GetCourseForNameQueryVariables>(GetCourseForNameDocument, baseOptions);
        }
export type GetCourseForNameQueryHookResult = ReturnType<typeof useGetCourseForNameQuery>;
export type GetCourseForNameLazyQueryHookResult = ReturnType<typeof useGetCourseForNameLazyQuery>;
export type GetCourseForNameQueryResult = Apollo.QueryResult<GetCourseForNameQuery, GetCourseForNameQueryVariables>;
export const GetCoursesForFilterDocument = gql`
    query GetCoursesForFilter($playlists: String!) {
  allCourses(inPlaylists: $playlists) {
    edges {
      node {
        ...CourseOverview
      }
    }
  }
}
    ${CourseOverviewFragmentDoc}`;

/**
 * __useGetCoursesForFilterQuery__
 *
 * To run a query within a React component, call `useGetCoursesForFilterQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCoursesForFilterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCoursesForFilterQuery({
 *   variables: {
 *      playlists: // value for 'playlists'
 *   },
 * });
 */
export function useGetCoursesForFilterQuery(baseOptions: Apollo.QueryHookOptions<GetCoursesForFilterQuery, GetCoursesForFilterQueryVariables>) {
        return Apollo.useQuery<GetCoursesForFilterQuery, GetCoursesForFilterQueryVariables>(GetCoursesForFilterDocument, baseOptions);
      }
export function useGetCoursesForFilterLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCoursesForFilterQuery, GetCoursesForFilterQueryVariables>) {
          return Apollo.useLazyQuery<GetCoursesForFilterQuery, GetCoursesForFilterQueryVariables>(GetCoursesForFilterDocument, baseOptions);
        }
export type GetCoursesForFilterQueryHookResult = ReturnType<typeof useGetCoursesForFilterQuery>;
export type GetCoursesForFilterLazyQueryHookResult = ReturnType<typeof useGetCoursesForFilterLazyQuery>;
export type GetCoursesForFilterQueryResult = Apollo.QueryResult<GetCoursesForFilterQuery, GetCoursesForFilterQueryVariables>;
export const GetFiltersDocument = gql`
    query GetFilters {
  allPlaylists {
    edges {
      node {
        ...Filter
      }
    }
  }
}
    ${FilterFragmentDoc}`;

/**
 * __useGetFiltersQuery__
 *
 * To run a query within a React component, call `useGetFiltersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFiltersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFiltersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFiltersQuery(baseOptions?: Apollo.QueryHookOptions<GetFiltersQuery, GetFiltersQueryVariables>) {
        return Apollo.useQuery<GetFiltersQuery, GetFiltersQueryVariables>(GetFiltersDocument, baseOptions);
      }
export function useGetFiltersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFiltersQuery, GetFiltersQueryVariables>) {
          return Apollo.useLazyQuery<GetFiltersQuery, GetFiltersQueryVariables>(GetFiltersDocument, baseOptions);
        }
export type GetFiltersQueryHookResult = ReturnType<typeof useGetFiltersQuery>;
export type GetFiltersLazyQueryHookResult = ReturnType<typeof useGetFiltersLazyQuery>;
export type GetFiltersQueryResult = Apollo.QueryResult<GetFiltersQuery, GetFiltersQueryVariables>;
export const GetScheduleForIdDocument = gql`
    query GetScheduleForId($id: ID!) {
  schedule(id: $id) {
    ...Schedule
  }
}
    ${ScheduleFragmentDoc}`;

/**
 * __useGetScheduleForIdQuery__
 *
 * To run a query within a React component, call `useGetScheduleForIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetScheduleForIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetScheduleForIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetScheduleForIdQuery(baseOptions: Apollo.QueryHookOptions<GetScheduleForIdQuery, GetScheduleForIdQueryVariables>) {
        return Apollo.useQuery<GetScheduleForIdQuery, GetScheduleForIdQueryVariables>(GetScheduleForIdDocument, baseOptions);
      }
export function useGetScheduleForIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetScheduleForIdQuery, GetScheduleForIdQueryVariables>) {
          return Apollo.useLazyQuery<GetScheduleForIdQuery, GetScheduleForIdQueryVariables>(GetScheduleForIdDocument, baseOptions);
        }
export type GetScheduleForIdQueryHookResult = ReturnType<typeof useGetScheduleForIdQuery>;
export type GetScheduleForIdLazyQueryHookResult = ReturnType<typeof useGetScheduleForIdLazyQuery>;
export type GetScheduleForIdQueryResult = Apollo.QueryResult<GetScheduleForIdQuery, GetScheduleForIdQueryVariables>;
export const GetSchedulerCourseForIdDocument = gql`
    query GetSchedulerCourseForId($id: ID!, $year: String, $semester: String) {
  course(id: $id) {
    ...SchedulerCourse
  }
}
    ${SchedulerCourseFragmentDoc}`;

/**
 * __useGetSchedulerCourseForIdQuery__
 *
 * To run a query within a React component, call `useGetSchedulerCourseForIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSchedulerCourseForIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSchedulerCourseForIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *      year: // value for 'year'
 *      semester: // value for 'semester'
 *   },
 * });
 */
export function useGetSchedulerCourseForIdQuery(baseOptions: Apollo.QueryHookOptions<GetSchedulerCourseForIdQuery, GetSchedulerCourseForIdQueryVariables>) {
        return Apollo.useQuery<GetSchedulerCourseForIdQuery, GetSchedulerCourseForIdQueryVariables>(GetSchedulerCourseForIdDocument, baseOptions);
      }
export function useGetSchedulerCourseForIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSchedulerCourseForIdQuery, GetSchedulerCourseForIdQueryVariables>) {
          return Apollo.useLazyQuery<GetSchedulerCourseForIdQuery, GetSchedulerCourseForIdQueryVariables>(GetSchedulerCourseForIdDocument, baseOptions);
        }
export type GetSchedulerCourseForIdQueryHookResult = ReturnType<typeof useGetSchedulerCourseForIdQuery>;
export type GetSchedulerCourseForIdLazyQueryHookResult = ReturnType<typeof useGetSchedulerCourseForIdLazyQuery>;
export type GetSchedulerCourseForIdQueryResult = Apollo.QueryResult<GetSchedulerCourseForIdQuery, GetSchedulerCourseForIdQueryVariables>;
export const GetSemestersDocument = gql`
    query GetSemesters($name: String) {
  allPlaylists(category: "semester", name: $name) {
    edges {
      node {
        ...Filter
      }
    }
  }
}
    ${FilterFragmentDoc}`;

/**
 * __useGetSemestersQuery__
 *
 * To run a query within a React component, call `useGetSemestersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSemestersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSemestersQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useGetSemestersQuery(baseOptions?: Apollo.QueryHookOptions<GetSemestersQuery, GetSemestersQueryVariables>) {
        return Apollo.useQuery<GetSemestersQuery, GetSemestersQueryVariables>(GetSemestersDocument, baseOptions);
      }
export function useGetSemestersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSemestersQuery, GetSemestersQueryVariables>) {
          return Apollo.useLazyQuery<GetSemestersQuery, GetSemestersQueryVariables>(GetSemestersDocument, baseOptions);
        }
export type GetSemestersQueryHookResult = ReturnType<typeof useGetSemestersQuery>;
export type GetSemestersLazyQueryHookResult = ReturnType<typeof useGetSemestersLazyQuery>;
export type GetSemestersQueryResult = Apollo.QueryResult<GetSemestersQuery, GetSemestersQueryVariables>;
export const GetUserDocument = gql`
    query GetUser {
  user {
    ...UserProfile
  }
}
    ${UserProfileFragmentDoc}`;

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUserQuery(baseOptions?: Apollo.QueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
        return Apollo.useQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, baseOptions);
      }
export function useGetUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
          return Apollo.useLazyQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, baseOptions);
        }
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserQueryResult = Apollo.QueryResult<GetUserQuery, GetUserQueryVariables>;
export const StubDocument = gql`
    query Stub {
  __typename
}
    `;

/**
 * __useStubQuery__
 *
 * To run a query within a React component, call `useStubQuery` and pass it any options that fit your needs.
 * When your component renders, `useStubQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStubQuery({
 *   variables: {
 *   },
 * });
 */
export function useStubQuery(baseOptions?: Apollo.QueryHookOptions<StubQuery, StubQueryVariables>) {
        return Apollo.useQuery<StubQuery, StubQueryVariables>(StubDocument, baseOptions);
      }
export function useStubLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<StubQuery, StubQueryVariables>) {
          return Apollo.useLazyQuery<StubQuery, StubQueryVariables>(StubDocument, baseOptions);
        }
export type StubQueryHookResult = ReturnType<typeof useStubQuery>;
export type StubLazyQueryHookResult = ReturnType<typeof useStubLazyQuery>;
export type StubQueryResult = Apollo.QueryResult<StubQuery, StubQueryVariables>;