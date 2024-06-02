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

export type AcademicCareer =
  /** Graduate */
  | 'GRAD'
  /** UC Extension */
  | 'UCBX'
  /** Undergraduate */
  | 'UGRD';

export type CacheControlScope =
  | 'PRIVATE'
  | 'PUBLIC';

/** Data for a specific class in a specific semester. There may be more than one Class for a given Course in a given semester. */
export type Class = {
  __typename?: 'Class';
  course: Course;
  description?: Maybe<Scalars['String']>;
  finalExam: ClassFinalExam;
  gradingBasis: ClassGradingBasis;
  lastUpdated: Scalars['ISODate'];
  number: Scalars['String'];
  primarySection: Section;
  raw: Scalars['JSONObject'];
  sections: Array<Section>;
  semester: Semester;
  session: Session;
  title?: Maybe<Scalars['String']>;
  unitsMax: Scalars['Float'];
  unitsMin: Scalars['Float'];
  year: Scalars['Int'];
};

export type ClassFinalExam =
  /** Alernate Method */
  | 'A'
  /** Common Final */
  | 'C'
  /** No */
  | 'N'
  /** Yes */
  | 'Y';

export type ClassGradingBasis =
  /** Multi-Term Course: Not Graded */
  | 'BMT'
  /** Elective Satisfactory/Unsat */
  | 'ESU'
  /** Graded */
  | 'GRD'
  /** Instructor Option */
  | 'IOP'
  /** Student Option */
  | 'OPT'
  /** Pass/Not Pass */
  | 'PNP'
  /** Satisfactory/Unsatisfactory */
  | 'SUS';

export type Component =
  /** Clinic */
  | 'CLN'
  /** Colloquium */
  | 'COL'
  /** Discussion */
  | 'DIS'
  /** Field Work */
  | 'FLD'
  /** Directed Group Study */
  | 'GRP'
  /** Independent Study */
  | 'IND'
  /** Internship */
  | 'INT'
  /** Laboratory */
  | 'LAB'
  /** Lecture */
  | 'LEC'
  /** Practicum */
  | 'PRA'
  /** Reading */
  | 'REA'
  /** Recitation */
  | 'REC'
  /** Seminar */
  | 'SEM'
  /** Session */
  | 'SES'
  /** Self-paced */
  | 'SLF'
  /** Studio */
  | 'STD'
  /** Supplementary */
  | 'SUP'
  /** Tutorial */
  | 'TUT'
  /** Voluntary */
  | 'VOL'
  /** Web-Based Discussion */
  | 'WBD'
  /** Web-Based Lecture */
  | 'WBL'
  /** Workshop */
  | 'WOR';

/** Info shared between Classes within and across semesters. */
export type Course = {
  __typename?: 'Course';
  academicCareer: AcademicCareer;
  classes: Array<Class>;
  crossListing: Array<Course>;
  description: Scalars['String'];
  finalExam: CourseFinalExam;
  fromDate: Scalars['String'];
  gradeAverage?: Maybe<Scalars['Float']>;
  gradingBasis: CourseGradingBasis;
  lastUpdated: Scalars['ISODate'];
  number: Scalars['String'];
  raw: Scalars['JSONObject'];
  requiredCourses: Array<Course>;
  requirements?: Maybe<Scalars['String']>;
  sections: Array<Section>;
  subject: Scalars['String'];
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

export type CourseFinalExam =
  /** Alternative method of final assessment */
  | 'A'
  /** Common Final Exam */
  | 'C'
  /** To be decided by the instructor when the class is offered */
  | 'D'
  /** No final exam */
  | 'N'
  /** Written final exam conducted during the scheduled final exam period */
  | 'Y';

export type CourseGradingBasis =
  | 'completedNotation'
  | 'graded'
  | 'letter'
  | 'passFail'
  | 'satisfactory';

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

export type Exam = {
  __typename?: 'Exam';
  date: Scalars['String'];
  endTime: Scalars['String'];
  final: Scalars['Boolean'];
  location: Scalars['String'];
  startTime: Scalars['String'];
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
  familyName?: Maybe<Scalars['String']>;
  givenName?: Maybe<Scalars['String']>;
};

export type Meeting = {
  __typename?: 'Meeting';
  days?: Maybe<Array<Scalars['Boolean']>>;
  endDate: Scalars['String'];
  endTime: Scalars['String'];
  instructors: Array<Instructor>;
  location?: Maybe<Scalars['String']>;
  startDate: Scalars['String'];
  startTime: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Takes in schedule fields, creates a new schedule record in the database, and returns the schedule. */
  createNewSchedule?: Maybe<Schedule>;
  /** Delete user account. */
  deleteUser?: Maybe<User>;
  /** Takes in schedule fields, finds the schedule record in the database corresponding to the provided ID, updates the record, and returns the updated schedule. */
  editExistingSchedule?: Maybe<Schedule>;
  /** Takes in a schedule's ObjectID, deletes the schedule with that ID, and returns the ID. */
  removeScheduleByID?: Maybe<Scalars['ID']>;
  /** For the schedule specified by the ID, modifies the courses field and returns the updated schedule. */
  setSelectedClasses?: Maybe<Schedule>;
  /** Mutate user info. */
  updateUserInfo?: Maybe<User>;
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
  courses: Array<SelectedCourseInput>;
  id: Scalars['ID'];
};


export type MutationUpdateUserInfoArgs = {
  newUserInfo: UserInput;
};

export type Query = {
  __typename?: 'Query';
  /**
   * Get info about all courses and their corresponding classes for a given semester.
   *
   * Used primarily in the catalog page.
   */
  catalog?: Maybe<Array<Course>>;
  class?: Maybe<Class>;
  course?: Maybe<Course>;
  /**
   * Get a list of all course names across all semesters.
   *
   * Useful for searching for courses.
   */
  courseList?: Maybe<Array<CourseListItem>>;
  grade?: Maybe<Grade>;
  /** @deprecated test */
  ping: Scalars['String'];
  /** Takes in a schedule's ObjectID and returns a specific schedule. */
  scheduleByID?: Maybe<Schedule>;
  /** Takes in a user's email and returns all the schedules they created. */
  schedulesByUser?: Maybe<Array<Maybe<Schedule>>>;
  section?: Maybe<Section>;
  /** Query for user info. */
  user?: Maybe<User>;
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

export type Reservation = {
  __typename?: 'Reservation';
  enrollCount: Scalars['Int'];
  enrollMax: Scalars['Int'];
  group: Scalars['String'];
};

export type Schedule = {
  __typename?: 'Schedule';
  /** The ObjectID associated with the schedule record */
  _id?: Maybe<Scalars['ID']>;
  /** Courses, see the SelectedCourse type below */
  courses?: Maybe<Array<SelectedCourse>>;
  created: Scalars['String'];
  /** Identifier (probably email) for the user who created the schedule (such as oski@bereley.edu). */
  created_by: Scalars['String'];
  /** Custom events, such as club meetings, that the user has added to their schedule. */
  custom_events?: Maybe<Array<CustomEvent>>;
  /** Whether the user would like the schedule to be viewable by others. */
  is_public: Scalars['Boolean'];
  /** The name of the schedule, such as "Oski's Fall schedule <3" */
  name?: Maybe<Scalars['String']>;
  revised: Scalars['String'];
  /** Term corresponding to the schedule, such as "Fall 1986" */
  term: TermOutput;
};

export type ScheduleInput = {
  courses?: InputMaybe<Array<SelectedCourseInput>>;
  created_by: Scalars['String'];
  custom_events?: InputMaybe<Array<CustomEventInput>>;
  is_public?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  term: TermInput;
};

/** Sections are each associated with one Class. */
export type Section = {
  __typename?: 'Section';
  ccn: Scalars['Int'];
  class: Class;
  component: Component;
  course: Course;
  endDate: Scalars['String'];
  enrollCount: Scalars['Int'];
  enrollMax: Scalars['Int'];
  enrollmentHistory?: Maybe<Array<EnrollmentDay>>;
  exams: Array<Exam>;
  lastUpdated: Scalars['ISODate'];
  meetings: Array<Meeting>;
  number: Scalars['String'];
  online: Scalars['Boolean'];
  open: Scalars['Boolean'];
  primary: Scalars['Boolean'];
  raw: Scalars['JSONObject'];
  reservations?: Maybe<Array<Reservation>>;
  startDate: Scalars['String'];
  waitlistCount: Scalars['Int'];
  waitlistMax: Scalars['Int'];
};

export type SelectedCourse = {
  __typename?: 'SelectedCourse';
  /** Identifiers (probably cs-course-ids) for the classes the user has added to their schedule. */
  class_ID: Scalars['String'];
  /** Identifiers (probably the "003" in "2022 Spring STAT 97 003") for the primary sections (typically lectures) the user has added to their schedule. */
  primary_section_ID?: Maybe<Scalars['String']>;
  /** Identifiers (probably the "103" in "103 DIS") for the secondary sections (typically discussions) the user has added to their schedule. */
  secondary_section_IDs?: Maybe<Array<Scalars['String']>>;
};

export type SelectedCourseInput = {
  class_ID: Scalars['String'];
  primary_section_ID?: InputMaybe<Scalars['String']>;
  secondary_section_IDs?: InputMaybe<Array<Scalars['String']>>;
};

export type Semester =
  | 'Fall'
  | 'Spring'
  | 'Summer';

export type Session =
  /** Session A */
  | 'A'
  /** Session B */
  | 'B'
  /** Session C */
  | 'C'
  /** Session D */
  | 'D'
  /** Session E */
  | 'E'
  /** Session F */
  | 'F'
  /** Regular Academic Session */
  | 'R'
  /** 12-Week Summer Session */
  | 'S';

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

/** User account info. */
export type User = {
  __typename?: 'User';
  date_joined: Scalars['String'];
  email: Scalars['String'];
  email_berkeleytime_update: Scalars['Boolean'];
  email_class_update: Scalars['Boolean'];
  email_enrollment_opening: Scalars['Boolean'];
  email_grade_update: Scalars['Boolean'];
  first_name: Scalars['String'];
  is_active: Scalars['Boolean'];
  is_staff: Scalars['Boolean'];
  last_login: Scalars['String'];
  last_name: Scalars['String'];
  major: Array<Scalars['String']>;
  username: Scalars['String'];
};

/** User input type for mutations. */
export type UserInput = {
  email_berkeleytime_update?: InputMaybe<Scalars['Boolean']>;
  email_class_update?: InputMaybe<Scalars['Boolean']>;
  email_enrollment_opening?: InputMaybe<Scalars['Boolean']>;
  email_grade_update?: InputMaybe<Scalars['Boolean']>;
  first_name?: InputMaybe<Scalars['String']>;
  last_name?: InputMaybe<Scalars['String']>;
  major?: InputMaybe<Array<Scalars['String']>>;
  username?: InputMaybe<Scalars['String']>;
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
  AcademicCareer: AcademicCareer;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CacheControlScope: CacheControlScope;
  Class: ResolverTypeWrapper<Class>;
  ClassFinalExam: ClassFinalExam;
  ClassGradingBasis: ClassGradingBasis;
  Component: Component;
  Course: ResolverTypeWrapper<Course>;
  CourseFinalExam: CourseFinalExam;
  CourseGradingBasis: CourseGradingBasis;
  CourseListItem: ResolverTypeWrapper<CourseListItem>;
  CustomEvent: ResolverTypeWrapper<CustomEvent>;
  CustomEventInput: CustomEventInput;
  EnrollmentDay: ResolverTypeWrapper<EnrollmentDay>;
  Exam: ResolverTypeWrapper<Exam>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Grade: ResolverTypeWrapper<Grade>;
  GradeDistributionItem: ResolverTypeWrapper<GradeDistributionItem>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  ISODate: ResolverTypeWrapper<Scalars['ISODate']>;
  Instructor: ResolverTypeWrapper<Instructor>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  JSONObject: ResolverTypeWrapper<Scalars['JSONObject']>;
  Meeting: ResolverTypeWrapper<Meeting>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  Reservation: ResolverTypeWrapper<Reservation>;
  Schedule: ResolverTypeWrapper<Schedule>;
  ScheduleInput: ScheduleInput;
  Section: ResolverTypeWrapper<Section>;
  SelectedCourse: ResolverTypeWrapper<SelectedCourse>;
  SelectedCourseInput: SelectedCourseInput;
  Semester: Semester;
  Session: Session;
  String: ResolverTypeWrapper<Scalars['String']>;
  TermInput: TermInput;
  TermOutput: ResolverTypeWrapper<TermOutput>;
  User: ResolverTypeWrapper<User>;
  UserInput: UserInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  Class: Class;
  Course: Course;
  CourseListItem: CourseListItem;
  CustomEvent: CustomEvent;
  CustomEventInput: CustomEventInput;
  EnrollmentDay: EnrollmentDay;
  Exam: Exam;
  Float: Scalars['Float'];
  Grade: Grade;
  GradeDistributionItem: GradeDistributionItem;
  ID: Scalars['ID'];
  ISODate: Scalars['ISODate'];
  Instructor: Instructor;
  Int: Scalars['Int'];
  JSON: Scalars['JSON'];
  JSONObject: Scalars['JSONObject'];
  Meeting: Meeting;
  Mutation: {};
  Query: {};
  Reservation: Reservation;
  Schedule: Schedule;
  ScheduleInput: ScheduleInput;
  Section: Section;
  SelectedCourse: SelectedCourse;
  SelectedCourseInput: SelectedCourseInput;
  String: Scalars['String'];
  TermInput: TermInput;
  TermOutput: TermOutput;
  User: User;
  UserInput: UserInput;
};

export type AuthDirectiveArgs = { };

export type AuthDirectiveResolver<Result, Parent, ContextType = any, Args = AuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CacheControlDirectiveArgs = {
  inheritMaxAge?: Maybe<Scalars['Boolean']>;
  maxAge?: Maybe<Scalars['Int']>;
  scope?: Maybe<CacheControlScope>;
};

export type CacheControlDirectiveResolver<Result, Parent, ContextType = any, Args = CacheControlDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ClassResolvers<ContextType = any, ParentType extends ResolversParentTypes['Class'] = ResolversParentTypes['Class']> = {
  course?: Resolver<ResolversTypes['Course'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  finalExam?: Resolver<ResolversTypes['ClassFinalExam'], ParentType, ContextType>;
  gradingBasis?: Resolver<ResolversTypes['ClassGradingBasis'], ParentType, ContextType>;
  lastUpdated?: Resolver<ResolversTypes['ISODate'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  primarySection?: Resolver<ResolversTypes['Section'], ParentType, ContextType>;
  raw?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  sections?: Resolver<Array<ResolversTypes['Section']>, ParentType, ContextType>;
  semester?: Resolver<ResolversTypes['Semester'], ParentType, ContextType>;
  session?: Resolver<ResolversTypes['Session'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unitsMax?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  unitsMin?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  year?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CourseResolvers<ContextType = any, ParentType extends ResolversParentTypes['Course'] = ResolversParentTypes['Course']> = {
  academicCareer?: Resolver<ResolversTypes['AcademicCareer'], ParentType, ContextType>;
  classes?: Resolver<Array<ResolversTypes['Class']>, ParentType, ContextType, Partial<CourseClassesArgs>>;
  crossListing?: Resolver<Array<ResolversTypes['Course']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  finalExam?: Resolver<ResolversTypes['CourseFinalExam'], ParentType, ContextType>;
  fromDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gradeAverage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  gradingBasis?: Resolver<ResolversTypes['CourseGradingBasis'], ParentType, ContextType>;
  lastUpdated?: Resolver<ResolversTypes['ISODate'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  raw?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  requiredCourses?: Resolver<Array<ResolversTypes['Course']>, ParentType, ContextType>;
  requirements?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sections?: Resolver<Array<ResolversTypes['Section']>, ParentType, ContextType, Partial<CourseSectionsArgs>>;
  subject?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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

export type ExamResolvers<ContextType = any, ParentType extends ResolversParentTypes['Exam'] = ResolversParentTypes['Exam']> = {
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  final?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  location?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  familyName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  givenName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export interface JsonObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export type MeetingResolvers<ContextType = any, ParentType extends ResolversParentTypes['Meeting'] = ResolversParentTypes['Meeting']> = {
  days?: Resolver<Maybe<Array<ResolversTypes['Boolean']>>, ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  instructors?: Resolver<Array<ResolversTypes['Instructor']>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createNewSchedule?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<MutationCreateNewScheduleArgs, 'main_schedule'>>;
  deleteUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  editExistingSchedule?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<MutationEditExistingScheduleArgs, 'id' | 'main_schedule'>>;
  removeScheduleByID?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRemoveScheduleByIdArgs, 'id'>>;
  setSelectedClasses?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<MutationSetSelectedClassesArgs, 'courses' | 'id'>>;
  updateUserInfo?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserInfoArgs, 'newUserInfo'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  catalog?: Resolver<Maybe<Array<ResolversTypes['Course']>>, ParentType, ContextType, RequireFields<QueryCatalogArgs, 'term'>>;
  class?: Resolver<Maybe<ResolversTypes['Class']>, ParentType, ContextType, RequireFields<QueryClassArgs, 'classNumber' | 'courseNumber' | 'subject' | 'term'>>;
  course?: Resolver<Maybe<ResolversTypes['Course']>, ParentType, ContextType, RequireFields<QueryCourseArgs, 'courseNumber' | 'subject'>>;
  courseList?: Resolver<Maybe<Array<ResolversTypes['CourseListItem']>>, ParentType, ContextType>;
  grade?: Resolver<Maybe<ResolversTypes['Grade']>, ParentType, ContextType, RequireFields<QueryGradeArgs, 'courseNum' | 'subject'>>;
  ping?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scheduleByID?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<QueryScheduleByIdArgs, 'id'>>;
  schedulesByUser?: Resolver<Maybe<Array<Maybe<ResolversTypes['Schedule']>>>, ParentType, ContextType, RequireFields<QuerySchedulesByUserArgs, 'created_by'>>;
  section?: Resolver<Maybe<ResolversTypes['Section']>, ParentType, ContextType, RequireFields<QuerySectionArgs, 'classNumber' | 'courseNumber' | 'sectionNumber' | 'subject' | 'term'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
};

export type ReservationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Reservation'] = ResolversParentTypes['Reservation']> = {
  enrollCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  enrollMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  group?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ScheduleResolvers<ContextType = any, ParentType extends ResolversParentTypes['Schedule'] = ResolversParentTypes['Schedule']> = {
  _id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  courses?: Resolver<Maybe<Array<ResolversTypes['SelectedCourse']>>, ParentType, ContextType>;
  created?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  created_by?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  custom_events?: Resolver<Maybe<Array<ResolversTypes['CustomEvent']>>, ParentType, ContextType>;
  is_public?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  revised?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  term?: Resolver<ResolversTypes['TermOutput'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Section'] = ResolversParentTypes['Section']> = {
  ccn?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  class?: Resolver<ResolversTypes['Class'], ParentType, ContextType>;
  component?: Resolver<ResolversTypes['Component'], ParentType, ContextType>;
  course?: Resolver<ResolversTypes['Course'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  enrollCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  enrollMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  enrollmentHistory?: Resolver<Maybe<Array<ResolversTypes['EnrollmentDay']>>, ParentType, ContextType>;
  exams?: Resolver<Array<ResolversTypes['Exam']>, ParentType, ContextType>;
  lastUpdated?: Resolver<ResolversTypes['ISODate'], ParentType, ContextType>;
  meetings?: Resolver<Array<ResolversTypes['Meeting']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  online?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  open?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  primary?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  raw?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  reservations?: Resolver<Maybe<Array<ResolversTypes['Reservation']>>, ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  waitlistCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  waitlistMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SelectedCourseResolvers<ContextType = any, ParentType extends ResolversParentTypes['SelectedCourse'] = ResolversParentTypes['SelectedCourse']> = {
  class_ID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  primary_section_ID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  secondary_section_IDs?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
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
  email_berkeleytime_update?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  email_class_update?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  email_enrollment_opening?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  email_grade_update?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  first_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  is_active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  is_staff?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  last_login?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  last_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  major?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Class?: ClassResolvers<ContextType>;
  Course?: CourseResolvers<ContextType>;
  CourseListItem?: CourseListItemResolvers<ContextType>;
  CustomEvent?: CustomEventResolvers<ContextType>;
  EnrollmentDay?: EnrollmentDayResolvers<ContextType>;
  Exam?: ExamResolvers<ContextType>;
  Grade?: GradeResolvers<ContextType>;
  GradeDistributionItem?: GradeDistributionItemResolvers<ContextType>;
  ISODate?: GraphQLScalarType;
  Instructor?: InstructorResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  JSONObject?: GraphQLScalarType;
  Meeting?: MeetingResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Reservation?: ReservationResolvers<ContextType>;
  Schedule?: ScheduleResolvers<ContextType>;
  Section?: SectionResolvers<ContextType>;
  SelectedCourse?: SelectedCourseResolvers<ContextType>;
  TermOutput?: TermOutputResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = any> = {
  auth?: AuthDirectiveResolver<any, any, ContextType>;
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>;
};

export type IsoDate = Scalars["ISODate"];
export type Json = Scalars["JSON"];
export type JsonObject = Scalars["JSONObject"];