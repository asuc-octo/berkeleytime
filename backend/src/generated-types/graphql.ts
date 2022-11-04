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
  catalog?: Maybe<Array<Maybe<CatalogItem>>>;
  grades?: Maybe<Array<Maybe<Grade>>>;
  users?: Maybe<Array<Maybe<User>>>;
};


export type QueryCatalogArgs = {
  courseID: Scalars['String'];
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
  CatalogItem: ResolverTypeWrapper<CatalogItem>;
  Class: ResolverTypeWrapper<Class>;
  Course: ResolverTypeWrapper<Course>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Grade: ResolverTypeWrapper<Grade>;
  Instructor: ResolverTypeWrapper<Instructor>;
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
  Float: Scalars['Float'];
  Grade: Grade;
  Instructor: Instructor;
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
  catalog?: Resolver<Maybe<Array<Maybe<ResolversTypes['CatalogItem']>>>, ParentType, ContextType, RequireFields<QueryCatalogArgs, 'courseID'>>;
  grades?: Resolver<Maybe<Array<Maybe<ResolversTypes['Grade']>>>, ParentType, ContextType>;
  users?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
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
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  google_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  CatalogItem?: CatalogItemResolvers<ContextType>;
  Class?: ClassResolvers<ContextType>;
  Course?: CourseResolvers<ContextType>;
  Grade?: GradeResolvers<ContextType>;
  Instructor?: InstructorResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Section?: SectionResolvers<ContextType>;
  SectionTimes?: SectionTimesResolvers<ContextType>;
  SubjectArea?: SubjectAreaResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

