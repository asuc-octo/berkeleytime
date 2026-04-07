/**
 * Development-only authentication utilities and constants.
 * This file is only used in development mode.
 */

// localStorage keys
export const DEV_AUTH_USER_ID_KEY = "bt.devAuth.userId";
export const DEV_AUTH_COLLAPSED_KEY = "bt.devAuth.collapsed";

// API routes
export const DEV_AUTH_LOGIN_ROUTE = "/api/dev/login";
export const DEV_AUTH_USERS_ROUTE = "/api/dev/users";

// Types
export interface DevUser {
  _id: string;
  email: string;
  name: string;
  staff: boolean;
}

// Helper functions
export const getStoredDevUserId = (): string | null => {
  return localStorage.getItem(DEV_AUTH_USER_ID_KEY);
};

export const setStoredDevUserId = (userId: string): void => {
  localStorage.setItem(DEV_AUTH_USER_ID_KEY, userId);
};

export const clearStoredDevUserId = (): void => {
  localStorage.removeItem(DEV_AUTH_USER_ID_KEY);
};

export const isDevAuthCollapsed = (): boolean => {
  return localStorage.getItem(DEV_AUTH_COLLAPSED_KEY) === "true";
};

export const setDevAuthCollapsed = (collapsed: boolean): void => {
  localStorage.setItem(DEV_AUTH_COLLAPSED_KEY, String(collapsed));
};
