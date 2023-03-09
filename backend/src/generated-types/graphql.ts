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
  JSON: any;
  JSONObject: any;
};

export type CatalogClass = {
  __typename?: 'CatalogClass';
  enrollCount: Scalars['Int'];
  enrollMax: Scalars['Int'];
  number: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  unitsMax: Scalars['Float'];
  unitsMin: Scalars['Float'];
};

export type CatalogItem = {
  __typename?: 'CatalogItem';
  classes: Array<Maybe<CatalogClass>>;
  gradeAverage?: Maybe<Scalars['Float']>;
  number: Scalars['String'];
  subject: Scalars['String'];
  title: Scalars['String'];
};

export type Class = {
  __typename?: 'Class';
  course: Course;
  description?: Maybe<Scalars['String']>;
  enrollCount: Scalars['Int'];
  enrollMax: Scalars['Int'];
  number: Scalars['String'];
  raw: Scalars['JSONObject'];
  sections: Array<Maybe<Section>>;
  session: Scalars['String'];
  status: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  unitsMax: Scalars['Float'];
  unitsMin: Scalars['Float'];
  waitlistCount: Scalars['Int'];
  waitlistMax: Scalars['Int'];
};

export type Course = {
  __typename?: 'Course';
  classes: Array<Maybe<Class>>;
  crossListing: Array<Maybe<Course>>;
  department: Scalars['String'];
  description: Scalars['String'];
  gradeAverage?: Maybe<Scalars['Float']>;
  gradingBasis: Scalars['String'];
  level: Scalars['String'];
  number: Scalars['String'];
  prereqs: Scalars['String'];
  raw: Scalars['JSONObject'];
  subject: Scalars['String'];
  subjectName: Scalars['String'];
  title: Scalars['String'];
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

export type Query = {
  __typename?: 'Query';
  User?: Maybe<User>;
  catalog?: Maybe<Array<Maybe<CatalogItem>>>;
  class?: Maybe<Class>;
  course?: Maybe<Course>;
  grade?: Maybe<Grade>;
  ping: Scalars['String'];
  section?: Maybe<Section>;
};


export type QueryUserArgs = {
  email: Scalars['String'];
};


export type QueryCatalogArgs = {
  term: Term;
};


export type QueryClassArgs = {
  classNumber: Scalars['String'];
  courseNumber: Scalars['String'];
  subject: Scalars['String'];
  term: Term;
};


export type QueryCourseArgs = {
  number: Scalars['String'];
  subject: Scalars['String'];
  term: Term;
};


export type QueryGradeArgs = {
  classNum?: InputMaybe<Scalars['String']>;
  courseNum: Scalars['String'];
  subject: Scalars['String'];
  term?: InputMaybe<Term>;
};


export type QuerySectionArgs = {
  classNumber: Scalars['String'];
  courseNumber: Scalars['String'];
  sectionNumber: Scalars['String'];
  subject: Scalars['String'];
  term: Term;
};

export type Section = {
  __typename?: 'Section';
  class: Class;
  course: Course;
  days?: Maybe<Array<Maybe<Scalars['Boolean']>>>;
  enrollCount: Scalars['Int'];
  enrollMax: Scalars['Int'];
  instructors: Array<Maybe<Scalars['String']>>;
  location?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  number: Scalars['String'];
  primary: Scalars['Boolean'];
  raw: Scalars['JSONObject'];
  timeEnd?: Maybe<Scalars['String']>;
  timeStart?: Maybe<Scalars['String']>;
  type: Scalars['String'];
  waitlistCount: Scalars['Int'];
  waitlistMax: Scalars['Int'];
};

export type Semester =
  | 'Fall'
  | 'Spring'
  | 'Summer';

export type Term = {
  semester: Semester;
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
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Grade: ResolverTypeWrapper<Grade>;
  GradeDistributionItem: ResolverTypeWrapper<GradeDistributionItem>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  JSONObject: ResolverTypeWrapper<Scalars['JSONObject']>;
  Query: ResolverTypeWrapper<{}>;
  Section: ResolverTypeWrapper<Section>;
  Semester: Semester;
  String: ResolverTypeWrapper<Scalars['String']>;
  Term: Term;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  CatalogClass: CatalogClass;
  CatalogItem: CatalogItem;
  Class: Class;
  Course: Course;
  Float: Scalars['Float'];
  Grade: Grade;
  GradeDistributionItem: GradeDistributionItem;
  Int: Scalars['Int'];
  JSON: Scalars['JSON'];
  JSONObject: Scalars['JSONObject'];
  Query: {};
  Section: Section;
  String: Scalars['String'];
  Term: Term;
  User: User;
};

export type CatalogClassResolvers<ContextType = any, ParentType extends ResolversParentTypes['CatalogClass'] = ResolversParentTypes['CatalogClass']> = {
  enrollCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  enrollMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unitsMax?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  unitsMin?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CatalogItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['CatalogItem'] = ResolversParentTypes['CatalogItem']> = {
  classes?: Resolver<Array<Maybe<ResolversTypes['CatalogClass']>>, ParentType, ContextType>;
  gradeAverage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
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
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  raw?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  sections?: Resolver<Array<Maybe<ResolversTypes['Section']>>, ParentType, ContextType>;
  session?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unitsMax?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  unitsMin?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  waitlistCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  waitlistMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CourseResolvers<ContextType = any, ParentType extends ResolversParentTypes['Course'] = ResolversParentTypes['Course']> = {
  classes?: Resolver<Array<Maybe<ResolversTypes['Class']>>, ParentType, ContextType>;
  crossListing?: Resolver<Array<Maybe<ResolversTypes['Course']>>, ParentType, ContextType>;
  department?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gradeAverage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  gradingBasis?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  level?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  prereqs?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  raw?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  subject?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subjectName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export interface JsonObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  User?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'email'>>;
  catalog?: Resolver<Maybe<Array<Maybe<ResolversTypes['CatalogItem']>>>, ParentType, ContextType, RequireFields<QueryCatalogArgs, 'term'>>;
  class?: Resolver<Maybe<ResolversTypes['Class']>, ParentType, ContextType, RequireFields<QueryClassArgs, 'classNumber' | 'courseNumber' | 'subject' | 'term'>>;
  course?: Resolver<Maybe<ResolversTypes['Course']>, ParentType, ContextType, RequireFields<QueryCourseArgs, 'number' | 'subject' | 'term'>>;
  grade?: Resolver<Maybe<ResolversTypes['Grade']>, ParentType, ContextType, RequireFields<QueryGradeArgs, 'courseNum' | 'subject'>>;
  ping?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  section?: Resolver<Maybe<ResolversTypes['Section']>, ParentType, ContextType, RequireFields<QuerySectionArgs, 'classNumber' | 'courseNumber' | 'sectionNumber' | 'subject' | 'term'>>;
};

export type SectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Section'] = ResolversParentTypes['Section']> = {
  class?: Resolver<ResolversTypes['Class'], ParentType, ContextType>;
  course?: Resolver<ResolversTypes['Course'], ParentType, ContextType>;
  days?: Resolver<Maybe<Array<Maybe<ResolversTypes['Boolean']>>>, ParentType, ContextType>;
  enrollCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  enrollMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  instructors?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  primary?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  raw?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  timeEnd?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timeStart?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  waitlistCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  waitlistMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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
  Grade?: GradeResolvers<ContextType>;
  GradeDistributionItem?: GradeDistributionItemResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  JSONObject?: GraphQLScalarType;
  Query?: QueryResolvers<ContextType>;
  Section?: SectionResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};


export type Json = Scalars["JSON"];
export type JsonObject = Scalars["JSONObject"];