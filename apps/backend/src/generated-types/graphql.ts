import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  ClassNumber: { input: any; output: any; }
  CourseNumber: { input: any; output: any; }
  ISODate: { input: any; output: any; }
  JSON: { input: any; output: any; }
  JSONObject: { input: any; output: any; }
  SectionIdentifier: { input: any; output: any; }
  SectionNumber: { input: any; output: any; }
};

export type AcademicCareer =
  /** Graduate */
  | 'GRAD'
  /** UC Extension */
  | 'UCBX'
  /** Undergraduate */
  | 'UGRD';

export type BookmarkedClassInput = {
  courseNumber: Scalars['CourseNumber']['input'];
  number: Scalars['ClassNumber']['input'];
  semester: Semester;
  subject: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type BookmarkedCourseInput = {
  number: Scalars['CourseNumber']['input'];
  subject: Scalars['String']['input'];
};

export type CacheControlScope =
  | 'PRIVATE'
  | 'PUBLIC';

export type Class = {
  __typename?: 'Class';
  /** Relationships */
  course: Course;
  courseNumber: Scalars['CourseNumber']['output'];
  description?: Maybe<Scalars['String']['output']>;
  finalExam: ClassFinalExam;
  gradeDistribution: GradeDistribution;
  /** Attributes */
  gradingBasis: ClassGradingBasis;
  number: Scalars['ClassNumber']['output'];
  primarySection: Section;
  sections: Array<Section>;
  semester: Semester;
  session: Scalars['String']['output'];
  /** Identifiers */
  subject: Scalars['String']['output'];
  term: Term;
  title?: Maybe<Scalars['String']['output']>;
  unitsMax: Scalars['Float']['output'];
  unitsMin: Scalars['Float']['output'];
  year: Scalars['Int']['output'];
};

export type ClassFinalExam =
  /** Alernate Method */
  | 'A'
  /** Common Final */
  | 'C'
  /** Last Class Meeting */
  | 'L'
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
  /** Demonstration */
  | 'DEM'
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

export type Course = {
  __typename?: 'Course';
  academicCareer: AcademicCareer;
  /** Relationships */
  classes: Array<Class>;
  crossListing: Array<Course>;
  description: Scalars['String']['output'];
  finalExam?: Maybe<CourseFinalExam>;
  fromDate: Scalars['String']['output'];
  gradeDistribution: GradeDistribution;
  gradingBasis: CourseGradingBasis;
  number: Scalars['CourseNumber']['output'];
  primaryInstructionMethod: InstructionMethod;
  requiredCourses: Array<Course>;
  /** Attributes */
  requirements?: Maybe<Scalars['String']['output']>;
  /** Identifiers */
  subject: Scalars['String']['output'];
  title: Scalars['String']['output'];
  toDate: Scalars['String']['output'];
  typicallyOffered?: Maybe<Array<Scalars['String']['output']>>;
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

export type CreateScheduleInput = {
  classes?: InputMaybe<Array<SelectedClassInput>>;
  events?: InputMaybe<Array<EventInput>>;
  name: Scalars['String']['input'];
  public?: InputMaybe<Scalars['Boolean']['input']>;
  semester: Semester;
  year: Scalars['Int']['input'];
};

export type EnrollmentDay = {
  __typename?: 'EnrollmentDay';
  enrollCount: Scalars['Int']['output'];
  enrollMax: Scalars['Int']['output'];
  waitlistCount: Scalars['Int']['output'];
  waitlistMax: Scalars['Int']['output'];
};

export type Event = {
  __typename?: 'Event';
  days: Array<Scalars['Boolean']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  endTime: Scalars['String']['output'];
  location?: Maybe<Scalars['String']['output']>;
  startTime: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type EventInput = {
  days: Array<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endTime: Scalars['String']['input'];
  location?: InputMaybe<Scalars['String']['input']>;
  startTime: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type Exam = {
  __typename?: 'Exam';
  date: Scalars['String']['output'];
  endTime: Scalars['String']['output'];
  final: Scalars['Boolean']['output'];
  location: Scalars['String']['output'];
  startTime: Scalars['String']['output'];
};

export type Grade = {
  __typename?: 'Grade';
  count: Scalars['Int']['output'];
  letter: Scalars['String']['output'];
  percentage: Scalars['Float']['output'];
};

export type GradeDistribution = {
  __typename?: 'GradeDistribution';
  average?: Maybe<Scalars['Float']['output']>;
  distribution: Array<Grade>;
};

export type InstructionMethod =
  /** Clinic */
  | 'CLC'
  /** Colloquium */
  | 'COL'
  /** Conversation */
  | 'CON'
  /** Demonstration */
  | 'DEM'
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
  /** Tutorial */
  | 'TUT'
  /** Unknown */
  | 'UNK'
  /** Web-Based Discussion */
  | 'WBD'
  /** Web-Based Lecture */
  | 'WBL'
  /** Workshop */
  | 'WOR';

export type Instructor = {
  __typename?: 'Instructor';
  familyName?: Maybe<Scalars['String']['output']>;
  givenName?: Maybe<Scalars['String']['output']>;
};

export type Meeting = {
  __typename?: 'Meeting';
  days?: Maybe<Array<Scalars['Boolean']['output']>>;
  endDate: Scalars['String']['output'];
  endTime: Scalars['String']['output'];
  instructors: Array<Instructor>;
  location?: Maybe<Scalars['String']['output']>;
  startDate: Scalars['String']['output'];
  startTime: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createSchedule?: Maybe<Schedule>;
  deleteSchedule?: Maybe<Scalars['ID']['output']>;
  updateSchedule?: Maybe<Schedule>;
  updateUser?: Maybe<User>;
};


export type MutationCreateScheduleArgs = {
  schedule: CreateScheduleInput;
};


export type MutationDeleteScheduleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateScheduleArgs = {
  id: Scalars['ID']['input'];
  schedule: UpdateScheduleInput;
};


export type MutationUpdateUserArgs = {
  user: UpdateUserInput;
};

export type Query = {
  __typename?: 'Query';
  catalog: Array<Class>;
  class?: Maybe<Class>;
  course?: Maybe<Course>;
  courses: Array<Course>;
  enrollment: Section;
  grade: GradeDistribution;
  /** @deprecated test */
  ping: Scalars['String']['output'];
  schedule?: Maybe<Schedule>;
  schedules?: Maybe<Array<Maybe<Schedule>>>;
  section?: Maybe<Section>;
  /** Query for a term. */
  term?: Maybe<Term>;
  /** Query for terms. */
  terms?: Maybe<Array<Maybe<Term>>>;
  user?: Maybe<User>;
};


export type QueryCatalogArgs = {
  query?: InputMaybe<Scalars['String']['input']>;
  semester: Semester;
  year: Scalars['Int']['input'];
};


export type QueryClassArgs = {
  courseNumber: Scalars['CourseNumber']['input'];
  number: Scalars['ClassNumber']['input'];
  semester: Semester;
  subject: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};


export type QueryCourseArgs = {
  number: Scalars['CourseNumber']['input'];
  subject: Scalars['String']['input'];
};


export type QueryEnrollmentArgs = {
  courseNumber: Scalars['CourseNumber']['input'];
  number: Scalars['SectionNumber']['input'];
  semester: Semester;
  subject: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};


export type QueryGradeArgs = {
  classNumber?: InputMaybe<Scalars['ClassNumber']['input']>;
  courseNumber: Scalars['CourseNumber']['input'];
  familyName?: InputMaybe<Scalars['String']['input']>;
  givenName?: InputMaybe<Scalars['String']['input']>;
  semester?: InputMaybe<Semester>;
  subject: Scalars['String']['input'];
  year?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryScheduleArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySectionArgs = {
  classNumber: Scalars['ClassNumber']['input'];
  courseNumber: Scalars['CourseNumber']['input'];
  number: Scalars['SectionNumber']['input'];
  semester: Semester;
  subject: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};


export type QueryTermArgs = {
  semester: Semester;
  year: Scalars['Int']['input'];
};

export type Reservation = {
  __typename?: 'Reservation';
  enrollCount: Scalars['Int']['output'];
  enrollMax: Scalars['Int']['output'];
  group: Scalars['String']['output'];
};

export type Schedule = {
  __typename?: 'Schedule';
  _id: Scalars['ID']['output'];
  classes: Array<SelectedClass>;
  createdBy: Scalars['String']['output'];
  events: Array<Event>;
  name: Scalars['String']['output'];
  public: Scalars['Boolean']['output'];
  semester: Semester;
  term: Term;
  year: Scalars['Int']['output'];
};

export type Section = {
  __typename?: 'Section';
  ccn: Scalars['SectionIdentifier']['output'];
  /** Relationships */
  class: Class;
  classNumber: Scalars['ClassNumber']['output'];
  component: Component;
  course: Course;
  courseNumber: Scalars['CourseNumber']['output'];
  endDate: Scalars['String']['output'];
  enrollCount: Scalars['Int']['output'];
  enrollMax: Scalars['Int']['output'];
  enrollmentHistory?: Maybe<Array<EnrollmentDay>>;
  exams: Array<Exam>;
  meetings: Array<Meeting>;
  number: Scalars['SectionNumber']['output'];
  online: Scalars['Boolean']['output'];
  open: Scalars['Boolean']['output'];
  primary: Scalars['Boolean']['output'];
  reservations?: Maybe<Array<Reservation>>;
  semester: Semester;
  /** Attributes */
  session: Scalars['String']['output'];
  startDate: Scalars['String']['output'];
  /** Identifiers */
  subject: Scalars['String']['output'];
  term: Term;
  waitlistCount: Scalars['Int']['output'];
  waitlistMax: Scalars['Int']['output'];
  year: Scalars['Int']['output'];
};

export type SelectedClass = {
  __typename?: 'SelectedClass';
  class: Class;
  selectedSections?: Maybe<Array<Scalars['SectionIdentifier']['output']>>;
};

export type SelectedClassInput = {
  courseNumber: Scalars['CourseNumber']['input'];
  number: Scalars['ClassNumber']['input'];
  sections: Array<Scalars['SectionIdentifier']['input']>;
  subject: Scalars['String']['input'];
};

export type Semester =
  | 'Fall'
  | 'Spring'
  | 'Summer'
  | 'Winter';

/** Session */
export type Session = {
  __typename?: 'Session';
  endDate?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  startDate?: Maybe<Scalars['String']['output']>;
  temporalPosition: TemporalPosition;
};

export type TemporalPosition =
  | 'Current'
  | 'Future'
  | 'Past';

/** Term */
export type Term = {
  __typename?: 'Term';
  endDate: Scalars['String']['output'];
  semester: Semester;
  sessions: Array<Session>;
  startDate: Scalars['String']['output'];
  temporalPosition: TemporalPosition;
  year: Scalars['Int']['output'];
};

/** The combination of year and season that corresponds to a specific term. Both year and season/semester are required. */
export type TermInput = {
  semester: Semester;
  year: Scalars['Int']['input'];
};

export type UpdateScheduleInput = {
  classes?: InputMaybe<Array<InputMaybe<SelectedClassInput>>>;
  events?: InputMaybe<Array<InputMaybe<EventInput>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateUserInput = {
  bookmarkedClasses?: InputMaybe<Array<BookmarkedClassInput>>;
  bookmarkedCourses?: InputMaybe<Array<BookmarkedCourseInput>>;
};

export type User = {
  __typename?: 'User';
  bookmarkedClasses: Array<Class>;
  bookmarkedCourses: Array<Course>;
  email: Scalars['String']['output'];
  student: Scalars['Boolean']['output'];
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
  BookmarkedClassInput: BookmarkedClassInput;
  BookmarkedCourseInput: BookmarkedCourseInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CacheControlScope: CacheControlScope;
  Class: ResolverTypeWrapper<Class>;
  ClassFinalExam: ClassFinalExam;
  ClassGradingBasis: ClassGradingBasis;
  ClassNumber: ResolverTypeWrapper<Scalars['ClassNumber']['output']>;
  Component: Component;
  Course: ResolverTypeWrapper<Course>;
  CourseFinalExam: CourseFinalExam;
  CourseGradingBasis: CourseGradingBasis;
  CourseNumber: ResolverTypeWrapper<Scalars['CourseNumber']['output']>;
  CreateScheduleInput: CreateScheduleInput;
  EnrollmentDay: ResolverTypeWrapper<EnrollmentDay>;
  Event: ResolverTypeWrapper<Event>;
  EventInput: EventInput;
  Exam: ResolverTypeWrapper<Exam>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Grade: ResolverTypeWrapper<Grade>;
  GradeDistribution: ResolverTypeWrapper<GradeDistribution>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  ISODate: ResolverTypeWrapper<Scalars['ISODate']['output']>;
  InstructionMethod: InstructionMethod;
  Instructor: ResolverTypeWrapper<Instructor>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  JSONObject: ResolverTypeWrapper<Scalars['JSONObject']['output']>;
  Meeting: ResolverTypeWrapper<Meeting>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  Reservation: ResolverTypeWrapper<Reservation>;
  Schedule: ResolverTypeWrapper<Schedule>;
  Section: ResolverTypeWrapper<Section>;
  SectionIdentifier: ResolverTypeWrapper<Scalars['SectionIdentifier']['output']>;
  SectionNumber: ResolverTypeWrapper<Scalars['SectionNumber']['output']>;
  SelectedClass: ResolverTypeWrapper<SelectedClass>;
  SelectedClassInput: SelectedClassInput;
  Semester: Semester;
  Session: ResolverTypeWrapper<Session>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  TemporalPosition: TemporalPosition;
  Term: ResolverTypeWrapper<Term>;
  TermInput: TermInput;
  UpdateScheduleInput: UpdateScheduleInput;
  UpdateUserInput: UpdateUserInput;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  BookmarkedClassInput: BookmarkedClassInput;
  BookmarkedCourseInput: BookmarkedCourseInput;
  Boolean: Scalars['Boolean']['output'];
  Class: Class;
  ClassNumber: Scalars['ClassNumber']['output'];
  Course: Course;
  CourseNumber: Scalars['CourseNumber']['output'];
  CreateScheduleInput: CreateScheduleInput;
  EnrollmentDay: EnrollmentDay;
  Event: Event;
  EventInput: EventInput;
  Exam: Exam;
  Float: Scalars['Float']['output'];
  Grade: Grade;
  GradeDistribution: GradeDistribution;
  ID: Scalars['ID']['output'];
  ISODate: Scalars['ISODate']['output'];
  Instructor: Instructor;
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  JSONObject: Scalars['JSONObject']['output'];
  Meeting: Meeting;
  Mutation: {};
  Query: {};
  Reservation: Reservation;
  Schedule: Schedule;
  Section: Section;
  SectionIdentifier: Scalars['SectionIdentifier']['output'];
  SectionNumber: Scalars['SectionNumber']['output'];
  SelectedClass: SelectedClass;
  SelectedClassInput: SelectedClassInput;
  Session: Session;
  String: Scalars['String']['output'];
  Term: Term;
  TermInput: TermInput;
  UpdateScheduleInput: UpdateScheduleInput;
  UpdateUserInput: UpdateUserInput;
  User: User;
};

export type AuthDirectiveArgs = { };

export type AuthDirectiveResolver<Result, Parent, ContextType = any, Args = AuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CacheControlDirectiveArgs = {
  inheritMaxAge?: Maybe<Scalars['Boolean']['input']>;
  maxAge?: Maybe<Scalars['Int']['input']>;
  scope?: Maybe<CacheControlScope>;
};

export type CacheControlDirectiveResolver<Result, Parent, ContextType = any, Args = CacheControlDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ClassResolvers<ContextType = any, ParentType extends ResolversParentTypes['Class'] = ResolversParentTypes['Class']> = {
  course?: Resolver<ResolversTypes['Course'], ParentType, ContextType>;
  courseNumber?: Resolver<ResolversTypes['CourseNumber'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  finalExam?: Resolver<ResolversTypes['ClassFinalExam'], ParentType, ContextType>;
  gradeDistribution?: Resolver<ResolversTypes['GradeDistribution'], ParentType, ContextType>;
  gradingBasis?: Resolver<ResolversTypes['ClassGradingBasis'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['ClassNumber'], ParentType, ContextType>;
  primarySection?: Resolver<ResolversTypes['Section'], ParentType, ContextType>;
  sections?: Resolver<Array<ResolversTypes['Section']>, ParentType, ContextType>;
  semester?: Resolver<ResolversTypes['Semester'], ParentType, ContextType>;
  session?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subject?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  term?: Resolver<ResolversTypes['Term'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unitsMax?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  unitsMin?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  year?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface ClassNumberScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ClassNumber'], any> {
  name: 'ClassNumber';
}

export type CourseResolvers<ContextType = any, ParentType extends ResolversParentTypes['Course'] = ResolversParentTypes['Course']> = {
  academicCareer?: Resolver<ResolversTypes['AcademicCareer'], ParentType, ContextType>;
  classes?: Resolver<Array<ResolversTypes['Class']>, ParentType, ContextType>;
  crossListing?: Resolver<Array<ResolversTypes['Course']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  finalExam?: Resolver<Maybe<ResolversTypes['CourseFinalExam']>, ParentType, ContextType>;
  fromDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gradeDistribution?: Resolver<ResolversTypes['GradeDistribution'], ParentType, ContextType>;
  gradingBasis?: Resolver<ResolversTypes['CourseGradingBasis'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['CourseNumber'], ParentType, ContextType>;
  primaryInstructionMethod?: Resolver<ResolversTypes['InstructionMethod'], ParentType, ContextType>;
  requiredCourses?: Resolver<Array<ResolversTypes['Course']>, ParentType, ContextType>;
  requirements?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subject?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  toDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  typicallyOffered?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface CourseNumberScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['CourseNumber'], any> {
  name: 'CourseNumber';
}

export type EnrollmentDayResolvers<ContextType = any, ParentType extends ResolversParentTypes['EnrollmentDay'] = ResolversParentTypes['EnrollmentDay']> = {
  enrollCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  enrollMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  waitlistCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  waitlistMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EventResolvers<ContextType = any, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = {
  days?: Resolver<Array<ResolversTypes['Boolean']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  letter?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  percentage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GradeDistributionResolvers<ContextType = any, ParentType extends ResolversParentTypes['GradeDistribution'] = ResolversParentTypes['GradeDistribution']> = {
  average?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  distribution?: Resolver<Array<ResolversTypes['Grade']>, ParentType, ContextType>;
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
  createSchedule?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<MutationCreateScheduleArgs, 'schedule'>>;
  deleteSchedule?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationDeleteScheduleArgs, 'id'>>;
  updateSchedule?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<MutationUpdateScheduleArgs, 'id' | 'schedule'>>;
  updateUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'user'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  catalog?: Resolver<Array<ResolversTypes['Class']>, ParentType, ContextType, RequireFields<QueryCatalogArgs, 'semester' | 'year'>>;
  class?: Resolver<Maybe<ResolversTypes['Class']>, ParentType, ContextType, RequireFields<QueryClassArgs, 'courseNumber' | 'number' | 'semester' | 'subject' | 'year'>>;
  course?: Resolver<Maybe<ResolversTypes['Course']>, ParentType, ContextType, RequireFields<QueryCourseArgs, 'number' | 'subject'>>;
  courses?: Resolver<Array<ResolversTypes['Course']>, ParentType, ContextType>;
  enrollment?: Resolver<ResolversTypes['Section'], ParentType, ContextType, RequireFields<QueryEnrollmentArgs, 'courseNumber' | 'number' | 'semester' | 'subject' | 'year'>>;
  grade?: Resolver<ResolversTypes['GradeDistribution'], ParentType, ContextType, RequireFields<QueryGradeArgs, 'courseNumber' | 'subject'>>;
  ping?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  schedule?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<QueryScheduleArgs, 'id'>>;
  schedules?: Resolver<Maybe<Array<Maybe<ResolversTypes['Schedule']>>>, ParentType, ContextType>;
  section?: Resolver<Maybe<ResolversTypes['Section']>, ParentType, ContextType, RequireFields<QuerySectionArgs, 'classNumber' | 'courseNumber' | 'number' | 'semester' | 'subject' | 'year'>>;
  term?: Resolver<Maybe<ResolversTypes['Term']>, ParentType, ContextType, RequireFields<QueryTermArgs, 'semester' | 'year'>>;
  terms?: Resolver<Maybe<Array<Maybe<ResolversTypes['Term']>>>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
};

export type ReservationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Reservation'] = ResolversParentTypes['Reservation']> = {
  enrollCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  enrollMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  group?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ScheduleResolvers<ContextType = any, ParentType extends ResolversParentTypes['Schedule'] = ResolversParentTypes['Schedule']> = {
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  classes?: Resolver<Array<ResolversTypes['SelectedClass']>, ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  public?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  semester?: Resolver<ResolversTypes['Semester'], ParentType, ContextType>;
  term?: Resolver<ResolversTypes['Term'], ParentType, ContextType>;
  year?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Section'] = ResolversParentTypes['Section']> = {
  ccn?: Resolver<ResolversTypes['SectionIdentifier'], ParentType, ContextType>;
  class?: Resolver<ResolversTypes['Class'], ParentType, ContextType>;
  classNumber?: Resolver<ResolversTypes['ClassNumber'], ParentType, ContextType>;
  component?: Resolver<ResolversTypes['Component'], ParentType, ContextType>;
  course?: Resolver<ResolversTypes['Course'], ParentType, ContextType>;
  courseNumber?: Resolver<ResolversTypes['CourseNumber'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  enrollCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  enrollMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  enrollmentHistory?: Resolver<Maybe<Array<ResolversTypes['EnrollmentDay']>>, ParentType, ContextType>;
  exams?: Resolver<Array<ResolversTypes['Exam']>, ParentType, ContextType>;
  meetings?: Resolver<Array<ResolversTypes['Meeting']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['SectionNumber'], ParentType, ContextType>;
  online?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  open?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  primary?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  reservations?: Resolver<Maybe<Array<ResolversTypes['Reservation']>>, ParentType, ContextType>;
  semester?: Resolver<ResolversTypes['Semester'], ParentType, ContextType>;
  session?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subject?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  term?: Resolver<ResolversTypes['Term'], ParentType, ContextType>;
  waitlistCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  waitlistMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  year?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface SectionIdentifierScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['SectionIdentifier'], any> {
  name: 'SectionIdentifier';
}

export interface SectionNumberScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['SectionNumber'], any> {
  name: 'SectionNumber';
}

export type SelectedClassResolvers<ContextType = any, ParentType extends ResolversParentTypes['SelectedClass'] = ResolversParentTypes['SelectedClass']> = {
  class?: Resolver<ResolversTypes['Class'], ParentType, ContextType>;
  selectedSections?: Resolver<Maybe<Array<ResolversTypes['SectionIdentifier']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SessionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Session'] = ResolversParentTypes['Session']> = {
  endDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  temporalPosition?: Resolver<ResolversTypes['TemporalPosition'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TermResolvers<ContextType = any, ParentType extends ResolversParentTypes['Term'] = ResolversParentTypes['Term']> = {
  endDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  semester?: Resolver<ResolversTypes['Semester'], ParentType, ContextType>;
  sessions?: Resolver<Array<ResolversTypes['Session']>, ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  temporalPosition?: Resolver<ResolversTypes['TemporalPosition'], ParentType, ContextType>;
  year?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  bookmarkedClasses?: Resolver<Array<ResolversTypes['Class']>, ParentType, ContextType>;
  bookmarkedCourses?: Resolver<Array<ResolversTypes['Course']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  student?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Class?: ClassResolvers<ContextType>;
  ClassNumber?: GraphQLScalarType;
  Course?: CourseResolvers<ContextType>;
  CourseNumber?: GraphQLScalarType;
  EnrollmentDay?: EnrollmentDayResolvers<ContextType>;
  Event?: EventResolvers<ContextType>;
  Exam?: ExamResolvers<ContextType>;
  Grade?: GradeResolvers<ContextType>;
  GradeDistribution?: GradeDistributionResolvers<ContextType>;
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
  SectionIdentifier?: GraphQLScalarType;
  SectionNumber?: GraphQLScalarType;
  SelectedClass?: SelectedClassResolvers<ContextType>;
  Session?: SessionResolvers<ContextType>;
  Term?: TermResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = any> = {
  auth?: AuthDirectiveResolver<any, any, ContextType>;
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>;
};

export type ClassNumber = Scalars["ClassNumber"];
export type CourseNumber = Scalars["CourseNumber"];
export type IsoDate = Scalars["ISODate"];
export type Json = Scalars["JSON"];
export type JsonObject = Scalars["JSONObject"];
export type SectionIdentifier = Scalars["SectionIdentifier"];
export type SectionNumber = Scalars["SectionNumber"];