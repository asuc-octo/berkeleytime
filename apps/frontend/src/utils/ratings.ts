export const clampCount = (count?: number | null): number => {
  if (typeof count !== "number" || !Number.isFinite(count)) {
    return 0;
  }

  return Math.max(count, 0);
};
