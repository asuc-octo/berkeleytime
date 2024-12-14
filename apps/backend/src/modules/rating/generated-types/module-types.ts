import * as Types from "../../../generated-types/graphql";
import * as gm from "graphql-modules";
export namespace RatingModule {
  interface DefinedFields {
    AggregatedRatings: 'subject' | 'courseNumber' | 'classNumber' | 'semester' | 'year' | 'metrics';
    Metric: 'metricName' | 'count' | 'weightedAverage' | 'categories';
    Category: 'value' | 'count';
    UserRatings: 'createdBy' | 'count' | 'classes';
    UserClass: 'subject' | 'courseNumber' | 'semester' | 'year' | 'classNumber' | 'metrics' | 'lastUpdated';
    UserMetric: 'metricName' | 'value';
    SemesterRatings: 'semester' | 'year' | 'maxMetricCount';
    Query: 'aggregatedRatings' | 'userRatings' | 'userClassRatings' | 'semestersWithRatings';
    Mutation: 'createRating' | 'deleteRating';
  };
  
  interface DefinedEnumValues {
    MetricName: 'Usefulness' | 'Difficulty' | 'Workload' | 'Attendance' | 'Recording' | 'Recommended';
  };
  
  export type MetricName = DefinedEnumValues['MetricName'];
  export type AggregatedRatings = Pick<Types.AggregatedRatings, DefinedFields['AggregatedRatings']>;
  export type Semester = Types.Semester;
  export type Metric = Pick<Types.Metric, DefinedFields['Metric']>;
  export type Category = Pick<Types.Category, DefinedFields['Category']>;
  export type UserRatings = Pick<Types.UserRatings, DefinedFields['UserRatings']>;
  export type UserClass = Pick<Types.UserClass, DefinedFields['UserClass']>;
  export type UserMetric = Pick<Types.UserMetric, DefinedFields['UserMetric']>;
  export type SemesterRatings = Pick<Types.SemesterRatings, DefinedFields['SemesterRatings']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type AggregatedRatingsResolvers = Pick<Types.AggregatedRatingsResolvers, DefinedFields['AggregatedRatings'] | '__isTypeOf'>;
  export type MetricResolvers = Pick<Types.MetricResolvers, DefinedFields['Metric'] | '__isTypeOf'>;
  export type CategoryResolvers = Pick<Types.CategoryResolvers, DefinedFields['Category'] | '__isTypeOf'>;
  export type UserRatingsResolvers = Pick<Types.UserRatingsResolvers, DefinedFields['UserRatings'] | '__isTypeOf'>;
  export type UserClassResolvers = Pick<Types.UserClassResolvers, DefinedFields['UserClass'] | '__isTypeOf'>;
  export type UserMetricResolvers = Pick<Types.UserMetricResolvers, DefinedFields['UserMetric'] | '__isTypeOf'>;
  export type SemesterRatingsResolvers = Pick<Types.SemesterRatingsResolvers, DefinedFields['SemesterRatings'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    AggregatedRatings?: AggregatedRatingsResolvers;
    Metric?: MetricResolvers;
    Category?: CategoryResolvers;
    UserRatings?: UserRatingsResolvers;
    UserClass?: UserClassResolvers;
    UserMetric?: UserMetricResolvers;
    SemesterRatings?: SemesterRatingsResolvers;
    Query?: QueryResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    AggregatedRatings?: {
      '*'?: gm.Middleware[];
      subject?: gm.Middleware[];
      courseNumber?: gm.Middleware[];
      classNumber?: gm.Middleware[];
      semester?: gm.Middleware[];
      year?: gm.Middleware[];
      metrics?: gm.Middleware[];
    };
    Metric?: {
      '*'?: gm.Middleware[];
      metricName?: gm.Middleware[];
      count?: gm.Middleware[];
      weightedAverage?: gm.Middleware[];
      categories?: gm.Middleware[];
    };
    Category?: {
      '*'?: gm.Middleware[];
      value?: gm.Middleware[];
      count?: gm.Middleware[];
    };
    UserRatings?: {
      '*'?: gm.Middleware[];
      createdBy?: gm.Middleware[];
      count?: gm.Middleware[];
      classes?: gm.Middleware[];
    };
    UserClass?: {
      '*'?: gm.Middleware[];
      subject?: gm.Middleware[];
      courseNumber?: gm.Middleware[];
      semester?: gm.Middleware[];
      year?: gm.Middleware[];
      classNumber?: gm.Middleware[];
      metrics?: gm.Middleware[];
      lastUpdated?: gm.Middleware[];
    };
    UserMetric?: {
      '*'?: gm.Middleware[];
      metricName?: gm.Middleware[];
      value?: gm.Middleware[];
    };
    SemesterRatings?: {
      '*'?: gm.Middleware[];
      semester?: gm.Middleware[];
      year?: gm.Middleware[];
      maxMetricCount?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      aggregatedRatings?: gm.Middleware[];
      userRatings?: gm.Middleware[];
      userClassRatings?: gm.Middleware[];
      semestersWithRatings?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      createRating?: gm.Middleware[];
      deleteRating?: gm.Middleware[];
    };
  };
}