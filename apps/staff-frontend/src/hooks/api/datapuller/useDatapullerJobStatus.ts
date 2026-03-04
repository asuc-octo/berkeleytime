import { useEffect } from "react";

import { useQuery } from "@apollo/client";

import {
  DATAPULLER_JOB_STATUS,
  DatapullerJobPhase,
  DatapullerJobStatus,
} from "../../../lib/api/datapuller";

interface DatapullerJobStatusResponse {
  datapullerJobStatus: DatapullerJobStatus;
}

const TERMINAL_PHASES: DatapullerJobPhase[] = [
  "Succeeded",
  "Failed",
  "NotFound",
];

export const useDatapullerJobStatus = (jobName: string | null) => {
  const { data, stopPolling, ...rest } = useQuery<DatapullerJobStatusResponse>(
    DATAPULLER_JOB_STATUS,
    {
      variables: { jobName },
      skip: !jobName,
      pollInterval: 3000,
    }
  );

  useEffect(() => {
    const phase = data?.datapullerJobStatus?.phase as
      | DatapullerJobPhase
      | undefined;
    if (phase && TERMINAL_PHASES.includes(phase)) {
      stopPolling();
    }
  }, [data, stopPolling]);

  return { status: data?.datapullerJobStatus ?? null, ...rest };
};
