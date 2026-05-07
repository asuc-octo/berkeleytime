import type { Page } from "@playwright/test";

type GraphQLPayload = {
  query: string;
  variables?: Record<string, unknown>;
};

/**
 * POST `/api/graphql` using the same cookie jar as `page` (session from dev login).
 */
export async function postGraphqlWithPageSession(
  page: Page,
  payload: GraphQLPayload
): Promise<unknown> {
  const response = await page.request.post("/api/graphql", {
    data: payload,
  });
  if (!response.ok()) {
    const text = await response.text();
    throw new Error(`GraphQL HTTP ${response.status()}: ${text}`);
  }
  const body = (await response.json()) as {
    data?: unknown;
    errors?: { message: string }[];
  };
  if (body.errors?.length) {
    throw new Error(
      `GraphQL errors: ${body.errors.map((e) => e.message).join("; ")}`
    );
  }
  return body.data;
}

/**
 * Deletes every schedule returned for the current session user.
 * Call from `afterEach` / `afterAll` in authenticated E2E specs.
 */
export async function deleteAllSchedulesForSessionUser(
  page: Page
): Promise<void> {
  const listData = (await postGraphqlWithPageSession(page, {
    query: `query E2ESchedules { schedules { _id } }`,
  })) as { schedules?: { _id: string }[] };

  const ids = listData?.schedules?.map((s) => s._id) ?? [];
  for (const id of ids) {
    await postGraphqlWithPageSession(page, {
      query: `mutation E2EDeleteSchedule($id: ID!) { deleteSchedule(id: $id) }`,
      variables: { id },
    });
  }
}
