import { useQuery } from "@apollo/client";

import {
  CLICK_EVENTS_TIME_SERIES,
} from "../../../lib/api/click-tracking";

export interface ClickEventsTimeSeriesPoint {
  date: string;
  count: number;
}

interface ClickEventsTimeSeriesResponse {
  clickEventsTimeSeries: ClickEventsTimeSeriesPoint[];
}

interface UseClickEventsTimeSeriesParams {
  targetId: string | null;
  targetType: "banner" | "redirect" | "targeted-message";
  startDate: string | null;
  endDate: string | null;
}

export const useClickEventsTimeSeries = ({
  targetId,
  targetType,
  startDate,
  endDate,
}: UseClickEventsTimeSeriesParams) => {
  const query = useQuery<ClickEventsTimeSeriesResponse>(
    CLICK_EVENTS_TIME_SERIES,
    {
      variables: {
        targetId: targetId ?? "",
        targetType,
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
      },
      skip: !targetId,
    }
  );

  return {
    ...query,
    data: query.data?.clickEventsTimeSeries ?? [],
  };
};
