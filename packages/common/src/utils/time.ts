export const parseTimeToMinutes = (time: string): number | null => {
  const parts = time.split(":").map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return parts[0] * 60 + parts[1];
};
