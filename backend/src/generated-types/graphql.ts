import { GraphQLResolveInfo } from 'graphql';
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
};

export type CatalogItem = {
  __typename?: 'CatalogItem';
  classTitle?: Maybe<Scalars['String']>;
  courseId?: Maybe<Scalars['String']>;
  courseTitle?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  enrolled: Scalars['Float'];
  letterAverage: Scalars['String'];
  units: Scalars['String'];
};

export type Class = {
  __typename?: 'Class';
  course: Course;
  description?: Maybe<Scalars['String']>;
  displayName: Scalars['String'];
  instructors: Array<Maybe<Instructor>>;
  number: Scalars['String'];
  sections: Array<Maybe<Section>>;
  subjectArea: SubjectArea;
  term: Scalars['String'];
  title: Scalars['String'];
};

export type Course = {
  __typename?: 'Course';
  classes: Array<Maybe<Class>>;
  crossListing?: Maybe<Array<Maybe<Course>>>;
  displayName: Scalars['String'];
  gradeAverage: Scalars['Float'];
  id: Scalars['String'];
  letterAverage: Scalars['String'];
  prereqs?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  units?: Maybe<Scalars['String']>;
};

export type Enrollment = {
  __typename?: 'Enrollment';
  classId: Scalars['String'];
  enrollmentInfo?: Maybe<Array<Maybe<EnrollmentInfo>>>;
};

export type EnrollmentInfo = {
  __typename?: 'EnrollmentInfo';
  date?: Maybe<Scalars['String']>;
  enrolledCount?: Maybe<Scalars['Int']>;
  enrolledMax?: Maybe<Scalars['Int']>;
  waitlistedCount?: Maybe<Scalars['Int']>;
  waitlistedMax?: Maybe<Scalars['Int']>;
};

export type Grade = {
  __typename?: 'Grade';
  course_id: Scalars['String'];
};

export type Instructor = {
  __typename?: 'Instructor';
  id: Scalars['String'];
  name: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  Enrollment?: Maybe<Enrollment>;
  User?: Maybe<User>;
  catalog?: Maybe<Array<Maybe<CatalogItem>>>;
  grades?: Maybe<Array<Maybe<Grade>>>;
};


export type QueryEnrollmentArgs = {
  classId: Scalars['String'];
};


export type QueryUserArgs = {
  email: Scalars['String'];
};


export type QueryCatalogArgs = {
  courseId?: InputMaybe<Scalars['String']>;
};

export type Section = {
  __typename?: 'Section';
  associatedSections?: Maybe<Array<Maybe<Section>>>;
  ccn: Scalars['String'];
  class: Class;
  course: Course;
  instructionMode: Scalars['String'];
  instructors: Array<Maybe<Instructor>>;
  location: Scalars['String'];
  number: Scalars['String'];
  primary: Scalars['Boolean'];
  times: SectionTimes;
  type: Scalars['String'];
};

export type SectionTimes = {
  __typename?: 'SectionTimes';
  days: Array<Maybe<Scalars['String']>>;
  end: Scalars['String'];
  start: Scalars['String'];
};

export type SubjectArea = {
  __typename?: 'SubjectArea';
  code: Scalars['String'];
  description: Scalars['String'];
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
  CatalogItem: ResolverTypeWrapper<CatalogItem>;
  Class: ResolverTypeWrapper<Class>;
  Course: ResolverTypeWrapper<Course>;
  Enrollment: ResolverTypeWrapper<Enrollment>;
  EnrollmentInfo: ResolverTypeWrapper<EnrollmentInfo>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Grade: ResolverTypeWrapper<Grade>;
  Instructor: ResolverTypeWrapper<Instructor>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Query: ResolverTypeWrapper<{}>;
  Section: ResolverTypeWrapper<Section>;
  SectionTimes: ResolverTypeWrapper<SectionTimes>;
  String: ResolverTypeWrapper<Scalars['String']>;
  SubjectArea: ResolverTypeWrapper<SubjectArea>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  CatalogItem: CatalogItem;
  Class: Class;
  Course: Course;
  Enrollment: Enrollment;
  EnrollmentInfo: EnrollmentInfo;
  Float: Scalars['Float'];
  Grade: Grade;
  Instructor: Instructor;
  Int: Scalars['Int'];
  Query: {};
  Section: Section;
  SectionTimes: SectionTimes;
  String: Scalars['String'];
  SubjectArea: SubjectArea;
  User: User;
};

export type CatalogItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['CatalogItem'] = ResolversParentTypes['CatalogItem']> = {
  classTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  courseId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  courseTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  enrolled?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  letterAverage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  units?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClassResolvers<ContextType = any, ParentType extends ResolversParentTypes['Class'] = ResolversParentTypes['Class']> = {
  course?: Resolver<ResolversTypes['Course'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  instructors?: Resolver<Array<Maybe<ResolversTypes['Instructor']>>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sections?: Resolver<Array<Maybe<ResolversTypes['Section']>>, ParentType, ContextType>;
  subjectArea?: Resolver<ResolversTypes['SubjectArea'], ParentType, ContextType>;
  term?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CourseResolvers<ContextType = any, ParentType extends ResolversParentTypes['Course'] = ResolversParentTypes['Course']> = {
  classes?: Resolver<Array<Maybe<ResolversTypes['Class']>>, ParentType, ContextType>;
  crossListing?: Resolver<Maybe<Array<Maybe<ResolversTypes['Course']>>>, ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gradeAverage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  letterAverage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  prereqs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  units?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EnrollmentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Enrollment'] = ResolversParentTypes['Enrollment']> = {
  classId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  enrollmentInfo?: Resolver<Maybe<Array<Maybe<ResolversTypes['EnrollmentInfo']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EnrollmentInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['EnrollmentInfo'] = ResolversParentTypes['EnrollmentInfo']> = {
  date?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  enrolledCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  enrolledMax?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  waitlistedCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  waitlistedMax?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GradeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Grade'] = ResolversParentTypes['Grade']> = {
  course_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InstructorResolvers<ContextType = any, ParentType extends ResolversParentTypes['Instructor'] = ResolversParentTypes['Instructor']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  Enrollment?: Resolver<Maybe<ResolversTypes['Enrollment']>, ParentType, ContextType, RequireFields<QueryEnrollmentArgs, 'classId'>>;
  User?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'email'>>;
  catalog?: Resolver<Maybe<Array<Maybe<ResolversTypes['CatalogItem']>>>, ParentType, ContextType, Partial<QueryCatalogArgs>>;
  grades?: Resolver<Maybe<Array<Maybe<ResolversTypes['Grade']>>>, ParentType, ContextType>;
};

export type SectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Section'] = ResolversParentTypes['Section']> = {
  associatedSections?: Resolver<Maybe<Array<Maybe<ResolversTypes['Section']>>>, ParentType, ContextType>;
  ccn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  class?: Resolver<ResolversTypes['Class'], ParentType, ContextType>;
  course?: Resolver<ResolversTypes['Course'], ParentType, ContextType>;
  instructionMode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  instructors?: Resolver<Array<Maybe<ResolversTypes['Instructor']>>, ParentType, ContextType>;
  location?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  primary?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  times?: Resolver<ResolversTypes['SectionTimes'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SectionTimesResolvers<ContextType = any, ParentType extends ResolversParentTypes['SectionTimes'] = ResolversParentTypes['SectionTimes']> = {
  days?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
  end?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  start?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubjectAreaResolvers<ContextType = any, ParentType extends ResolversParentTypes['SubjectArea'] = ResolversParentTypes['SubjectArea']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  CatalogItem?: CatalogItemResolvers<ContextType>;
  Class?: ClassResolvers<ContextType>;
  Course?: CourseResolvers<ContextType>;
  Enrollment?: EnrollmentResolvers<ContextType>;
  EnrollmentInfo?: EnrollmentInfoResolvers<ContextType>;
  Grade?: GradeResolvers<ContextType>;
  Instructor?: InstructorResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Section?: SectionResolvers<ContextType>;
  SectionTimes?: SectionTimesResolvers<ContextType>;
  SubjectArea?: SubjectAreaResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

