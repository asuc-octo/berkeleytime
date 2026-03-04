import { useMutation } from "@apollo/client";

import {
  DatapullerJob,
  TRIGGER_DATAPULLER,
  TriggerDatapullerResult,
} from "../../../lib/api/datapuller";

interface TriggerDatapullerResponse {
  triggerDatapuller: TriggerDatapullerResult;
}

export const useTriggerDatapuller = () => {
  const [mutate, result] = useMutation<TriggerDatapullerResponse>(
    TRIGGER_DATAPULLER
  );

  const trigger = async (job: DatapullerJob) => {
    const response = await mutate({ variables: { job } });
    return response.data?.triggerDatapuller;
  };

  return { trigger, ...result };
};
