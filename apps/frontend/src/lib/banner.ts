/**
 * Interface for managing viewed banners in localStorage.
 * Tracks which banners have been dismissed by the user.
 */

const STORAGE_KEY = "viewed-banners";

/**
 * Get all viewed banner IDs from localStorage.
 */
export const getViewedBanners = (): string[] => {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return [];
    return JSON.parse(item) as string[];
  } catch {
    return [];
  }
};

/**
 * Check if a banner has been viewed (dismissed).
 */
export const isBannerViewed = (bannerId: string): boolean => {
  const viewed = getViewedBanners();
  return viewed.includes(bannerId);
};

/**
 * Mark a banner as viewed (dismissed).
 */
export const markBannerAsViewed = (bannerId: string): void => {
  const viewed = getViewedBanners();
  if (!viewed.includes(bannerId)) {
    viewed.push(bannerId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(viewed));
  }
};

/**
 * Remove any viewed banner IDs that are no longer returned by the backend.
 */
export const syncViewedBanners = (activeBannerIds: string[]): void => {
  try {
    const viewed = getViewedBanners();
    const activeSet = new Set(activeBannerIds);
    const filtered = viewed.filter((id) => activeSet.has(id));

    if (filtered.length !== viewed.length) {
      if (filtered.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
    }
  } catch {
    // Ignore sync errors; localStorage is best-effort
  }
};

/**
 * Clear all viewed banners (useful for testing or reset).
 */
export const clearViewedBanners = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
