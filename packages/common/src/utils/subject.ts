// Normalize subjects coming from user input so they match DB storage.
// Commas/whitespace are stripped (e.g., "A,RESEC" -> "ARESEC") while other
// punctuation like hyphens/slashes/& is preserved to avoid breaking legit
// subject codes (e.g., "HIN-URD", "MALAY/I", "L&S").
export const normalizeSubject = (subject: string) =>
  subject.replace(/[,\s]/g, "").toUpperCase();

// Build a subject query that matches both the raw subject and its normalized
// variant. This lets us query collections where some records include commas
// (e.g., "A,RESEC") and others have them stripped (e.g., "ARESEC").
export const buildSubjectQuery = (subject: string) => {
  const normalized = normalizeSubject(subject);
  const variants = Array.from(
    new Set([subject, subject.toUpperCase(), normalized])
  );
  return { $in: variants };
};
