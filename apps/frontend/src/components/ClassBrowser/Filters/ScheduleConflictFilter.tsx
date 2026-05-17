import { useMemo } from "react";

import { Select } from "@repo/theme";

import { useReadSchedules } from "@/hooks/api";
import useUser from "@/hooks/useUser";

import { useFilterContext } from "../context/FilterContext";
import styles from "./Filters.module.scss";

export default function ScheduleConflictFilter() {
  const { user } = useUser();
  const {
    year,
    semester,
    scheduleConflictFilter,
    updateScheduleConflictFilter,
  } = useFilterContext();

  // Only fetch schedules if user is logged in
  const { data: schedules, loading } = useReadSchedules({
    skip: !user,
  });

  // Filter schedules to current term
  const matchingSchedules = useMemo(() => {
    if (!schedules) return [];
    return schedules.filter(
      (s) => s?.year === year && s?.semester === semester
    );
  }, [schedules, year, semester]);

  // Don't render if not logged in
  if (!user) return null;

  // Don't render if no schedules for this term (but still show if loading)
  if (!loading && matchingSchedules.length === 0) return null;

  const options = matchingSchedules.map((s) => ({
    value: s!._id,
    label: s!.name,
  }));

  return (
    <div className={styles.formControl}>
      <p className={styles.label}>No Conflict With Schedule</p>
      <Select
        value={scheduleConflictFilter}
        placeholder="Select a schedule"
        clearable
        disabled={loading}
        onChange={(value) =>
          updateScheduleConflictFilter(Array.isArray(value) ? value[0] : value)
        }
        options={options}
      />
    </div>
  );
}
