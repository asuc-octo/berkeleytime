const STORAGE_KEY = "berkeley-goggles-visited";

export const BERKELEY_GOGGLES_URL = "https://berkeleygoggles.org/";

export const isBerkeleyGogglesVisited = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return true;
  }
};

export const markBerkeleyGogglesVisited = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // Ignore write errors; localStorage is best-effort
  }
};
