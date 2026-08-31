const DEFAULT_CLUSTER = "campus";

// Several images for one cluster are numbered, e.g. computing-1.jpg.
const VARIANTS: Record<string, string[]> = {};
for (const { file, url } of Object.entries(
  import.meta.glob<string>("../assets/course-cards/*.jpg", {
    eager: true,
    import: "default",
    query: "?url",
  })
)
  .map(([path, url]) => ({
    file: path.slice(path.lastIndexOf("/") + 1, -4),
    url,
  }))
  .sort((a, b) => a.file.localeCompare(b.file))) {
  const base = file.replace(/-\d+$/, "");
  (VARIANTS[base] ??= []).push(url);
}

function hash(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function courseCardImageUrl(
  cluster?: string | null,
  key?: string
): string {
  const urls =
    VARIANTS[cluster ?? DEFAULT_CLUSTER] ?? VARIANTS[DEFAULT_CLUSTER];
  if (!urls?.length) return "";
  return urls[key ? hash(key) % urls.length : 0];
}

export const DEFAULT_COURSE_CARD_IMAGE = courseCardImageUrl();
