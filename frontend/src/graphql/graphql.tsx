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
}

export interface BerkeleytimeUserType {
  __typename?: 'BerkeleytimeUserType';
  id: Scalars['ID'];
  user: UserType;
  major: Scalars['String'];
  savedClasses?: Maybe<Array<Maybe<CourseType>>>;
  emailClassUpdate: Scalars['Boolean'];
  emailGradeUpdate: Scalars['Boolean'];
  emailEnrollmentOpening: Scalars['Boolean'];
  emailBerkeleytimeUpdate: Scalars['Boolean'];
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


export interface EnrollmentType extends Node {
  __typename?: 'EnrollmentType';
  /** The ID of the object. */
  id: Scalars['ID'];
  section: SectionType;
  dateCreated: Scalars['DateTime'];
  enrolled?: Maybe<Scalars['Int']>;
  enrolledMax?: Maybe<Scalars['Int']>;
  waitlisted?: Maybe<Scalars['Int']>;
  waitlistedMax?: Maybe<Scalars['Int']>;
}

export interface EnrollmentTypeConnection {
  __typename?: 'EnrollmentTypeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<EnrollmentTypeEdge>>;
}

/** A Relay edge containing a `EnrollmentType` and its cursor. */
export interface EnrollmentTypeEdge {
  __typename?: 'EnrollmentTypeEdge';
  /** The item at the end of the edge */
  node?: Maybe<EnrollmentType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
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
  a1: Scalars['Int'];
  a2: Scalars['Int'];
  a3: Scalars['Int'];
  b1: Scalars['Int'];
  b2: Scalars['Int'];
  b3: Scalars['Int'];
  c1: Scalars['Int'];
  c2: Scalars['Int'];
  c3: Scalars['Int'];
  d1: Scalars['Int'];
  d2: Scalars['Int'];
  d3: Scalars['Int'];
  f: Scalars['Int'];
  gradedTotal: Scalars['Int'];
  p?: Maybe<Scalars['Int']>;
  np?: Maybe<Scalars['Int']>;
  average: Scalars['Float'];
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


export interface Mutation {
  __typename?: 'Mutation';
  updateUser?: Maybe<UpdateUser>;
  saveClass?: Maybe<SaveClass>;
  removeClass?: Maybe<RemoveClass>;
  /** Login mutation using graphql_jwt  */
  login?: Maybe<ObtainJsonWebToken>;
  verifyToken?: Maybe<Verify>;
  refreshToken?: Maybe<Refresh>;
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
  user?: Maybe<BerkeleytimeUserType>;
  allPlaylists?: Maybe<PlaylistTypeConnection>;
  /** The ID of the object */
  playlist?: Maybe<PlaylistType>;
  allGrades?: Maybe<GradeTypeConnection>;
  /** The ID of the object */
  grade?: Maybe<GradeType>;
  formConfig?: Maybe<FormConfigType>;
  allEnrollments?: Maybe<EnrollmentTypeConnection>;
  /** The ID of the object */
  enrollment?: Maybe<EnrollmentType>;
  /** The ID of the object */
  course?: Maybe<CourseType>;
  allCourses?: Maybe<CourseTypeConnection>;
  /** The ID of the object */
  section?: Maybe<SectionType>;
  allSections?: Maybe<SectionTypeConnection>;
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
  a1?: Maybe<Scalars['Int']>;
  a2?: Maybe<Scalars['Int']>;
  a3?: Maybe<Scalars['Int']>;
  b1?: Maybe<Scalars['Int']>;
  b2?: Maybe<Scalars['Int']>;
  b3?: Maybe<Scalars['Int']>;
  c1?: Maybe<Scalars['Int']>;
  c2?: Maybe<Scalars['Int']>;
  c3?: Maybe<Scalars['Int']>;
  d1?: Maybe<Scalars['Int']>;
  d2?: Maybe<Scalars['Int']>;
  d3?: Maybe<Scalars['Int']>;
  f?: Maybe<Scalars['Int']>;
  gradedTotal?: Maybe<Scalars['Int']>;
  p?: Maybe<Scalars['Int']>;
  np?: Maybe<Scalars['Int']>;
  average?: Maybe<Scalars['Float']>;
}


export interface QueryGradeArgs {
  id: Scalars['ID'];
}


export interface QueryAllEnrollmentsArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  section?: Maybe<Scalars['ID']>;
  dateCreated?: Maybe<Scalars['DateTime']>;
  enrolled?: Maybe<Scalars['Int']>;
  enrolledMax?: Maybe<Scalars['Int']>;
  waitlisted?: Maybe<Scalars['Int']>;
  waitlistedMax?: Maybe<Scalars['Int']>;
}


export interface QueryEnrollmentArgs {
  id: Scalars['ID'];
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

export interface SaveClass {
  __typename?: 'SaveClass';
  user?: Maybe<BerkeleytimeUserType>;
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
  enrollmentSet: EnrollmentTypeConnection;
  wordDays?: Maybe<Scalars['String']>;
}


export interface SectionTypeEnrollmentSetArgs {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  section?: Maybe<Scalars['ID']>;
  dateCreated?: Maybe<Scalars['DateTime']>;
  enrolled?: Maybe<Scalars['Int']>;
  enrolledMax?: Maybe<Scalars['Int']>;
  waitlisted?: Maybe<Scalars['Int']>;
  waitlistedMax?: Maybe<Scalars['Int']>;
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

export interface UpdateUser {
  __typename?: 'UpdateUser';
  user?: Maybe<BerkeleytimeUserType>;
}

export interface UserType {
  __typename?: 'UserType';
  id: Scalars['ID'];
  password: Scalars['String'];
  lastLogin?: Maybe<Scalars['DateTime']>;
  /** Designates that this user has all permissions without explicitly assigning them. */
  isSuperuser: Scalars['Boolean'];
  /** Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. */
  username: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email: Scalars['String'];
  /** Designates whether the user can log into this admin site. */
  isStaff: Scalars['Boolean'];
  /** Designates whether this user should be treated as active. Unselect this instead of deleting accounts. */
  isActive: Scalars['Boolean'];
  dateJoined: Scalars['DateTime'];
  berkeleytimeuser?: Maybe<BerkeleytimeUserType>;
}

export interface Verify {
  __typename?: 'Verify';
  payload: Scalars['GenericScalar'];
}

export type CourseFragment = (
  { __typename?: 'CourseType' }
  & Pick<CourseType, 'title' | 'units' | 'waitlisted' | 'openSeats' | 'letterAverage' | 'lastUpdated' | 'id' | 'hasEnrollment' | 'gradeAverage' | 'enrolledPercentage' | 'enrolledMax' | 'courseNumber' | 'department' | 'description' | 'enrolled' | 'abbreviation' | 'prerequisites'>
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
  & Pick<CourseType, 'id' | 'abbreviation' | 'courseNumber' | 'title' | 'gradeAverage' | 'letterAverage' | 'openSeats' | 'enrolledPercentage' | 'units'>
);

export type FilterFragment = (
  { __typename?: 'PlaylistType' }
  & Pick<PlaylistType, 'id' | 'name' | 'category'>
);

export type SectionFragment = (
  { __typename?: 'SectionType' }
  & Pick<SectionType, 'id' | 'ccn' | 'kind' | 'instructor' | 'startTime' | 'endTime' | 'enrolled' | 'enrolledMax' | 'locationName' | 'waitlisted' | 'waitlistedMax' | 'days' | 'wordDays'>
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
  )>>> }
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

export type GetSemestersQueryVariables = Exact<{ [key: string]: never; }>;


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
}
    `;
export const CourseFragmentDoc = gql`
    fragment Course on CourseType {
  title
  units
  waitlisted
  openSeats
  letterAverage
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
  title
  gradeAverage
  letterAverage
  openSeats
  enrolledPercentage
  units
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
}
    ${CourseOverviewFragmentDoc}`;
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
export const GetSemestersDocument = gql`
    query GetSemesters {
  allPlaylists(category: "semester") {
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