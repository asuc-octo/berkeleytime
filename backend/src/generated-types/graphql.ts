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

export type CacheControlScope =
  | 'PRIVATE'
  | 'PUBLIC';

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
  /** For the schedule specified by the ID, modifies the class ID field and returns the updated schedule. */
  setSelectedClasses?: Maybe<Schedule>;
  /** For the schedule specified by the ID, modifies the section ID field and returns the updated schedule. */
  setSelectedSections?: Maybe<Schedule>;
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
  class_IDs: Array<Scalars['String']>;
  id: Scalars['ID'];
};


export type MutationSetSelectedSectionsArgs = {
  id: Scalars['ID'];
  section_IDs: Array<Scalars['String']>;
};


export type MutationUpdateUserInfoArgs = {
  newUserInfo: UserInput;
};

export type Query = {
  __typename?: 'Query';
  ping: Scalars['String'];
  /** Takes in a schedule's ObjectID and returns a specific schedule. */
  scheduleByID?: Maybe<Schedule>;
  /** Takes in a user's email and returns all the schedules they created. */
  schedulesByUser?: Maybe<Array<Maybe<Schedule>>>;
  /** Query for user info. */
  user?: Maybe<User>;
};


export type QueryScheduleByIdArgs = {
  id: Scalars['String'];
};


export type QuerySchedulesByUserArgs = {
  created_by: Scalars['String'];
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

/** User accout info. */
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
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CacheControlScope: CacheControlScope;
  CustomEvent: ResolverTypeWrapper<CustomEvent>;
  CustomEventInput: CustomEventInput;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  ISODate: ResolverTypeWrapper<Scalars['ISODate']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  JSONObject: ResolverTypeWrapper<Scalars['JSONObject']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  Schedule: ResolverTypeWrapper<Schedule>;
  ScheduleInput: ScheduleInput;
  Semester: Semester;
  String: ResolverTypeWrapper<Scalars['String']>;
  TermInput: TermInput;
  TermOutput: ResolverTypeWrapper<TermOutput>;
  User: ResolverTypeWrapper<User>;
  UserInput: UserInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  CustomEvent: CustomEvent;
  CustomEventInput: CustomEventInput;
  ID: Scalars['ID'];
  ISODate: Scalars['ISODate'];
  Int: Scalars['Int'];
  JSON: Scalars['JSON'];
  JSONObject: Scalars['JSONObject'];
  Mutation: {};
  Query: {};
  Schedule: Schedule;
  ScheduleInput: ScheduleInput;
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

export type CustomEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['CustomEvent'] = ResolversParentTypes['CustomEvent']> = {
  days_of_week?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  end_time?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  start_time?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface IsoDateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ISODate'], any> {
  name: 'ISODate';
}

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export interface JsonObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createNewSchedule?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<MutationCreateNewScheduleArgs, 'main_schedule'>>;
  deleteUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  editExistingSchedule?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<MutationEditExistingScheduleArgs, 'id' | 'main_schedule'>>;
  removeScheduleByID?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationRemoveScheduleByIdArgs, 'id'>>;
  setSelectedClasses?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<MutationSetSelectedClassesArgs, 'class_IDs' | 'id'>>;
  setSelectedSections?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<MutationSetSelectedSectionsArgs, 'id' | 'section_IDs'>>;
  updateUserInfo?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserInfoArgs, 'newUserInfo'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  ping?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scheduleByID?: Resolver<Maybe<ResolversTypes['Schedule']>, ParentType, ContextType, RequireFields<QueryScheduleByIdArgs, 'id'>>;
  schedulesByUser?: Resolver<Maybe<Array<Maybe<ResolversTypes['Schedule']>>>, ParentType, ContextType, RequireFields<QuerySchedulesByUserArgs, 'created_by'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
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
  CustomEvent?: CustomEventResolvers<ContextType>;
  ISODate?: GraphQLScalarType;
  JSON?: GraphQLScalarType;
  JSONObject?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Schedule?: ScheduleResolvers<ContextType>;
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