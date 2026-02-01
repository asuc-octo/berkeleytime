export const BASE = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://berkeleytime.com";

export const signIn = (redirectURI?: string) => {
  redirectURI =
    redirectURI ??
    window.location.origin + window.location.pathname + window.location.search;

  window.location.href = `${window.location.origin}/api/login?redirect_uri=${redirectURI}`;
};
