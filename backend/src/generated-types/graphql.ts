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
};

export type LetterGrade = {
  __typename?: 'LetterGrade';
  numerator: Scalars['Int'];
  percent: Scalars['Float'];
  percentile_high: Scalars['Float'];
  percentile_low: Scalars['Float'];
};

export type Query = {
  __typename?: 'Query';
  Enrollment?: Maybe<Enrollment>;
  grades?: Maybe<Grade>;
  users?: Maybe<Array<Maybe<User>>>;
};


export type QueryEnrollmentArgs = {
  classId: Scalars['String'];
};


export type QueryGradesArgs = {
  CourseControlNumber: Scalars['Int'];
  Semester: Scalars['String'];
  Year: Scalars['Int'];
};

export type User = {
  __typename?: 'User';
  email?: Maybe<Scalars['String']>;
  google_id?: Maybe<Scalars['String']>;
  id: Scalars['String'];
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LetterGradeResolvers<ContextType = any, ParentType extends ResolversParentTypes['LetterGrade'] = ResolversParentTypes['LetterGrade']> = {
  numerator?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  percent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  percentile_high?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  percentile_low?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  Enrollment?: Resolver<Maybe<ResolversTypes['Enrollment']>, ParentType, ContextType, RequireFields<QueryEnrollmentArgs, 'classId'>>;
  grades?: Resolver<Maybe<ResolversTypes['Grade']>, ParentType, ContextType, RequireFields<QueryGradesArgs, 'CourseControlNumber' | 'Semester' | 'Year'>>;
  users?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  google_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Enrollment?: EnrollmentResolvers<ContextType>;
  EnrollmentInfo?: EnrollmentInfoResolvers<ContextType>;
  Grade?: GradeResolvers<ContextType>;
  LetterGrade?: LetterGradeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

