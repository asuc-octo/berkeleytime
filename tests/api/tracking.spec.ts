import { expect, test } from "@playwright/test";

const validEvent = {
  eventType: "click",
  targetType: "course",
  targetId: "abc123",
  metadata: { source: "test" },
  timestamp: new Date().toISOString(),
};

test.describe("Tracking beacon endpoint", () => {
  test("accepts a valid batch and returns 204", async ({ request }) => {
    const response = await request.post("/api/tracking/beacon", {
      data: { events: [validEvent] },
    });
    expect(response.status()).toBe(204);
  });

  test("accepts max batch size of 50 events", async ({ request }) => {
    const events = Array.from({ length: 50 }, () => ({ ...validEvent }));
    const response = await request.post("/api/tracking/beacon", {
      data: { events },
    });
    expect(response.status()).toBe(204);
  });

  test("rejects batch over 50 events with 400", async ({ request }) => {
    const events = Array.from({ length: 51 }, () => ({ ...validEvent }));
    const response = await request.post("/api/tracking/beacon", {
      data: { events },
    });
    expect(response.status()).toBe(400);
  });

  test("rejects empty events array with 400", async ({ request }) => {
    const response = await request.post("/api/tracking/beacon", {
      data: { events: [] },
    });
    expect(response.status()).toBe(400);
  });

  test("rejects missing events field with 400", async ({ request }) => {
    const response = await request.post("/api/tracking/beacon", {
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test("rate limit: silently drops after 30 calls but still returns 204", async ({
    request,
  }) => {
    // First 30 calls should all succeed
    for (let i = 0; i < 30; i++) {
      const response = await request.post("/api/tracking/beacon", {
        data: { events: [validEvent] },
      });
      expect(response.status()).toBe(204);
    }

    // 31st call is over the limit — still 204 (silent drop, not an error)
    const overLimit = await request.post("/api/tracking/beacon", {
      data: { events: [validEvent] },
    });
    expect(overLimit.status()).toBe(204);
  });
});

test.describe("Tracking GraphQL mutation", () => {
  test("trackEvents returns true for valid batch", async ({ request }) => {
    const response = await request.post("/api/graphql", {
      data: {
        query: `
          mutation TrackEvents($events: [TrackingEventInput!]!) {
            trackEvents(events: $events)
          }
        `,
        variables: {
          events: [validEvent],
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const { data, errors } = await response.json();
    expect(errors).toBeUndefined();
    expect(data.trackEvents).toBe(true);
  });

  test("trackEvents errors on batch over 50", async ({ request }) => {
    const events = Array.from({ length: 51 }, () => ({ ...validEvent }));
    const response = await request.post("/api/graphql", {
      data: {
        query: `
          mutation TrackEvents($events: [TrackingEventInput!]!) {
            trackEvents(events: $events)
          }
        `,
        variables: { events },
      },
    });

    expect(response.ok()).toBeTruthy();
    const { errors } = await response.json();
    expect(errors).toBeDefined();
    expect(errors[0].extensions.code).toBe("BAD_USER_INPUT");
  });

  test("trackEvents accepts events with oversized metadata without error", async ({
    request,
  }) => {
    // Sanitization drops oversized metadata silently — mutation still succeeds
    const bigMetadata: Record<string, string> = {};
    for (let i = 0; i < 25; i++) {
      bigMetadata[`key${i}`] = "x".repeat(300);
    }

    const response = await request.post("/api/graphql", {
      data: {
        query: `
          mutation TrackEvents($events: [TrackingEventInput!]!) {
            trackEvents(events: $events)
          }
        `,
        variables: {
          events: [{ ...validEvent, metadata: bigMetadata }],
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const { data, errors } = await response.json();
    expect(errors).toBeUndefined();
    expect(data.trackEvents).toBe(true);
  });
});
