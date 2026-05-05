import {
  getExploreBecauseYouViewed,
  getExploreCuratedHandpickedCourses,
  getExplorePopularCourseSnapshots,
  getExploreSnapshotsForSubjects,
  getExploreTopPicks,
} from "./controller";

export default {
  Query: {
    explorePopularCourses: async (
      _: unknown,
      args: { limit?: number | null | undefined }
    ) => getExplorePopularCourseSnapshots(args.limit),

    explorePopularCoursesForSubjects: async (
      _: unknown,
      args: { subjects: string[]; limit?: number | null | undefined }
    ) => getExploreSnapshotsForSubjects(args.subjects, args.limit),

    exploreCuratedHandpickedCourses: async () =>
      getExploreCuratedHandpickedCourses(),

    exploreBecauseYouViewed: async (
      _: unknown,
      args: {
        subject: string;
        courseNumber: string;
        year: number;
        semester: string;
        limit?: number | null;
      }
    ) =>
      getExploreBecauseYouViewed(
        args.subject,
        args.courseNumber,
        args.year,
        args.semester,
        args.limit
      ),

    exploreTopPicks: async (
      _: unknown,
      args: {
        history: Array<{ subject: string; courseNumber: string }>;
        year: number;
        semester: string;
        limit?: number | null;
      }
    ) => getExploreTopPicks(args.history, args.year, args.semester, args.limit),
  },
};
