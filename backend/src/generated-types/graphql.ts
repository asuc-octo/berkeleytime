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
  A: LetterGrade;
  AMinus: LetterGrade;
  APlus: LetterGrade;
  B: LetterGrade;
  BMinus: LetterGrade;
  BPlus: LetterGrade;
  C: LetterGrade;
  CMinus: LetterGrade;
  CPlus: LetterGrade;
  D: LetterGrade;
  F: LetterGrade;
  NP: LetterGrade;
  P: LetterGrade;
  denominator: Scalars['Int'];
  section_gpa: Scalars['Float'];
  section_letter: Scalars['String'];
};

export type LetterGrade = {
  __typename?: 'LetterGrade';
  numerator: Scalars['Int'];
  percent: Scalars['Float'];
  percentile_high: Scalars['Float'];
  percentile_low: Scalars['Float'];
};

export type Mutation = {
  __typename?: 'Mutation';
  UpdateUserEmailPreferences?: Maybe<User>;
  UpdateUserInfo?: Maybe<User>;
  UpdateUserMajor?: Maybe<User>;
};


export type MutationUpdateUserEmailPreferencesArgs = {
  email_berkeleytime_update?: InputMaybe<Scalars['Boolean']>;
  email_class_update?: InputMaybe<Scalars['Boolean']>;
  email_enrollment_opening?: InputMaybe<Scalars['Boolean']>;
  email_grade_update?: InputMaybe<Scalars['Boolean']>;
};


export type MutationUpdateUserInfoArgs = {
  first_name?: InputMaybe<Scalars['String']>;
  last_name?: InputMaybe<Scalars['String']>;
  username?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateUserMajorArgs = {
  major: Array<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  Enrollment?: Maybe<Enrollment>;
  User?: Maybe<User>;
  grades?: Maybe<Grade>;
};


export type QueryEnrollmentArgs = {
  classId: Scalars['String'];
};


export type QueryUserArgs = {
  email: Scalars['String'];
};


export type QueryGradesArgs = {
  CourseControlNumber: Scalars['Int'];
  Semester: Scalars['String'];
  Year: Scalars['Int'];
};

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
  Enrollment: ResolverTypeWrapper<Enrollment>;
  EnrollmentInfo: ResolverTypeWrapper<EnrollmentInfo>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Grade: ResolverTypeWrapper<Grade>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  LetterGrade: ResolverTypeWrapper<LetterGrade>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  Enrollment: Enrollment;
  EnrollmentInfo: EnrollmentInfo;
  Float: Scalars['Float'];
  Grade: Grade;
  Int: Scalars['Int'];
  LetterGrade: LetterGrade;
  Mutation: {};
  Query: {};
  String: Scalars['String'];
  User: User;
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
  A?: Resolver<ResolversTypes['LetterGrade'], ParentType, ContextType>;
  AMinus?: Resolver<ResolversTypes['LetterGrade'], ParentType, ContextType>;
  APlus?: Resolver<ResolversTypes['LetterGrade'], ParentType, ContextType>;
  B?: Resolver<ResolversTypes['LetterGrade'], ParentType, ContextType>;
  BMinus?: Resolver<ResolversTypes['LetterGrade'], ParentType, ContextType>;
  BPlus?: Resolver<ResolversTypes['LetterGrade'], ParentType, ContextType>;
  C?: Resolver<ResolversTypes['LetterGrade'], ParentType, ContextType>;
  CMinus?: Resolver<ResolversTypes['LetterGrade'], ParentType, ContextType>;
  CPlus?: Resolver<ResolversTypes['LetterGrade'], ParentType, ContextType>;
  D?: Resolver<ResolversTypes['LetterGrade'], ParentType, ContextType>;
  F?: Resolver<ResolversTypes['LetterGrade'], ParentType, ContextType>;
  NP?: Resolver<ResolversTypes['LetterGrade'], ParentType, ContextType>;
  P?: Resolver<ResolversTypes['LetterGrade'], ParentType, ContextType>;
  denominator?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  section_gpa?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  section_letter?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LetterGradeResolvers<ContextType = any, ParentType extends ResolversParentTypes['LetterGrade'] = ResolversParentTypes['LetterGrade']> = {
  numerator?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  percent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  percentile_high?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  percentile_low?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  UpdateUserEmailPreferences?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, Partial<MutationUpdateUserEmailPreferencesArgs>>;
  UpdateUserInfo?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, Partial<MutationUpdateUserInfoArgs>>;
  UpdateUserMajor?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserMajorArgs, 'major'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  Enrollment?: Resolver<Maybe<ResolversTypes['Enrollment']>, ParentType, ContextType, RequireFields<QueryEnrollmentArgs, 'classId'>>;
  User?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'email'>>;
  grades?: Resolver<Maybe<ResolversTypes['Grade']>, ParentType, ContextType, RequireFields<QueryGradesArgs, 'CourseControlNumber' | 'Semester' | 'Year'>>;
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
  Enrollment?: EnrollmentResolvers<ContextType>;
  EnrollmentInfo?: EnrollmentInfoResolvers<ContextType>;
  Grade?: GradeResolvers<ContextType>;
  LetterGrade?: LetterGradeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

