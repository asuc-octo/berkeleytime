/**
 * Generic URL parser for course inputs
 *
 * Parses all input query parameters from URL into Input objects
 * Filters out invalid inputs and removes duplicates
 */
export function parseInputsFromUrl<T>(
  searchParams: URLSearchParams,
  parseInputString: (inputString: string) => T | null,
  isInputEqual: (a: T, b: T) => boolean
): T[] {
  const inputStrings = searchParams.getAll("input");

  const inputs = inputStrings
    .map(parseInputString)
    .filter((input): input is T => input !== null);

  // Remove duplicates
  return inputs.filter(
    (input, index, arr) =>
      arr.findIndex((i) => isInputEqual(input, i)) === index
  );
}
