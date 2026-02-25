import { useQuery } from "@apollo/client";

import {
  DATAPULLER_JOB_STATUS,
  DatapullerJobPhase,
  DatapullerJobStatus,
} from "../../../lib/api/datapuller";

interface DatapullerJobStatusResponse {
  datapullerJobStatus: DatapullerJobStatus;
}

const TERMINAL_PHASES: DatapullerJobPhase[] = ["Succeeded", "Failed", "NotFound"];

export const useDatapullerJobStatus = (jobName: string | null) => {
  const { data, ...rest } = useQuery<DatapullerJobStatusResponse>(
    DATAPULLER_JOB_STATUS,
    {
      variables: { jobName },
      skip: !jobName,
      pollInterval: TERMINAL_PHASES.includes(
        data?.datapullerJobStatus?.phase as DatapullerJobPhase
      )
        ? 0
        : 3000,
    }
  );

  return { status: data?.datapullerJobStatus ?? null, ...rest };
};
