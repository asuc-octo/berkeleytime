import { useQuery } from "@apollo/client";

import {
  TRACKING_EVENTS_TIME_SERIES,
  TrackingEventTimeSeriesPoint,
} from "../../../lib/api/tracking";

interface TrackingEventsTimeSeriesResponse {
  trackingEventsTimeSeries: TrackingEventTimeSeriesPoint[];
}

interface UseTrackingEventsTimeSeriesParams {
  eventType?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export const useTrackingEventsTimeSeries = ({
  eventType,
  targetType,
  targetId,
  startDate,
  endDate,
}: UseTrackingEventsTimeSeriesParams) => {
  const query = useQuery<TrackingEventsTimeSeriesResponse>(
    TRACKING_EVENTS_TIME_SERIES,
    {
      variables: {
        eventType: eventType ?? undefined,
        targetType: targetType ?? undefined,
        targetId: targetId ?? undefined,
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
      },
      skip: !targetId && !targetType,
    }
  );

  return {
    ...query,
    data: query.data?.trackingEventsTimeSeries ?? [],
  };
};
