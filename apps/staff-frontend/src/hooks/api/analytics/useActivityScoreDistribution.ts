import { useQuery } from "@apollo/client";

import {
  ACTIVITY_SCORE_DISTRIBUTION,
  ActivityScoreDistributionPoint,
  FormulaName,
} from "../../../lib/api/analytics";

interface ActivityScoreDistributionResponse {
  activityScoreDistribution: ActivityScoreDistributionPoint[];
}

export const useActivityScoreDistribution = (formula: FormulaName) => {
  const query = useQuery<ActivityScoreDistributionResponse>(
    ACTIVITY_SCORE_DISTRIBUTION,
    { variables: { formula } }
  );

  return {
    ...query,
    data: query.data?.activityScoreDistribution ?? [],
  };
};
