import type { Page } from "@playwright/test";

/**
 * Must match `DEV_AUTH_LOGIN_ROUTE` in `apps/frontend/src/utils/devAuth.ts`
 * (backend mounts the app at `BACKEND_PATH`, default `/api`).
 */
export const DEV_LOGIN_RELATIVE_PATH = "/api/dev/login";
export const DEV_USERS_RELATIVE_PATH = "/api/dev/users";
export const DEFAULT_E2E_DEV_EMAIL = "dev@berkeleytime.local";

export function getE2EDevUserId(): string | undefined {
  const id = process.env.E2E_DEV_USER_ID?.trim();
  return id || undefined;
}

/**
 * Stable identifier used to locate the dev user at runtime via `/api/dev/users`.
 */
export function getE2EDevEmail(): string | undefined {
  const email = process.env.E2E_DEV_EMAIL?.trim();
  return email || DEFAULT_E2E_DEV_EMAIL;
}

/**
 * Dev-only login and dev user identity are unavailable — skip auth E2E
 * (e.g. production monitoring, or CI without secrets).
 */
export function shouldSkipDevAuthE2E(): boolean {
  if (process.env.TEST_ENV === "production") {
    return true;
  }
  return !getE2EDevUserId() && !getE2EDevEmail();
}

export function buildDevLoginUrl(opts: {
  baseURL: string;
  userId: string;
  /** In-app path after login (must start with `/`). */
  redirectPath?: string;
}): string {
  const redirectPath = opts.redirectPath ?? "/";
  const redirect =
    redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
  const params = new URLSearchParams({
    userId: opts.userId,
    redirect_uri: redirect,
  });
  const base = opts.baseURL.replace(/\/$/, "");
  return `${base}${DEV_LOGIN_RELATIVE_PATH}?${params.toString()}`;
}

type DevUser = {
  _id: string;
  email: string;
};

async function resolveDevUserId(page: Page): Promise<string> {
  const explicitId = getE2EDevUserId();
  if (explicitId) return explicitId;

  const email = getE2EDevEmail();
  if (!email) {
    throw new Error(
      "Set E2E_DEV_EMAIL (preferred) or E2E_DEV_USER_ID for authenticated E2E."
    );
  }

  const usersResponse = await page.request.get(DEV_USERS_RELATIVE_PATH);
  if (!usersResponse.ok()) {
    throw new Error(
      `Failed to resolve dev user id: ${DEV_USERS_RELATIVE_PATH} returned HTTP ${usersResponse.status()}`
    );
  }

  const users = (await usersResponse.json()) as DevUser[];
  const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!matched?._id) {
    throw new Error(
      `No dev user with email '${email}' found at ${DEV_USERS_RELATIVE_PATH}.`
    );
  }
  return matched._id;
}

/**
 * Opens the dev-only session cookie flow (`GET …/api/dev/login`).
 * Requires Playwright `baseURL` and backend running with `NODE_ENV=development`.
 *
 * After this, `page` shares the logged-in session for navigations and
 * `page.request` calls to `/api/graphql`.
 */
export async function loginAsDevUser(
  page: Page,
  opts?: { redirectPath?: string }
): Promise<string> {
  const userId = await resolveDevUserId(page);
  const redirectPath = opts?.redirectPath ?? "/";
  const params = new URLSearchParams({
    userId,
    redirect_uri: redirectPath.startsWith("/")
      ? redirectPath
      : `/${redirectPath}`,
  });
  const response = await page.goto(`${DEV_LOGIN_RELATIVE_PATH}?${params.toString()}`);
  await page.waitForLoadState("load");

  if (response && response.status() >= 400) {
    throw new Error(
      `Dev login endpoint failed with HTTP ${response.status()} at ${response.url()}`
    );
  }

  const err = new URL(page.url()).searchParams.get("devAuthError");
  if (err) {
    throw new Error(`Dev login failed (devAuthError=${err})`);
  }

  // Guard rail: verify this browser context now has an authenticated session.
  const meResponse = await page.request.post("/api/graphql", {
    data: {
      query: "query E2ELoggedInUser { user { _id email } }",
    },
  });
  if (!meResponse.ok()) {
    throw new Error(
      `Failed to verify auth session: /api/graphql returned HTTP ${meResponse.status()}`
    );
  }
  const meBody = (await meResponse.json()) as {
    data?: { user?: { _id?: string } | null };
    errors?: { message: string }[];
  };
  if (meBody.errors?.length) {
    throw new Error(
      `Failed to verify auth session: ${meBody.errors.map((e) => e.message).join("; ")}`
    );
  }
  if (!meBody.data?.user?._id) {
    throw new Error(
      "Dev login did not create an authenticated session (GraphQL `user` is null)."
    );
  }

  return userId;
}
