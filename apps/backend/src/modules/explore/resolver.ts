import type { RedisClientType } from "redis";

import {
  getExploreBecauseYouViewedBatch,
  getExploreCuratedHandpickedCourses,
  getExplorePopularCourseSnapshots,
  getExploreSnapshotsForSubjects,
  getExploreTopPicks,
} from "./controller";

interface GraphQLContext {
  redis: RedisClientType;
}

export default {
  Query: {
    explorePopularCourses: async (
      _: unknown,
      args: { limit?: number | null | undefined },
      context: GraphQLContext
    ) => getExplorePopularCourseSnapshots(args.limit, context.redis),

    explorePopularCoursesForSubjects: async (
      _: unknown,
      args: { subjects: string[]; limit?: number | null | undefined },
      context: GraphQLContext
    ) =>
      getExploreSnapshotsForSubjects(args.subjects, args.limit, context.redis),

    exploreCuratedHandpickedCourses: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => getExploreCuratedHandpickedCourses(context.redis),

    exploreBecauseYouViewedBatch: async (
      _: unknown,
      args: {
        anchors: Array<{ subject: string; courseNumber: string }>;
        year: number;
        semester: string;
        limit?: number | null;
        history?: Array<{ subject: string; courseNumber: string }> | null;
        maxRows?: number | null;
      },
      context: GraphQLContext
    ) =>
      getExploreBecauseYouViewedBatch(
        args.anchors,
        args.year,
        args.semester,
        args.limit,
        args.history,
        args.maxRows,
        context.redis
      ),

    exploreTopPicks: async (
      _: unknown,
      args: {
        history: Array<{ subject: string; courseNumber: string }>;
        year: number;
        semester: string;
        limit?: number | null;
      },
      context: GraphQLContext
    ) =>
      getExploreTopPicks(
        args.history,
        args.year,
        args.semester,
        args.limit,
        context.redis
      ),
  },
};
