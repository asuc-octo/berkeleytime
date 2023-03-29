import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  ISODate: any;
  JSON: any;
  JSONObject: any;
};

export type CatalogClass = {
  __typename?: 'CatalogClass';
  description?: Maybe<Scalars['String']>;
  enrollCount: Scalars['Int'];
  enrollMax: Scalars['Int'];
  lastUpdated: Scalars['ISODate'];
  number: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  unitsMax: Scalars['Float'];
  unitsMin: Scalars['Float'];
};

export type CatalogItem = {
  __typename?: 'CatalogItem';
  classes: Array<Maybe<CatalogClass>>;
  description: Scalars['String'];
  gradeAverage?: Maybe<Scalars['Float']>;
  lastUpdated: Scalars['ISODate'];
  number: Scalars['String'];
  subject: Scalars['String'];
  title: Scalars['String'];
};

/** Data for a specific class in a specific semester. There may be more than one Class for a given Course in a given semester. */
export type Class = {
  __typename?: 'Class';
  course: Course;
  description?: Maybe<Scalars['String']>;
  enrollCount: Scalars['Int'];
  enrollMax: Scalars['Int'];
  lastUpdated: Scalars['ISODate'];
  number: Scalars['String'];
  primarySection: Section;
  raw: Scalars['JSONObject'];
  sections: Array<Maybe<Section>>;
  semester: Semester;
  session: Scalars['String'];
  status: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  unitsMax: Scalars['Float'];
  unitsMin: Scalars['Float'];
  waitlistCount: Scalars['Int'];
  waitlistMax: Scalars['Int'];
  year: Scalars['Int'];
};

/** Info shared between Classes within and across semesters. */
export type Course = {
  __typename?: 'Course';
  classes: Array<Maybe<Class>>;
  crossListing?: Maybe<Array<Maybe<Course>>>;
  description: Scalars['String'];
  fromDate: Scalars['String'];
  gradeAverage?: Maybe<Scalars['Float']>;
  gradingBasis: Scalars['String'];
  lastUpdated: Scalars['ISODate'];
  level: Scalars['String'];
  number: Scalars['String'];
  prereqs?: Maybe<Scalars['String']>;
  raw: Scalars['JSONObject'];
  sections: Array<Maybe<Section>>;
  subject: Scalars['String'];
  subjectName: Scalars['String'];
  title: Scalars['String'];
  toDate: Scalars['String'];
};


/** Info shared between Classes within and across semesters. */
export type CourseClassesArgs = {
  term?: InputMaybe<TermInput>;
};


/** Info shared between Classes within and across semesters. */
export type CourseSectionsArgs = {
  primary?: InputMaybe<Scalars['Boolean']>;
  term?: InputMaybe<TermInput>;
};

export type CourseListItem = {
  __typename?: 'CourseListItem';
  number: Scalars['String'];
  subject: Scalars['String'];
};

export type CustomEvent = {
  __typename?: 'CustomEvent';
  days_of_week?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  end_time: Scalars['String'];
  location?: Maybe<Scalars['String']>;
  start_time: Scalars['String'];
  title?: Maybe<Scalars['String']>;
};

export type CustomEventInput = {
  days_of_week?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  end_time: Scalars['String'];
  location?: InputMaybe<Scalars['String']>;
  start_time: Scalars['String'];
  title?: InputMaybe<Scalars['String']>;
};

export type EnrollmentDay = {
  __typename?: 'EnrollmentDay';
  enrollCount: Scalars['Int'];
  enrollMax: Scalars['Int'];
  waitlistCount: Scalars['Int'];
  waitlistMax: Scalars['Int'];
};

export type Grade = {
  __typename?: 'Grade';
  average?: Maybe<Scalars['Float']>;
  distribution?: Maybe<Array<Maybe<GradeDistributionItem>>>;
};

export type GradeDistributionItem = {
  __typename?: 'GradeDistributionItem';
  count: Scalars['Int'];
  letter: Scalars['String'];
};

export type Instructor = {
  __typename?: 'Instructor';
  familyName: Scalars['String'];
  givenName: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Takes in schedule fields, creates a new schedule record in the database, and returns the schedule. */
  createNewSchedule?: Maybe<Schedule>;
  /** Takes in schedule fields, finds the schedule record in the database corresponding to the provided ID, updates the record, and returns the updated schedule. */
  editExistingSchedule?: Maybe<Schedule>;
  /** Takes in a schedule's ObjectID, deletes the schedule with that ID, and returns the ID. */
  removeScheduleByID?: Maybe<Scalars['ID']>;
  /** For the schedule specified by the ID, modifies the class ID field and returns the updated schedule. */
  setSelectedClasses?: Maybe<Schedule>;
  /** For the schedule specified by the ID, modifies the section ID field and returns the updated schedule. */
  setSelectedSections?: Maybe<Schedule>;
};


export type MutationCreateNewScheduleArgs = {
  main_schedule: ScheduleInput;
};


export type MutationEditExistingScheduleArgs = {
  id: Scalars['ID'];
  main_schedule: ScheduleInput;
};


export type MutationRemoveScheduleByIdArgs = {
  id: Scalars['ID'];
};


export type MutationSetSelectedClassesArgs = {
  class_IDs: Array<Scalars['String']>;
  id: Scalars['ID'];
};


export type MutationSetSelectedSectionsArgs = {
  id: Scalars['ID'];
  section_IDs: Array<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  User?: Maybe<User>;
  /**
   * Get info about all courses and their corresponding classes for a given semester.
   *
   * Used primarily in the catalog page.
   */
  catalog?: Maybe<Array<Maybe<CatalogItem>>>;
  class?: Maybe<Class>;
  course?: Maybe<Course>;
  /**
   * Get a list of all course names across all semesters.
   *
   * Useful for searching for courses.
   */
  courseList?: Maybe<Array<Maybe<CourseListItem>>>;
  grade?: Maybe<Grade>;
  ping: Scalars['String'];
  /** Takes in a schedule's ObjectID and returns a specific schedule. */
  scheduleByID?: Maybe<Schedule>;
  /** Takes in a user's email and returns all the schedules they created. */
  schedulesByUser?: Maybe<Array<Maybe<Schedule>>>;
  section?: Maybe<Section>;
};


export type QueryUserArgs = {
  email: Scalars['String'];
};


export type QueryCatalogArgs = {
  term: TermInput;
};


export type QueryClassArgs = {
  classNumber: Scalars['String'];
  courseNumber: Scalars['String'];
  subject: Scalars['String'];
  term: TermInput;
};


export type QueryCourseArgs = {
  courseNumber: Scalars['String'];
  subject: Scalars['String'];
  term?: InputMaybe<TermInput>;
};


export type QueryGradeArgs = {
  classNum?: InputMaybe<Scalars['String']>;
  courseNum: Scalars['String'];
  subject: Scalars['String'];
  term?: InputMaybe<TermInput>;
};


export type QueryScheduleByIdArgs = {
  id: Scalars['String'];
};


export type QuerySchedulesByUserArgs = {
  created_by: Scalars['String'];
};


export type QuerySectionArgs = {
  classNumber: Scalars['String'];
  courseNumber: Scalars['String'];
  sectionNumber: Scalars['String'];
  subject: Scalars['String'];
  term: TermInput;
};

export type Schedule = {
  __typename?: 'Schedule';
  /** The ObjectID associated with the schedule record */
  _id?: Maybe<Scalars['ID']>;
  /** Identifiers (probably cs-course-ids) for the classes the user has added to their schedule. */
  class_IDs?: Maybe<Array<Scalars['String']>>;
  created: Scalars['String'];
  /** Identifier (probably email) for the user who created the schedule (such as oski@bereley.edu). */
  created_by: Scalars['String'];
  /** Custom events, such as club meetings, that the user has added to their schedule. */
  custom_events?: Maybe<Array<CustomEvent>>;
  /** Whether the user would like the schedule to be viewable by others. */
  is_public: Scalars['Boolean'];
  /** The name of the schedule, such as "Oski's Fall schedule <3" */
  name?: Maybe<Scalars['String']>;
  /** Identifiers (probably the "003" in "2022 Spring STAT 97 003") for the primary sections (typically lectures) the user has added to their schedule. */
  primary_section_IDs?: Maybe<Array<Scalars['String']>>;
  revised: Scalars['String'];
  /** Identifiers (probably the "103" in "103 DIS") for the secondary sections (typically discussions) the user has added to their schedule. */
  secondary_section_IDs?: Maybe<Array<Scalars['String']>>;
  /** Term corresponding to the schedule, such as "Fall 1986" */
  term: TermOutput;
};

export type ScheduleInput = {
  class_IDs?: InputMaybe<Array<Scalars['String']>>;
  created_by: Scalars['String'];
  custom_events?: InputMaybe<Array<CustomEventInput>>;
  is_public?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  primary_section_IDs?: InputMaybe<Array<Scalars['String']>>;
  secondary_section_IDs?: InputMaybe<Array<Scalars['String']>>;
  term: TermInput;
};

/** Sections are each associated with one Class.  */
export type Section = {
  __typename?: 'Section';
  ccn: Scalars['Int'];
  class: Class;
  course: Course;
  dateEnd?: Maybe<Scalars['String']>;
  dateStart?: Maybe<Scalars['String']>;
  days?: Maybe<Array<Scalars['Boolean']>>;
  enrollCount: Scalars['Int'];
  enrollMax: Scalars['Int'];
  enrollmentHistory?: Maybe<Array<Maybe<EnrollmentDay>>>;
  instructors?: Maybe<Array<Maybe<Instructor>>>;
  kind: Scalars['String'];
  lastUpdated: Scalars['ISODate'];
  location?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  number: Scalars['String'];
  primary: Scalars['Boolean'];
  raw: Scalars['JSONObject'];
  timeEnd?: Maybe<Scalars['String']>;
  timeStart?: Maybe<Scalars['String']>;
  waitlistCount: Scalars['Int'];
  waitlistMax: Scalars['Int'];
};

export type Semester =
  | 'Fall'
  | 'Spring'
  | 'Summer';

/** The combination of year and season that corresponds to a specific term. Both year and season/semester are required. */
export type TermInput = {
  semester: Semester;
  year: Scalars['Int'];
};

export type TermOutput = {
  __typename?: 'TermOutput';
  semester: Scalars['String'];
  year: Scalars['Int'];
};

export type User = {
  __typename?: 'User';
  date_joined: Scalars['String'];
  email: Scalars['String'];
  email_berkeleytime_update?: Maybe<Scalars['Boolean']>;
  email_class_update?: Maybe<Scalars['Boolean']>;
  email_enrollment_opening?: Maybe<Scalars['Boolean']>;
  email_grade_update?: Maybe<Scalars['Boolean']>;
  first_name: Scalars['String'];
  id: Scalars['String'];
  is_active: Scalars['Boolean'];
  is_staff: Scalars['Boolean'];
  is_superuser: Scalars['Boolean'];
  last_login?: Maybe<Scalars['String']>;
  last_name: Scalars['String'];
  major?: Maybe<Array<Maybe<Scalars['String']>>>;
  password: Scalars['String'];
  username: Scalars['String'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CatalogClass: ResolverTypeWrapper<CatalogClass>;
  CatalogItem: ResolverTypeWrapper<CatalogItem>;
  Class: ResolverTypeWrapper<Class>;
  Course: ResolverTypeWrapper<Course>;
  CourseListItem: ResolverTypeWrapper<CourseListItem>;
  CustomEvent: ResolverTypeWrapper<CustomEvent>;
  CustomEventInput: CustomEventInput;
  EnrollmentDay: ResolverTypeWrapper<EnrollmentDay>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Grade: ResolverTypeWrapper<Grade>;
  GradeDistributionItem: ResolverTypeWrapper<GradeDistributionItem>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  ISODate: ResolverTypeWrapper<Scalars['ISODate']>;
  Instructor: ResolverTypeWrapper<Instructor>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  JSONObject: ResolverTypeWrapper<Scalars['JSONObject']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  Schedule: ResolverTypeWrapper<Schedule>;
  ScheduleInput: ScheduleInput;
  Section: ResolverTypeWrapper<Section>;
  Semester: Semester;
  String: ResolverTypeWrapper<Scalars['String']>;
  TermInput: TermInput;
  TermOutput: ResolverTypeWrapper<TermOutput>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  CatalogClass: CatalogClass;
  CatalogItem: CatalogItem;
  Class: Class;
  Course: Course;
  CourseListItem: CourseListItem;
  CustomEvent: CustomEvent;
  CustomEventInput: CustomEventInput;
  EnrollmentDay: EnrollmentDay;
  Float: Scalars['Float'];
  Grade: Grade;
  GradeDistributionItem: GradeDistributionItem;
  ID: Scalars['ID'];
  ISODate: Scalars['ISODate'];
  Instructor: Instructor;
  Int: Scalars['Int'];
  JSON: Scalars['JSON'];
  JSONObject: Scalars['JSONObject'];
  Mutation: {};
  Query: {};
  Schedule: Schedule;
  ScheduleInput: ScheduleInput;
  Section: Section;
  String: Scalars['String'];
  TermInput: TermInput;
  TermOutput: TermOutput;
  User: User;
};

export type CatalogClassResolvers<ContextType = any, ParentType extends ResolversParentTypes['CatalogClass'] = ResolversParentTypes['CatalogClass']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  enrollCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  enrollMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdated?: Resolver<ResolversTypes['ISODate'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unitsMax?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  unitsMin?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CatalogItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['CatalogItem'] = ResolversParentTypes['CatalogItem']> = {
  classes?: Resolver<Array<Maybe<ResolversTypes['CatalogClass']>>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gradeAverage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lastUpdated?: Resolver<ResolversTypes['ISODate'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subject?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClassResolvers<ContextType = any, ParentType extends ResolversParentTypes['Class'] = ResolversParentTypes['Class']> = {
  course?: Resolver<ResolversTypes['Course'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  enrollCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  enrollMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdated?: Resolver<ResolversTypes['ISODate'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  primarySection?: Resolver<ResolversTypes['Section'], ParentType, ContextType>;
  raw?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  sections?: Resolver<Array<Maybe<ResolversTypes['Section']>>, ParentType, ContextType>;
  semester?: Resolver<ResolversTypes['Semester'], ParentType, ContextType>;
  session?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unitsMax?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  unitsMin?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  waitlistCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  waitlistMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  year?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CourseResolvers<ContextType = any, ParentType extends ResolversParentTypes['Course'] = ResolversParentTypes['Course']> = {
  classes?: Resolver<Array<Maybe<ResolversTypes['Class']>>, ParentType, ContextType, Partial<CourseClassesArgs>>;
  crossListing?: Resolver<Maybe<Array<Maybe<ResolversTypes['Course']>>>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fromDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gradeAverage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  gradingBasis?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastUpdated?: Resolver<ResolversTypes['ISODate'], ParentType, ContextType>;
  level?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  prereqs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  raw?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  sections?: Resolver<Array<Maybe<ResolversTypes['Section']>>, ParentType, ContextType, Partial<CourseSectionsArgs>>;
  subject?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subjectName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  toDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CourseListItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['CourseListItem'] = ResolversParentTypes['CourseListItem']> = {
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subject?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CustomEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['CustomEvent'] = ResolversParentTypes['CustomEvent']> = {
  days_of_week?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  end_time?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  start_time?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EnrollmentDayResolvers<ContextType = any, ParentType extends ResolversParentTypes['EnrollmentDay'] = ResolversParentTypes['EnrollmentDay']> = {
  enrollCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  enrollMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  waitlistCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  waitlistMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GradeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Grade'] = ResolversParentTypes['Grade']> = {
  average?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  distribution?: Resolver<Maybe<Array<Maybe<ResolversTypes['GradeDistributionItem']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GradeDistributionItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['GradeDistributionItem'] = ResolversParentTypes['GradeDistributionItem']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  letter?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface IsoDateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ISODate'], any> {
  name: 'ISODate';
}

export type InstructorResolvers<ContextType = any, ParentType extends ResolversParentTypes['Instructor'] = ResolversParentTypes['Instructor']> = {
  familyName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  givenName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export interface JsonObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createNewSchedule?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<MutationCreateNewScheduleArgs, 'main_schedule'>>;
  editExistingSchedule?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<MutationEditExistingScheduleArgs, 'id' | 'main_schedule'>>;
  removeScheduleByID?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRemoveScheduleByIdArgs, 'id'>>;
  setSelectedClasses?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<MutationSetSelectedClassesArgs, 'class_IDs' | 'id'>>;
  setSelectedSections?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<MutationSetSelectedSectionsArgs, 'id' | 'section_IDs'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  User?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'email'>>;
  catalog?: Resolver<Maybe<Array<Maybe<ResolversTypes['CatalogItem']>>>, ParentType, ContextType, RequireFields<QueryCatalogArgs, 'term'>>;
  class?: Resolver<Maybe<ResolversTypes['Class']>, ParentType, ContextType, RequireFields<QueryClassArgs, 'classNumber' | 'courseNumber' | 'subject' | 'term'>>;
  course?: Resolver<Maybe<ResolversTypes['Course']>, ParentType, ContextType, RequireFields<QueryCourseArgs, 'courseNumber' | 'subject'>>;
  courseList?: Resolver<Maybe<Array<Maybe<ResolversTypes['CourseListItem']>>>, ParentType, ContextType>;
  grade?: Resolver<Maybe<ResolversTypes['Grade']>, ParentType, ContextType, RequireFields<QueryGradeArgs, 'courseNum' | 'subject'>>;
  ping?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scheduleByID?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<QueryScheduleByIdArgs, 'id'>>;
  schedulesByUser?: Resolver<Maybe<Array<Maybe<ResolversTypes['Schedule']>>>, ParentType, ContextType, RequireFields<QuerySchedulesByUserArgs, 'created_by'>>;
  section?: Resolver<Maybe<ResolversTypes['Section']>, ParentType, ContextType, RequireFields<QuerySectionArgs, 'classNumber' | 'courseNumber' | 'sectionNumber' | 'subject' | 'term'>>;
};

export type ScheduleResolvers<ContextType = any, ParentType extends ResolversParentTypes['Schedule'] = ResolversParentTypes['Schedule']> = {
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  class_IDs?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  created?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  created_by?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  custom_events?: Resolver<Maybe<Array<ResolversTypes['CustomEvent']>>, ParentType, ContextType>;
  is_public?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  primary_section_IDs?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  revised?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  secondary_section_IDs?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  term?: Resolver<ResolversTypes['TermOutput'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Section'] = ResolversParentTypes['Section']> = {
  ccn?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  class?: Resolver<ResolversTypes['Class'], ParentType, ContextType>;
  course?: Resolver<ResolversTypes['Course'], ParentType, ContextType>;
  dateEnd?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateStart?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  days?: Resolver<Maybe<Array<ResolversTypes['Boolean']>>, ParentType, ContextType>;
  enrollCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  enrollMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  enrollmentHistory?: Resolver<Maybe<Array<Maybe<ResolversTypes['EnrollmentDay']>>>, ParentType, ContextType>;
  instructors?: Resolver<Maybe<Array<Maybe<ResolversTypes['Instructor']>>>, ParentType, ContextType>;
  kind?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastUpdated?: Resolver<ResolversTypes['ISODate'], ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  primary?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  raw?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  timeEnd?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timeStart?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  waitlistCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  waitlistMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TermOutputResolvers<ContextType = any, ParentType extends ResolversParentTypes['TermOutput'] = ResolversParentTypes['TermOutput']> = {
  semester?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  year?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  date_joined?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email_berkeleytime_update?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  email_class_update?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  email_enrollment_opening?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  email_grade_update?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  first_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  is_active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  is_staff?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  is_superuser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  last_login?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  last_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  major?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  password?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  CatalogClass?: CatalogClassResolvers<ContextType>;
  CatalogItem?: CatalogItemResolvers<ContextType>;
  Class?: ClassResolvers<ContextType>;
  Course?: CourseResolvers<ContextType>;
  CourseListItem?: CourseListItemResolvers<ContextType>;
  CustomEvent?: CustomEventResolvers<ContextType>;
  EnrollmentDay?: EnrollmentDayResolvers<ContextType>;
  Grade?: GradeResolvers<ContextType>;
  GradeDistributionItem?: GradeDistributionItemResolvers<ContextType>;
  ISODate?: GraphQLScalarType;
  Instructor?: InstructorResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  JSONObject?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Schedule?: ScheduleResolvers<ContextType>;
  Section?: SectionResolvers<ContextType>;
  TermOutput?: TermOutputResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};


export type IsoDate = Scalars["ISODate"];
export type Json = Scalars["JSON"];
export type JsonObject = Scalars["JSONObject"];