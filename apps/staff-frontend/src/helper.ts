const getDevFrontendPort = () => {
  const port = parseInt(window.location.port || "3000", 10);
  return Math.floor(port / 100) * 100;
};

export const BASE = import.meta.env.DEV
  ? `http://localhost:${getDevFrontendPort()}`
  : "https://berkeleytime.com";

export const signIn = (redirectURI?: string) => {
  redirectURI =
    redirectURI ??
    window.location.origin + window.location.pathname + window.location.search;

  window.location.href = `${window.location.origin}/api/login?redirect_uri=${redirectURI}`;
};
