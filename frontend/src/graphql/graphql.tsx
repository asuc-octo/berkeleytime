import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
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
};

export type BerkeleytimeUserType = {
  __typename?: 'BerkeleytimeUserType';
  id: Scalars['ID'];
  user: UserType;
  major: Scalars['String'];
  savedClasses: CourseTypeConnection;
  emailClassUpdate: Scalars['Boolean'];
  emailGradeUpdate: Scalars['Boolean'];
  emailEnrollmentOpening: Scalars['Boolean'];
  emailBerkeleytimeUpdate: Scalars['Boolean'];
};


export type BerkeleytimeUserTypeSavedClassesArgs = {
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
};

export type CourseType = Node & {
  __typename?: 'CourseType';
  /** The ID of the object. */
  id: Scalars['ID'];
  title: Scalars['String'];
  department: Scalars['String'];
  abbreviation: Scalars['String'];
  courseNumber: Scalars['String'];
  description: Scalars['String'];
  units: Scalars['String'];
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
};


export type CourseTypeSectionSetArgs = {
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
};


export type CourseTypeGradeSetArgs = {
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
  instructors?: Maybe<Scalars['String']>;
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
};


export type CourseTypePlaylistSetArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  category?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  semester?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['String']>;
  courses?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type CourseTypeConnection = {
  __typename?: 'CourseTypeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<CourseTypeEdge>>;
};

/** A Relay edge containing a `CourseType` and its cursor. */
export type CourseTypeEdge = {
  __typename?: 'CourseTypeEdge';
  /** The item at the end of the edge */
  node?: Maybe<CourseType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
};


export type EnrollmentType = Node & {
  __typename?: 'EnrollmentType';
  /** The ID of the object. */
  id: Scalars['ID'];
  section: SectionType;
  dateCreated: Scalars['DateTime'];
  enrolled?: Maybe<Scalars['Int']>;
  enrolledMax?: Maybe<Scalars['Int']>;
  waitlisted?: Maybe<Scalars['Int']>;
  waitlistedMax?: Maybe<Scalars['Int']>;
};

export type EnrollmentTypeConnection = {
  __typename?: 'EnrollmentTypeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<EnrollmentTypeEdge>>;
};

/** A Relay edge containing a `EnrollmentType` and its cursor. */
export type EnrollmentTypeEdge = {
  __typename?: 'EnrollmentTypeEdge';
  /** The item at the end of the edge */
  node?: Maybe<EnrollmentType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
};

export type FormConfigType = {
  __typename?: 'FormConfigType';
  field?: Maybe<Scalars['JSONString']>;
};


export type GradeType = Node & {
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
  instructors: Scalars['String'];
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
};

export type GradeTypeConnection = {
  __typename?: 'GradeTypeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<GradeTypeEdge>>;
};

/** A Relay edge containing a `GradeType` and its cursor. */
export type GradeTypeEdge = {
  __typename?: 'GradeTypeEdge';
  /** The item at the end of the edge */
  node?: Maybe<GradeType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
};


export type Mutation = {
  __typename?: 'Mutation';
  /** Login mutation using graphql_jwt  */
  login?: Maybe<ObtainJsonWebToken>;
  verifyToken?: Maybe<Verify>;
  refreshToken?: Maybe<Refresh>;
};


export type MutationLoginArgs = {
  tokenId?: Maybe<Scalars['String']>;
};


export type MutationVerifyTokenArgs = {
  token?: Maybe<Scalars['String']>;
};


export type MutationRefreshTokenArgs = {
  token?: Maybe<Scalars['String']>;
};

/** An object with an ID */
export type Node = {
  /** The ID of the object. */
  id: Scalars['ID'];
};

/** Login mutation using graphql_jwt  */
export type ObtainJsonWebToken = {
  __typename?: 'ObtainJSONWebToken';
  payload: Scalars['GenericScalar'];
  refreshExpiresIn: Scalars['Int'];
  user?: Maybe<BerkeleytimeUserType>;
  newUser?: Maybe<Scalars['Boolean']>;
};

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
};

export type PlaylistType = Node & {
  __typename?: 'PlaylistType';
  /** The ID of the object. */
  id: Scalars['ID'];
  category: Scalars['String'];
  name: Scalars['String'];
  semester: Scalars['String'];
  year: Scalars['String'];
  courses: CourseTypeConnection;
};


export type PlaylistTypeCoursesArgs = {
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
};

export type PlaylistTypeConnection = {
  __typename?: 'PlaylistTypeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<PlaylistTypeEdge>>;
};

/** A Relay edge containing a `PlaylistType` and its cursor. */
export type PlaylistTypeEdge = {
  __typename?: 'PlaylistTypeEdge';
  /** The item at the end of the edge */
  node?: Maybe<PlaylistType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
};

export type Query = {
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
};


export type QueryAllPlaylistsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  category?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  semester?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['String']>;
  courses?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


export type QueryPlaylistArgs = {
  id: Scalars['ID'];
};


export type QueryAllGradesArgs = {
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
  instructors?: Maybe<Scalars['String']>;
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
};


export type QueryGradeArgs = {
  id: Scalars['ID'];
};


export type QueryAllEnrollmentsArgs = {
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
};


export type QueryEnrollmentArgs = {
  id: Scalars['ID'];
};


export type QueryCourseArgs = {
  id: Scalars['ID'];
};


export type QueryAllCoursesArgs = {
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
};


export type QuerySectionArgs = {
  id: Scalars['ID'];
};


export type QueryAllSectionsArgs = {
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
};

export type Refresh = {
  __typename?: 'Refresh';
  payload: Scalars['GenericScalar'];
  refreshExpiresIn: Scalars['Int'];
};

export type SectionType = Node & {
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
};


export type SectionTypeEnrollmentSetArgs = {
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
};

export type SectionTypeConnection = {
  __typename?: 'SectionTypeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<SectionTypeEdge>>;
};

/** A Relay edge containing a `SectionType` and its cursor. */
export type SectionTypeEdge = {
  __typename?: 'SectionTypeEdge';
  /** The item at the end of the edge */
  node?: Maybe<SectionType>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
};

export type UserType = {
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
};

export type Verify = {
  __typename?: 'Verify';
  payload: Scalars['GenericScalar'];
};

export type GetFiltersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFiltersQuery = (
  { __typename?: 'Query' }
  & { allPlaylists?: Maybe<(
    { __typename?: 'PlaylistTypeConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'PlaylistTypeEdge' }
      & { node?: Maybe<(
        { __typename?: 'PlaylistType' }
        & Pick<PlaylistType, 'id' | 'name' | 'category' | 'semester' | 'year'>
      )> }
    )>> }
  )> }
);

export type StubQueryVariables = Exact<{ [key: string]: never; }>;


export type StubQuery = (
  { __typename?: 'Query' }
  & { allPlaylists?: Maybe<(
    { __typename?: 'PlaylistTypeConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'PlaylistTypeEdge' }
      & { node?: Maybe<(
        { __typename?: 'PlaylistType' }
        & Pick<PlaylistType, 'id' | 'name' | 'category' | 'semester' | 'year'>
      )> }
    )>> }
  )> }
);


export const GetFiltersDocument = gql`
    query GetFilters {
  allPlaylists {
    edges {
      node {
        id
        name
        category
        semester
        year
      }
    }
  }
}
    `;

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
export const StubDocument = gql`
    query Stub {
  allPlaylists {
    edges {
      node {
        id
        name
        category
        semester
        year
      }
    }
  }
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