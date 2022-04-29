import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
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
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
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
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
  department?: InputMaybe<Scalars['String']>;
  abbreviation?: InputMaybe<Scalars['String']>;
  courseNumber?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  units?: InputMaybe<Scalars['String']>;
  crossListing?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  prerequisites?: InputMaybe<Scalars['String']>;
  gradeAverage?: InputMaybe<Scalars['Float']>;
  letterAverage?: InputMaybe<Scalars['String']>;
  hasEnrollment?: InputMaybe<Scalars['Boolean']>;
  enrolled?: InputMaybe<Scalars['Int']>;
  enrolledMax?: InputMaybe<Scalars['Int']>;
  enrolledPercentage?: InputMaybe<Scalars['Float']>;
  waitlisted?: InputMaybe<Scalars['Int']>;
  openSeats?: InputMaybe<Scalars['Int']>;
  lastUpdated?: InputMaybe<Scalars['DateTime']>;
  hasGrades?: InputMaybe<Scalars['Boolean']>;
  inPlaylists?: InputMaybe<Scalars['String']>;
  idIn?: InputMaybe<Scalars['String']>;
}


export interface CourseTypeSectionSetArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  course?: InputMaybe<Scalars['ID']>;
  abbreviation?: InputMaybe<Scalars['String']>;
  courseNumber?: InputMaybe<Scalars['String']>;
  year?: InputMaybe<Scalars['String']>;
  semester?: InputMaybe<Scalars['String']>;
  courseTitle?: InputMaybe<Scalars['String']>;
  sectionNumber?: InputMaybe<Scalars['String']>;
  ccn?: InputMaybe<Scalars['String']>;
  kind?: InputMaybe<Scalars['String']>;
  isPrimary?: InputMaybe<Scalars['Boolean']>;
  associatedSections?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  days?: InputMaybe<Scalars['String']>;
  startTime?: InputMaybe<Scalars['DateTime']>;
  endTime?: InputMaybe<Scalars['DateTime']>;
  finalDay?: InputMaybe<Scalars['String']>;
  finalEnd?: InputMaybe<Scalars['DateTime']>;
  finalStart?: InputMaybe<Scalars['DateTime']>;
  instructor?: InputMaybe<Scalars['String']>;
  disabled?: InputMaybe<Scalars['Boolean']>;
  locationName?: InputMaybe<Scalars['String']>;
  instructionMode?: InputMaybe<Scalars['String']>;
  lastUpdated?: InputMaybe<Scalars['DateTime']>;
  enrolled?: InputMaybe<Scalars['Int']>;
  enrolledMax?: InputMaybe<Scalars['Int']>;
  waitlisted?: InputMaybe<Scalars['Int']>;
  waitlistedMax?: InputMaybe<Scalars['Int']>;
}


export interface CourseTypeGradeSetArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  course?: InputMaybe<Scalars['ID']>;
  semester?: InputMaybe<Scalars['String']>;
  year?: InputMaybe<Scalars['String']>;
  abbreviation?: InputMaybe<Scalars['String']>;
  courseNumber?: InputMaybe<Scalars['String']>;
  sectionNumber?: InputMaybe<Scalars['String']>;
  instructor?: InputMaybe<Scalars['String']>;
  gradedTotal?: InputMaybe<Scalars['Int']>;
  average?: InputMaybe<Scalars['Float']>;
}


export interface CourseTypePlaylistSetArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  category?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  semester?: InputMaybe<Scalars['String']>;
  year?: InputMaybe<Scalars['String']>;
  courses?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
}


export interface CourseTypeSchedulerSectionsArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
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

/** The return format of both queries */
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
  /** Login mutation using graphql_jwt */
  login?: Maybe<ObtainJsonWebToken>;
  logout?: Maybe<Logout>;
  verifyToken?: Maybe<Verify>;
  refreshToken?: Maybe<Refresh>;
  deleteUser?: Maybe<DeleteUser>;
}


export interface MutationCreateScheduleArgs {
  name?: InputMaybe<Scalars['String']>;
  public?: InputMaybe<Scalars['Boolean']>;
  selectedSections?: InputMaybe<Array<InputMaybe<SectionSelectionInput>>>;
  semester?: InputMaybe<Scalars['String']>;
  timeblocks?: InputMaybe<Array<InputMaybe<TimeBlockInput>>>;
  totalUnits?: InputMaybe<Scalars['String']>;
  year?: InputMaybe<Scalars['String']>;
}


export interface MutationUpdateScheduleArgs {
  name?: InputMaybe<Scalars['String']>;
  public?: InputMaybe<Scalars['Boolean']>;
  scheduleId?: InputMaybe<Scalars['ID']>;
  selectedSections?: InputMaybe<Array<InputMaybe<SectionSelectionInput>>>;
  timeblocks?: InputMaybe<Array<InputMaybe<TimeBlockInput>>>;
  totalUnits?: InputMaybe<Scalars['String']>;
}


export interface MutationRemoveScheduleArgs {
  scheduleId?: InputMaybe<Scalars['ID']>;
}


export interface MutationUpdateUserArgs {
  emailBerkeleytimeUpdate?: InputMaybe<Scalars['Boolean']>;
  emailClassUpdate?: InputMaybe<Scalars['Boolean']>;
  emailEnrollmentOpening?: InputMaybe<Scalars['Boolean']>;
  emailGradeUpdate?: InputMaybe<Scalars['Boolean']>;
  major?: InputMaybe<Scalars['String']>;
}


export interface MutationSaveClassArgs {
  classId?: InputMaybe<Scalars['ID']>;
}


export interface MutationRemoveClassArgs {
  classId?: InputMaybe<Scalars['ID']>;
}


export interface MutationLoginArgs {
  tokenId?: InputMaybe<Scalars['String']>;
}


export interface MutationVerifyTokenArgs {
  token?: InputMaybe<Scalars['String']>;
}


export interface MutationRefreshTokenArgs {
  token?: InputMaybe<Scalars['String']>;
}

/** An object with an ID */
export interface Node {
  /** The ID of the object. */
  id: Scalars['ID'];
}

/** Login mutation using graphql_jwt */
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
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
  department?: InputMaybe<Scalars['String']>;
  abbreviation?: InputMaybe<Scalars['String']>;
  courseNumber?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  units?: InputMaybe<Scalars['String']>;
  crossListing?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  prerequisites?: InputMaybe<Scalars['String']>;
  gradeAverage?: InputMaybe<Scalars['Float']>;
  letterAverage?: InputMaybe<Scalars['String']>;
  hasEnrollment?: InputMaybe<Scalars['Boolean']>;
  enrolled?: InputMaybe<Scalars['Int']>;
  enrolledMax?: InputMaybe<Scalars['Int']>;
  enrolledPercentage?: InputMaybe<Scalars['Float']>;
  waitlisted?: InputMaybe<Scalars['Int']>;
  openSeats?: InputMaybe<Scalars['Int']>;
  lastUpdated?: InputMaybe<Scalars['DateTime']>;
  hasGrades?: InputMaybe<Scalars['Boolean']>;
  inPlaylists?: InputMaybe<Scalars['String']>;
  idIn?: InputMaybe<Scalars['String']>;
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
  id?: InputMaybe<Scalars['ID']>;
}


export interface QueryAllPlaylistsArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  category?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  semester?: InputMaybe<Scalars['String']>;
  year?: InputMaybe<Scalars['String']>;
  courses?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
}


export interface QueryPlaylistArgs {
  id: Scalars['ID'];
}


export interface QueryAllGradesArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  course?: InputMaybe<Scalars['ID']>;
  semester?: InputMaybe<Scalars['String']>;
  year?: InputMaybe<Scalars['String']>;
  abbreviation?: InputMaybe<Scalars['String']>;
  courseNumber?: InputMaybe<Scalars['String']>;
  sectionNumber?: InputMaybe<Scalars['String']>;
  instructor?: InputMaybe<Scalars['String']>;
  gradedTotal?: InputMaybe<Scalars['Int']>;
  average?: InputMaybe<Scalars['Float']>;
}


export interface QueryGradeArgs {
  id: Scalars['ID'];
}


export interface QueryCourseEnrollmentBySectionArgs {
  sectionId?: InputMaybe<Scalars['ID']>;
}


export interface QueryCourseEnrollmentBySemesterArgs {
  courseId?: InputMaybe<Scalars['ID']>;
  semester?: InputMaybe<Scalars['String']>;
  year?: InputMaybe<Scalars['Int']>;
}


export interface QueryCourseArgs {
  id: Scalars['ID'];
}


export interface QueryAllCoursesArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
  department?: InputMaybe<Scalars['String']>;
  abbreviation?: InputMaybe<Scalars['String']>;
  courseNumber?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  units?: InputMaybe<Scalars['String']>;
  crossListing?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  prerequisites?: InputMaybe<Scalars['String']>;
  gradeAverage?: InputMaybe<Scalars['Float']>;
  letterAverage?: InputMaybe<Scalars['String']>;
  hasEnrollment?: InputMaybe<Scalars['Boolean']>;
  enrolled?: InputMaybe<Scalars['Int']>;
  enrolledMax?: InputMaybe<Scalars['Int']>;
  enrolledPercentage?: InputMaybe<Scalars['Float']>;
  waitlisted?: InputMaybe<Scalars['Int']>;
  openSeats?: InputMaybe<Scalars['Int']>;
  lastUpdated?: InputMaybe<Scalars['DateTime']>;
  hasGrades?: InputMaybe<Scalars['Boolean']>;
  inPlaylists?: InputMaybe<Scalars['String']>;
  idIn?: InputMaybe<Scalars['String']>;
}


export interface QuerySectionArgs {
  id: Scalars['ID'];
}


export interface QueryAllSectionsArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  course?: InputMaybe<Scalars['ID']>;
  abbreviation?: InputMaybe<Scalars['String']>;
  courseNumber?: InputMaybe<Scalars['String']>;
  year?: InputMaybe<Scalars['String']>;
  semester?: InputMaybe<Scalars['String']>;
  courseTitle?: InputMaybe<Scalars['String']>;
  sectionNumber?: InputMaybe<Scalars['String']>;
  ccn?: InputMaybe<Scalars['String']>;
  kind?: InputMaybe<Scalars['String']>;
  isPrimary?: InputMaybe<Scalars['Boolean']>;
  associatedSections?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  days?: InputMaybe<Scalars['String']>;
  startTime?: InputMaybe<Scalars['DateTime']>;
  endTime?: InputMaybe<Scalars['DateTime']>;
  finalDay?: InputMaybe<Scalars['String']>;
  finalEnd?: InputMaybe<Scalars['DateTime']>;
  finalStart?: InputMaybe<Scalars['DateTime']>;
  instructor?: InputMaybe<Scalars['String']>;
  disabled?: InputMaybe<Scalars['Boolean']>;
  locationName?: InputMaybe<Scalars['String']>;
  instructionMode?: InputMaybe<Scalars['String']>;
  lastUpdated?: InputMaybe<Scalars['DateTime']>;
  enrolled?: InputMaybe<Scalars['Int']>;
  enrolledMax?: InputMaybe<Scalars['Int']>;
  waitlisted?: InputMaybe<Scalars['Int']>;
  waitlistedMax?: InputMaybe<Scalars['Int']>;
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
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
}


export interface ScheduleTypeTimeblocksArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
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
  primary?: InputMaybe<Scalars['ID']>;
  secondary?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
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
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  course?: InputMaybe<Scalars['ID']>;
  abbreviation?: InputMaybe<Scalars['String']>;
  courseNumber?: InputMaybe<Scalars['String']>;
  year?: InputMaybe<Scalars['String']>;
  semester?: InputMaybe<Scalars['String']>;
  courseTitle?: InputMaybe<Scalars['String']>;
  sectionNumber?: InputMaybe<Scalars['String']>;
  ccn?: InputMaybe<Scalars['String']>;
  kind?: InputMaybe<Scalars['String']>;
  isPrimary?: InputMaybe<Scalars['Boolean']>;
  associatedSections?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  days?: InputMaybe<Scalars['String']>;
  startTime?: InputMaybe<Scalars['DateTime']>;
  endTime?: InputMaybe<Scalars['DateTime']>;
  finalDay?: InputMaybe<Scalars['String']>;
  finalEnd?: InputMaybe<Scalars['DateTime']>;
  finalStart?: InputMaybe<Scalars['DateTime']>;
  instructor?: InputMaybe<Scalars['String']>;
  disabled?: InputMaybe<Scalars['Boolean']>;
  locationName?: InputMaybe<Scalars['String']>;
  instructionMode?: InputMaybe<Scalars['String']>;
  lastUpdated?: InputMaybe<Scalars['DateTime']>;
  enrolled?: InputMaybe<Scalars['Int']>;
  enrolledMax?: InputMaybe<Scalars['Int']>;
  waitlisted?: InputMaybe<Scalars['Int']>;
  waitlistedMax?: InputMaybe<Scalars['Int']>;
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
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  course?: InputMaybe<Scalars['ID']>;
  abbreviation?: InputMaybe<Scalars['String']>;
  courseNumber?: InputMaybe<Scalars['String']>;
  year?: InputMaybe<Scalars['String']>;
  semester?: InputMaybe<Scalars['String']>;
  courseTitle?: InputMaybe<Scalars['String']>;
  sectionNumber?: InputMaybe<Scalars['String']>;
  ccn?: InputMaybe<Scalars['String']>;
  kind?: InputMaybe<Scalars['String']>;
  isPrimary?: InputMaybe<Scalars['Boolean']>;
  associatedSections?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  days?: InputMaybe<Scalars['String']>;
  startTime?: InputMaybe<Scalars['DateTime']>;
  endTime?: InputMaybe<Scalars['DateTime']>;
  finalDay?: InputMaybe<Scalars['String']>;
  finalEnd?: InputMaybe<Scalars['DateTime']>;
  finalStart?: InputMaybe<Scalars['DateTime']>;
  instructor?: InputMaybe<Scalars['String']>;
  disabled?: InputMaybe<Scalars['Boolean']>;
  locationName?: InputMaybe<Scalars['String']>;
  instructionMode?: InputMaybe<Scalars['String']>;
  lastUpdated?: InputMaybe<Scalars['DateTime']>;
  enrolled?: InputMaybe<Scalars['Int']>;
  enrolledMax?: InputMaybe<Scalars['Int']>;
  waitlisted?: InputMaybe<Scalars['Int']>;
  waitlistedMax?: InputMaybe<Scalars['Int']>;
}


export interface SectionTypeSchedulerPrimarySectionsArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
}


export interface SectionTypeSchedulerSecondarySectionsArgs {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
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

/** Telebears JSON */
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

export type CourseFragment = { __typename?: 'CourseType', title: string, units?: string | null, waitlisted: number, openSeats: number, letterAverage: string, gradeAverage?: number | null, lastUpdated: any, id: string, hasEnrollment: boolean, enrolledPercentage: number, enrolledMax: number, courseNumber: string, department: string, description: string, enrolled: number, abbreviation: string, prerequisites: string, playlistSet: { __typename?: 'PlaylistTypeConnection', edges: Array<{ __typename?: 'PlaylistTypeEdge', node?: { __typename?: 'PlaylistType', category: string, id: string, name: string, semester: string, year: string } | null } | null> }, sectionSet: { __typename?: 'SectionTypeConnection', edges: Array<{ __typename?: 'SectionTypeEdge', node?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null } | null> } };

export type CourseOverviewFragment = { __typename?: 'CourseType', id: string, abbreviation: string, courseNumber: string, description: string, title: string, gradeAverage?: number | null, letterAverage: string, openSeats: number, enrolledPercentage: number, enrolled: number, enrolledMax: number, units?: string | null };

export type FilterFragment = { __typename?: 'PlaylistType', id: string, name: string, category: string };

export type LectureFragment = { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean, associatedSections: { __typename?: 'SectionTypeConnection', edges: Array<{ __typename?: 'SectionTypeEdge', node?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null } | null> } };

export type ScheduleFragment = { __typename?: 'ScheduleType', id: string, year: string, semester: string, name: string, totalUnits: string, dateCreated: any, dateModified: any, public: boolean, user: { __typename?: 'BerkeleytimeUserType', user: { __typename?: 'UserType', id: string, firstName: string, lastName: string } }, selectedSections: { __typename?: 'SectionSelectionTypeConnection', edges: Array<{ __typename?: 'SectionSelectionTypeEdge', node?: { __typename?: 'SectionSelectionType', id: string, course: { __typename?: 'CourseType', id: string, abbreviation: string, courseNumber: string, description: string, title: string, gradeAverage?: number | null, letterAverage: string, openSeats: number, enrolledPercentage: number, enrolled: number, enrolledMax: number, units?: string | null }, primary?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null, secondary: { __typename?: 'SectionTypeConnection', edges: Array<{ __typename?: 'SectionTypeEdge', node?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null } | null> } } | null } | null> } };

export type ScheduleOverviewFragment = { __typename?: 'ScheduleType', id: string, year: string, semester: string, name: string, totalUnits: string, dateCreated: any, dateModified: any, selectedSections: { __typename?: 'SectionSelectionTypeConnection', edges: Array<{ __typename?: 'SectionSelectionTypeEdge', node?: { __typename?: 'SectionSelectionType', course: { __typename?: 'CourseType', abbreviation: string, courseNumber: string, units?: string | null } } | null } | null> } };

export type SchedulerCourseFragment = { __typename?: 'CourseType', id: string, title: string, units?: string | null, waitlisted: number, openSeats: number, enrolled: number, enrolledMax: number, courseNumber: string, department: string, description: string, abbreviation: string, sectionSet: { __typename?: 'SectionTypeConnection', edges: Array<{ __typename?: 'SectionTypeEdge', node?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean, associatedSections: { __typename?: 'SectionTypeConnection', edges: Array<{ __typename?: 'SectionTypeEdge', node?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null } | null> } } | null } | null> } };

export type SectionFragment = { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean };

export type SectionSelectionFragment = { __typename?: 'SectionSelectionType', id: string, course: { __typename?: 'CourseType', id: string, abbreviation: string, courseNumber: string, description: string, title: string, gradeAverage?: number | null, letterAverage: string, openSeats: number, enrolledPercentage: number, enrolled: number, enrolledMax: number, units?: string | null }, primary?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null, secondary: { __typename?: 'SectionTypeConnection', edges: Array<{ __typename?: 'SectionTypeEdge', node?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null } | null> } };

export type UserProfileFragment = { __typename?: 'BerkeleytimeUserType', id: string, major: string, emailClassUpdate?: boolean | null, emailGradeUpdate?: boolean | null, emailEnrollmentOpening?: boolean | null, emailBerkeleytimeUpdate?: boolean | null, user: { __typename?: 'UserType', id: string, username: string, firstName: string, lastName: string, email: string }, savedClasses?: Array<{ __typename?: 'CourseType', id: string, abbreviation: string, courseNumber: string, description: string, title: string, gradeAverage?: number | null, letterAverage: string, openSeats: number, enrolledPercentage: number, enrolled: number, enrolledMax: number, units?: string | null } | null> | null, schedules: { __typename?: 'ScheduleTypeConnection', edges: Array<{ __typename?: 'ScheduleTypeEdge', node?: { __typename?: 'ScheduleType', id: string, year: string, semester: string, name: string, totalUnits: string, dateCreated: any, dateModified: any, selectedSections: { __typename?: 'SectionSelectionTypeConnection', edges: Array<{ __typename?: 'SectionSelectionTypeEdge', node?: { __typename?: 'SectionSelectionType', course: { __typename?: 'CourseType', abbreviation: string, courseNumber: string, units?: string | null } } | null } | null> } } | null } | null> } };

export type CreateScheduleMutationVariables = Exact<{
  name: Scalars['String'];
  selectedSections: Array<InputMaybe<SectionSelectionInput>> | InputMaybe<SectionSelectionInput>;
  timeblocks: Array<InputMaybe<TimeBlockInput>> | InputMaybe<TimeBlockInput>;
  totalUnits: Scalars['String'];
  semester: Scalars['String'];
  year: Scalars['String'];
  public: Scalars['Boolean'];
}>;


export type CreateScheduleMutation = { __typename?: 'Mutation', createSchedule?: { __typename?: 'CreateSchedule', schedule?: { __typename?: 'ScheduleType', id: string, year: string, semester: string, name: string, totalUnits: string, dateCreated: any, dateModified: any, public: boolean, user: { __typename?: 'BerkeleytimeUserType', user: { __typename?: 'UserType', id: string, firstName: string, lastName: string } }, selectedSections: { __typename?: 'SectionSelectionTypeConnection', edges: Array<{ __typename?: 'SectionSelectionTypeEdge', node?: { __typename?: 'SectionSelectionType', id: string, course: { __typename?: 'CourseType', id: string, abbreviation: string, courseNumber: string, description: string, title: string, gradeAverage?: number | null, letterAverage: string, openSeats: number, enrolledPercentage: number, enrolled: number, enrolledMax: number, units?: string | null }, primary?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null, secondary: { __typename?: 'SectionTypeConnection', edges: Array<{ __typename?: 'SectionTypeEdge', node?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null } | null> } } | null } | null> } } | null } | null };

export type DeleteScheduleMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteScheduleMutation = { __typename?: 'Mutation', removeSchedule?: { __typename?: 'RemoveSchedule', schedule?: { __typename?: 'ScheduleType', id: string } | null } | null };

export type DeleteUserMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser?: { __typename?: 'DeleteUser', success?: boolean | null } | null };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout?: { __typename?: 'Logout', success?: boolean | null } | null };

export type SaveCourseMutationVariables = Exact<{
  courseId: Scalars['ID'];
}>;


export type SaveCourseMutation = { __typename?: 'Mutation', saveClass?: { __typename?: 'SaveClass', user?: { __typename?: 'BerkeleytimeUserType', id: string, savedClasses?: Array<{ __typename?: 'CourseType', id: string, abbreviation: string, courseNumber: string, description: string, title: string, gradeAverage?: number | null, letterAverage: string, openSeats: number, enrolledPercentage: number, enrolled: number, enrolledMax: number, units?: string | null } | null> | null } | null } | null };

export type UnsaveCourseMutationVariables = Exact<{
  courseId: Scalars['ID'];
}>;


export type UnsaveCourseMutation = { __typename?: 'Mutation', removeClass?: { __typename?: 'RemoveClass', user?: { __typename?: 'BerkeleytimeUserType', id: string, savedClasses?: Array<{ __typename?: 'CourseType', id: string, abbreviation: string, courseNumber: string, description: string, title: string, gradeAverage?: number | null, letterAverage: string, openSeats: number, enrolledPercentage: number, enrolled: number, enrolledMax: number, units?: string | null } | null> | null } | null } | null };

export type UpdateScheduleMutationVariables = Exact<{
  scheduleId: Scalars['ID'];
  name: Scalars['String'];
  selectedSections: Array<InputMaybe<SectionSelectionInput>> | InputMaybe<SectionSelectionInput>;
  timeblocks: Array<InputMaybe<TimeBlockInput>> | InputMaybe<TimeBlockInput>;
  totalUnits: Scalars['String'];
  public: Scalars['Boolean'];
}>;


export type UpdateScheduleMutation = { __typename?: 'Mutation', updateSchedule?: { __typename?: 'UpdateSchedule', schedule?: { __typename?: 'ScheduleType', id: string, year: string, semester: string, name: string, totalUnits: string, dateCreated: any, dateModified: any, public: boolean, user: { __typename?: 'BerkeleytimeUserType', user: { __typename?: 'UserType', id: string, firstName: string, lastName: string } }, selectedSections: { __typename?: 'SectionSelectionTypeConnection', edges: Array<{ __typename?: 'SectionSelectionTypeEdge', node?: { __typename?: 'SectionSelectionType', id: string, course: { __typename?: 'CourseType', id: string, abbreviation: string, courseNumber: string, description: string, title: string, gradeAverage?: number | null, letterAverage: string, openSeats: number, enrolledPercentage: number, enrolled: number, enrolledMax: number, units?: string | null }, primary?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null, secondary: { __typename?: 'SectionTypeConnection', edges: Array<{ __typename?: 'SectionTypeEdge', node?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null } | null> } } | null } | null> } } | null } | null };

export type UpdateUserMutationVariables = Exact<{
  emailBerkeleytimeUpdate?: InputMaybe<Scalars['Boolean']>;
  emailClassUpdate?: InputMaybe<Scalars['Boolean']>;
  emailEnrollmentOpening?: InputMaybe<Scalars['Boolean']>;
  emailGradeUpdate?: InputMaybe<Scalars['Boolean']>;
  major?: InputMaybe<Scalars['String']>;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser?: { __typename?: 'UpdateUser', user?: { __typename?: 'BerkeleytimeUserType', id: string, major: string, emailGradeUpdate?: boolean | null, emailEnrollmentOpening?: boolean | null, emailClassUpdate?: boolean | null, emailBerkeleytimeUpdate?: boolean | null } | null } | null };

export type LoginMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login?: { __typename?: 'ObtainJSONWebToken', newUser?: boolean | null, refreshExpiresIn: number, payload: any, user?: { __typename?: 'BerkeleytimeUserType', id: string, major: string, emailClassUpdate?: boolean | null, emailGradeUpdate?: boolean | null, emailEnrollmentOpening?: boolean | null, emailBerkeleytimeUpdate?: boolean | null, user: { __typename?: 'UserType', id: string, username: string, firstName: string, lastName: string, email: string }, savedClasses?: Array<{ __typename?: 'CourseType', id: string, abbreviation: string, courseNumber: string, description: string, title: string, gradeAverage?: number | null, letterAverage: string, openSeats: number, enrolledPercentage: number, enrolled: number, enrolledMax: number, units?: string | null } | null> | null, schedules: { __typename?: 'ScheduleTypeConnection', edges: Array<{ __typename?: 'ScheduleTypeEdge', node?: { __typename?: 'ScheduleType', id: string, year: string, semester: string, name: string, totalUnits: string, dateCreated: any, dateModified: any, selectedSections: { __typename?: 'SectionSelectionTypeConnection', edges: Array<{ __typename?: 'SectionSelectionTypeEdge', node?: { __typename?: 'SectionSelectionType', course: { __typename?: 'CourseType', abbreviation: string, courseNumber: string, units?: string | null } } | null } | null> } } | null } | null> } } | null } | null };

export type GetCourseForIdQueryVariables = Exact<{
  id: Scalars['ID'];
  year?: InputMaybe<Scalars['String']>;
  semester?: InputMaybe<Scalars['String']>;
}>;


export type GetCourseForIdQuery = { __typename?: 'Query', course?: { __typename?: 'CourseType', title: string, units?: string | null, waitlisted: number, openSeats: number, letterAverage: string, gradeAverage?: number | null, lastUpdated: any, id: string, hasEnrollment: boolean, enrolledPercentage: number, enrolledMax: number, courseNumber: string, department: string, description: string, enrolled: number, abbreviation: string, prerequisites: string, playlistSet: { __typename?: 'PlaylistTypeConnection', edges: Array<{ __typename?: 'PlaylistTypeEdge', node?: { __typename?: 'PlaylistType', category: string, id: string, name: string, semester: string, year: string } | null } | null> }, sectionSet: { __typename?: 'SectionTypeConnection', edges: Array<{ __typename?: 'SectionTypeEdge', node?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null } | null> } } | null };

export type GetCourseForNameQueryVariables = Exact<{
  abbreviation: Scalars['String'];
  courseNumber: Scalars['String'];
  year?: InputMaybe<Scalars['String']>;
  semester?: InputMaybe<Scalars['String']>;
}>;


export type GetCourseForNameQuery = { __typename?: 'Query', allCourses?: { __typename?: 'CourseTypeConnection', edges: Array<{ __typename?: 'CourseTypeEdge', node?: { __typename?: 'CourseType', title: string, units?: string | null, waitlisted: number, openSeats: number, letterAverage: string, gradeAverage?: number | null, lastUpdated: any, id: string, hasEnrollment: boolean, enrolledPercentage: number, enrolledMax: number, courseNumber: string, department: string, description: string, enrolled: number, abbreviation: string, prerequisites: string, playlistSet: { __typename?: 'PlaylistTypeConnection', edges: Array<{ __typename?: 'PlaylistTypeEdge', node?: { __typename?: 'PlaylistType', category: string, id: string, name: string, semester: string, year: string } | null } | null> }, sectionSet: { __typename?: 'SectionTypeConnection', edges: Array<{ __typename?: 'SectionTypeEdge', node?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null } | null> } } | null } | null> } | null };

export type GetCoursesForFilterQueryVariables = Exact<{
  playlists: Scalars['String'];
}>;


export type GetCoursesForFilterQuery = { __typename?: 'Query', allCourses?: { __typename?: 'CourseTypeConnection', edges: Array<{ __typename?: 'CourseTypeEdge', node?: { __typename?: 'CourseType', id: string, abbreviation: string, courseNumber: string, description: string, title: string, gradeAverage?: number | null, letterAverage: string, openSeats: number, enrolledPercentage: number, enrolled: number, enrolledMax: number, units?: string | null } | null } | null> } | null };

export type GetFiltersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFiltersQuery = { __typename?: 'Query', allPlaylists?: { __typename?: 'PlaylistTypeConnection', edges: Array<{ __typename?: 'PlaylistTypeEdge', node?: { __typename?: 'PlaylistType', id: string, name: string, category: string } | null } | null> } | null };

export type GetScheduleForIdQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetScheduleForIdQuery = { __typename?: 'Query', schedule?: { __typename?: 'ScheduleType', id: string, year: string, semester: string, name: string, totalUnits: string, dateCreated: any, dateModified: any, public: boolean, user: { __typename?: 'BerkeleytimeUserType', user: { __typename?: 'UserType', id: string, firstName: string, lastName: string } }, selectedSections: { __typename?: 'SectionSelectionTypeConnection', edges: Array<{ __typename?: 'SectionSelectionTypeEdge', node?: { __typename?: 'SectionSelectionType', id: string, course: { __typename?: 'CourseType', id: string, abbreviation: string, courseNumber: string, description: string, title: string, gradeAverage?: number | null, letterAverage: string, openSeats: number, enrolledPercentage: number, enrolled: number, enrolledMax: number, units?: string | null }, primary?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null, secondary: { __typename?: 'SectionTypeConnection', edges: Array<{ __typename?: 'SectionTypeEdge', node?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null } | null> } } | null } | null> } } | null };

export type GetSchedulerCourseForIdQueryVariables = Exact<{
  id: Scalars['ID'];
  year?: InputMaybe<Scalars['String']>;
  semester?: InputMaybe<Scalars['String']>;
}>;


export type GetSchedulerCourseForIdQuery = { __typename?: 'Query', course?: { __typename?: 'CourseType', id: string, title: string, units?: string | null, waitlisted: number, openSeats: number, enrolled: number, enrolledMax: number, courseNumber: string, department: string, description: string, abbreviation: string, sectionSet: { __typename?: 'SectionTypeConnection', edges: Array<{ __typename?: 'SectionTypeEdge', node?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean, associatedSections: { __typename?: 'SectionTypeConnection', edges: Array<{ __typename?: 'SectionTypeEdge', node?: { __typename?: 'SectionType', id: string, ccn: string, kind: string, instructor: string, startTime?: any | null, endTime?: any | null, enrolled?: number | null, enrolledMax?: number | null, locationName: string, waitlisted?: number | null, waitlistedMax?: number | null, days: string, wordDays?: string | null, disabled: boolean, sectionNumber: string, isPrimary: boolean } | null } | null> } } | null } | null> } } | null };

export type GetSemestersQueryVariables = Exact<{
  name?: InputMaybe<Scalars['String']>;
}>;


export type GetSemestersQuery = { __typename?: 'Query', allPlaylists?: { __typename?: 'PlaylistTypeConnection', edges: Array<{ __typename?: 'PlaylistTypeEdge', node?: { __typename?: 'PlaylistType', id: string, name: string, category: string } | null } | null> } | null };

export type GetUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserQuery = { __typename?: 'Query', user?: { __typename?: 'BerkeleytimeUserType', id: string, major: string, emailClassUpdate?: boolean | null, emailGradeUpdate?: boolean | null, emailEnrollmentOpening?: boolean | null, emailBerkeleytimeUpdate?: boolean | null, user: { __typename?: 'UserType', id: string, username: string, firstName: string, lastName: string, email: string }, savedClasses?: Array<{ __typename?: 'CourseType', id: string, abbreviation: string, courseNumber: string, description: string, title: string, gradeAverage?: number | null, letterAverage: string, openSeats: number, enrolledPercentage: number, enrolled: number, enrolledMax: number, units?: string | null } | null> | null, schedules: { __typename?: 'ScheduleTypeConnection', edges: Array<{ __typename?: 'ScheduleTypeEdge', node?: { __typename?: 'ScheduleType', id: string, year: string, semester: string, name: string, totalUnits: string, dateCreated: any, dateModified: any, selectedSections: { __typename?: 'SectionSelectionTypeConnection', edges: Array<{ __typename?: 'SectionSelectionTypeEdge', node?: { __typename?: 'SectionSelectionType', course: { __typename?: 'CourseType', abbreviation: string, courseNumber: string, units?: string | null } } | null } | null> } } | null } | null> } } | null };

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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateScheduleMutation, CreateScheduleMutationVariables>(CreateScheduleDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteScheduleMutation, DeleteScheduleMutationVariables>(DeleteScheduleDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveCourseMutation, SaveCourseMutationVariables>(SaveCourseDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnsaveCourseMutation, UnsaveCourseMutationVariables>(UnsaveCourseDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateScheduleMutation, UpdateScheduleMutationVariables>(UpdateScheduleDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCourseForIdQuery, GetCourseForIdQueryVariables>(GetCourseForIdDocument, options);
      }
export function useGetCourseForIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCourseForIdQuery, GetCourseForIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCourseForIdQuery, GetCourseForIdQueryVariables>(GetCourseForIdDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCourseForNameQuery, GetCourseForNameQueryVariables>(GetCourseForNameDocument, options);
      }
export function useGetCourseForNameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCourseForNameQuery, GetCourseForNameQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCourseForNameQuery, GetCourseForNameQueryVariables>(GetCourseForNameDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCoursesForFilterQuery, GetCoursesForFilterQueryVariables>(GetCoursesForFilterDocument, options);
      }
export function useGetCoursesForFilterLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCoursesForFilterQuery, GetCoursesForFilterQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCoursesForFilterQuery, GetCoursesForFilterQueryVariables>(GetCoursesForFilterDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFiltersQuery, GetFiltersQueryVariables>(GetFiltersDocument, options);
      }
export function useGetFiltersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFiltersQuery, GetFiltersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFiltersQuery, GetFiltersQueryVariables>(GetFiltersDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetScheduleForIdQuery, GetScheduleForIdQueryVariables>(GetScheduleForIdDocument, options);
      }
export function useGetScheduleForIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetScheduleForIdQuery, GetScheduleForIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetScheduleForIdQuery, GetScheduleForIdQueryVariables>(GetScheduleForIdDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSchedulerCourseForIdQuery, GetSchedulerCourseForIdQueryVariables>(GetSchedulerCourseForIdDocument, options);
      }
export function useGetSchedulerCourseForIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSchedulerCourseForIdQuery, GetSchedulerCourseForIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSchedulerCourseForIdQuery, GetSchedulerCourseForIdQueryVariables>(GetSchedulerCourseForIdDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSemestersQuery, GetSemestersQueryVariables>(GetSemestersDocument, options);
      }
export function useGetSemestersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSemestersQuery, GetSemestersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSemestersQuery, GetSemestersQueryVariables>(GetSemestersDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
      }
export function useGetUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
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
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<StubQuery, StubQueryVariables>(StubDocument, options);
      }
export function useStubLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<StubQuery, StubQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<StubQuery, StubQueryVariables>(StubDocument, options);
        }
export type StubQueryHookResult = ReturnType<typeof useStubQuery>;
export type StubLazyQueryHookResult = ReturnType<typeof useStubLazyQuery>;
export type StubQueryResult = Apollo.QueryResult<StubQuery, StubQueryVariables>;