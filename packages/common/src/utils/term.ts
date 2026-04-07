export function parseTermName(
  name: string
): { year: number; semester: string } | null {
  const parts = name.split(" ");
  if (parts.length !== 2) return null;
  const year = parseInt(parts[0], 10);
  if (isNaN(year)) return null;
  return { year, semester: parts[1] };
}
