enum MetricName {
  Usefulness = "Usefulness",
  Difficulty = "Difficulty",
  Workload = "Workload",
  Attendance = "Attendance",
  Recording = "Recording"
}
// Helper functions to provide tooltip text, status, and status color
function getMetricTooltip(metricName: MetricName): string {
  switch (metricName) {
    case MetricName.Usefulness:
      return "This refers to how beneficial the course is for academic, professional, or personal growth.";
    case MetricName.Difficulty:
      return "This indicates the level of challenge students face in understanding course material.";
    case MetricName.Workload:
      return "This represents the time and effort required for course assignments and activities.";
    case MetricName.Attendance:
      return "Indicates if attendance is required for the course.";
    case MetricName.Recording:
      return "Indicates if the lectures are recorded for the course.";
    default:
      return "";
  }
}

function getMetricStatus(metricName: MetricName, weightedAverage: number): string {
  switch (metricName) {
    case MetricName.Usefulness:
      return weightedAverage >= 4 ? "Very Useful" : weightedAverage >= 2 ? "Moderately Useful" : "Not Useful";
    case MetricName.Difficulty:
      return weightedAverage >= 4 ? "Very Difficult" : weightedAverage >= 2 ? "Moderately Difficult" : "Easy";
    case MetricName.Workload:
      return weightedAverage >= 4 ? "Very Heavy" : weightedAverage >= 2 ? "Moderate Workload" : "Light Workload";
    case MetricName.Attendance:
      return weightedAverage > 0 ? "Required" : "Not Required";
    case MetricName.Recording:
      return weightedAverage > 0 ? "Recorded" : "Not Recorded";
    default:
      return "";
  }
}

function getStatusColor(weightedAverage: number): string {
  if (weightedAverage >= 4) {
    return "statusGreen";
  } else if (weightedAverage >= 2) {
    return "statusOrange";
  } else {
    return "statusRed";
  }
}

export { getMetricTooltip, getMetricStatus, getStatusColor, MetricName };