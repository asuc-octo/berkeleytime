export interface LatestEnrollment {
  enrolledCount?: number | null;
  maxEnroll?: number | null;
  waitlistedCount?: number | null;
}

export function getEnrollmentColor(count?: number, capacity?: number): string {
  if (typeof count !== "number" || typeof capacity !== "number")
    return "var(--paragraph-color)";

  const percentage = count / capacity;

  return percentage >= 0.75
    ? "var(--rose-500)"
    : percentage > 0.5
      ? "var(--amber-500)"
      : "var(--emerald-500)";
}

/** Enrollment information for the Explore and bookmark cards. */
export function formatEnrollment(
  latest: LatestEnrollment | null | undefined
): { label: string; color: string } | null {
  if (!latest) return null;
  const { enrolledCount, maxEnroll, waitlistedCount } = latest;

  // Capacity is published as 0 when a class takes waitlist entries only.
  if (maxEnroll != null && maxEnroll <= 0) {
    if (!waitlistedCount) return null;
    return {
      label: `${waitlistedCount} waitlisted`,
      color: "var(--rose-500)",
    };
  }

  if (enrolledCount == null || maxEnroll == null) return null;
  return {
    label: `${Math.round((enrolledCount / maxEnroll) * 100)}% enrolled`,
    color: getEnrollmentColor(enrolledCount, maxEnroll),
  };
}
