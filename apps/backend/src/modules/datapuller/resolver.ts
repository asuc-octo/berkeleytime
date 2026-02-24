import { requireStaffAuth } from "../analytics/helpers/staff-auth";
import { RequestContext } from "../../types/request-context";
import { DatapullerJob, triggerDatapuller } from "./controller";

const resolver = {
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