import { RequestContext } from "../../types/request-context";
import { requireStaffAuth } from "../analytics/helpers/staff-auth";
import {
  DatapullerJob,
  getDatapullerJobStatus,
  triggerDatapuller,
} from "./controller";

const resolver = {
  Query: {
    datapullerJobStatus: async (
      _: unknown,
      { jobName }: { jobName: string },
      context: RequestContext
    ) => {
      await requireStaffAuth(context);
      return getDatapullerJobStatus(jobName);
    },
  },
  Mutation: {
    triggerDatapuller: async (
      _: unknown,
      { job }: { job: DatapullerJob },
      context: RequestContext
    ) => {
      await requireStaffAuth(context);
      return triggerDatapuller(job);
    },
  },
};

export default resolver;
