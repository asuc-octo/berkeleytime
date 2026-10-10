import { useQuery } from "@apollo/client";

import {
  GRADES_PERCENTILE_SLIDER_USAGE,
  GradesPercentileSliderUsage,
} from "../../../lib/api/analytics";

export const useGradesPercentileSliderUsage = (days: number) => {
  const query = useQuery<{
    gradesPercentileSliderUsage: GradesPercentileSliderUsage;
  }>(GRADES_PERCENTILE_SLIDER_USAGE, { variables: { days } });

  return {
    ...query,
    data: query.data?.gradesPercentileSliderUsage ?? null,
  };
};
