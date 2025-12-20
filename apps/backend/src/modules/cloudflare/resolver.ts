import { getCloudflareAnalyticsData } from "./controller";

const resolvers = {
  Query: {
    cloudflareAnalyticsData: async (
      _: unknown,
      { days, granularity }: { days: number; granularity?: string },
      context: any
    ) => {
      const gran = granularity === "hour" ? "hour" : "day";
      return getCloudflareAnalyticsData(context, days, gran);
    },
  },
};

export default resolvers;
