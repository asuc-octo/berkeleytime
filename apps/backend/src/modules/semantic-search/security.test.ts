import assert from "node:assert/strict";
import { test } from "node:test";

import { createRefreshRateLimit, requireStaffRefreshAccess } from "./security";

type ResponseSnapshot = {
  body?: unknown;
  headers: Record<string, string>;
  status?: number;
};

function responseStub(snapshot: ResponseSnapshot) {
  return {
    json(body: unknown) {
      snapshot.body = body;
      return this;
    },
    setHeader(name: string, value: string) {
      snapshot.headers[name.toLowerCase()] = value;
      return this;
    },
    status(status: number) {
      snapshot.status = status;
      return this;
    },
  };
}

test("semantic refresh rejects anonymous callers", async () => {
  const snapshot: ResponseSnapshot = { headers: {} };
  let continued = false;

  await requireStaffRefreshAccess(
    { isAuthenticated: () => false } as never,
    responseStub(snapshot) as never,
    () => {
      continued = true;
    }
  );

  assert.equal(continued, false);
  assert.equal(snapshot.status, 401);
  assert.deepEqual(snapshot.body, { error: "Authentication required" });
});

test("semantic refresh rejects authenticated non-staff callers", async () => {
  const snapshot: ResponseSnapshot = { headers: {} };
  let continued = false;

  await requireStaffRefreshAccess(
    { isAuthenticated: () => true, user: { staff: false } } as never,
    responseStub(snapshot) as never,
    () => {
      continued = true;
    }
  );

  assert.equal(continued, false);
  assert.equal(snapshot.status, 403);
  assert.deepEqual(snapshot.body, { error: "Staff access required" });
});

test("semantic refresh allows authenticated staff callers", async () => {
  const snapshot: ResponseSnapshot = { headers: {} };
  let continued = false;

  await requireStaffRefreshAccess(
    { isAuthenticated: () => true, user: { staff: true } } as never,
    responseStub(snapshot) as never,
    () => {
      continued = true;
    }
  );

  assert.equal(continued, true);
  assert.equal(snapshot.status, undefined);
});

test("semantic refresh rate limiter allows the first build request", async () => {
  const redis = {
    set: async () => "OK",
    ttl: async () => {
      throw new Error("ttl should not be read for an acquired refresh slot");
    },
  };
  const snapshot: ResponseSnapshot = { headers: {} };
  let continued = false;

  await createRefreshRateLimit(redis as never)(
    {} as never,
    responseStub(snapshot) as never,
    () => {
      continued = true;
    }
  );

  assert.equal(continued, true);
  assert.equal(snapshot.status, undefined);
});

test("semantic refresh rate limiter rejects a second build request", async () => {
  const redis = {
    set: async () => null,
    ttl: async () => 47,
  };
  const snapshot: ResponseSnapshot = { headers: {} };
  let continued = false;

  await createRefreshRateLimit(redis as never)(
    {} as never,
    responseStub(snapshot) as never,
    () => {
      continued = true;
    }
  );

  assert.equal(continued, false);
  assert.equal(snapshot.status, 429);
  assert.equal(snapshot.headers["retry-after"], "47");
  assert.deepEqual(snapshot.body, {
    error: "A semantic search refresh was requested recently",
  });
});
