import { MetricName } from "@repo/shared";

// OUTDATED

export const placeholderRatingsData = [
  {
    metric: MetricName["Usefulness"],
    stats: [
      { rating: 5, percentage: 56 },
      { rating: 4, percentage: 16 },
      { rating: 3, percentage: 11 },
      { rating: 2, percentage: 6 },
      { rating: 1, percentage: 11 },
    ],
    status: "Very Useful",
    statusColor: "statusGreen",
    reviewCount: 218,
  },
  {
    metric: MetricName["Difficulty"],
    stats: [
      { rating: 5, percentage: 30 },
      { rating: 4, percentage: 40 },
      { rating: 3, percentage: 20 },
      { rating: 2, percentage: 5 },
      { rating: 1, percentage: 5 },
    ],
    status: "Moderately Difficult",
    statusColor: "statusOrange",
    reviewCount: 218,
  },
  {
    metric: MetricName["Workload"],
    stats: [
      { rating: 5, percentage: 25 },
      { rating: 4, percentage: 35 },
      { rating: 3, percentage: 25 },
      { rating: 2, percentage: 10 },
      { rating: 1, percentage: 5 },
    ],
    status: "Very Heavy",
    statusColor: "statusRed",
    reviewCount: 218,
  },
];
