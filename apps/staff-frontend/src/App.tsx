import { useReadUser } from "./hooks/api/users/useReadUser";

const BASE = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://beta.berkeleytime.com";


export const signIn = (redirectURI?: string) => {
  redirectURI =
    redirectURI ??
    window.location.origin + window.location.pathname + window.location.search;

  window.location.href = `${BASE}/api/login?redirect_uri=${redirectURI}`;
};

export default function App() {

  const { data: user, loading: userLoading } = useReadUser();

  if (userLoading || !user) {
    signIn();
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>Staff Dashboard</h1>
    </div>
  );
}
