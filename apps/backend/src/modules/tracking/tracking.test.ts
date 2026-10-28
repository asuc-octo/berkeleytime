import express, { type Request } from "express";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import type { RedisClientType } from "redis";

import { TrackingEventModel } from "@repo/common/models";

import { flushTrackingEvents, getTrackingEventsTimeSeries } from "./controller";
import {
  TRACKING_QUEUE_KEYS,
  bufferTrackingEvents,
  readTrackingLimits,
} from "./ingest";
import resolvers from "./resolver";
import trackingRoutes from "./routes";
import {
  InvalidTrackingBatch,
  MAX_EVENT_BYTES,
  parseClientTimestamp,
  validateTrackingBatch,
} from "./validation";

const valid = {
  eventType: "search_click",
  targetType: "course",
  targetId: "COMPSCI-61A",
  timestamp: "2099-01-01T00:00:00Z",
};
const req = {
  headers: {},
  ip: "127.0.0.1",
  sessionID: "real-session",
  user: { _id: "real-user" },
  get: () => undefined,
} as unknown as Request;

test("accepts every current event pair and rejects arbitrary combinations", () => {
  const pairs = {
    click: [
      "banner",
      "redirect",
      "targeted-message",
      "nav-item",
      "apply-button",
    ],
    view: ["banner", "class"],
    dismiss: ["banner"],
    search: ["course"],
    search_click: ["course"],
    schedule_saved: ["schedule"],
    schedule_generate: ["schedule"],
    course_result_clicked: ["class"],
    search_filter_applied: ["catalog_filter"],
    page_error: ["course-discovery"],
    data_load_failed: ["course-discovery"],
    search_failed: ["course-discovery"],
  };
  for (const [eventType, targets] of Object.entries(pairs)) {
    for (const targetType of targets)
      assert.equal(
        validateTrackingBatch([{ ...valid, eventType, targetType }]).length,
        1
      );
  }
  for (const event of [
    null,
    [],
    "click",
    {},
    { ...valid, eventType: "c$lick" },
    { ...valid, eventType: "__proto__" },
    { ...valid, targetType: "banner" },
    { ...valid, targetId: {} },
    { ...valid, targetId: "a".repeat(129) },
    { ...valid, metadata: [] },
    { ...valid, timestamp: null },
  ]) {
    assert.throws(() => validateTrackingBatch([event]), InvalidTrackingBatch);
  }
  for (const batch of [null, [], [valid, null], Array(51).fill(valid)]) {
    assert.throws(() => validateTrackingBatch(batch), InvalidTrackingBatch);
  }
  assert.equal(validateTrackingBatch(Array(50).fill(valid)).length, 50);
  // Catalog callers compose IDs from subjects such as "CHM ENG"; a token
  // regex would silently remove legitimate events from these departments.
  assert.equal(
    validateTrackingBatch([{ ...valid, targetId: "CHM ENG-141" }])[0].targetId,
    "CHM ENG-141"
  );
});

test("bounds metadata bytes, keys, nesting, and unsafe keys", () => {
  const [event] = validateTrackingBatch([
    {
      ...valid,
      metadata: {
        "$op.path": "x".repeat(400),
        nested: { next: { forbidden: true } },
        array: [1, 2],
        __proto__: "ignored",
        number: Infinity,
      },
    },
  ]);
  assert.equal(event.metadata?._op_path, "x".repeat(256));
  assert.equal(
    JSON.stringify(event.metadata?.nested),
    JSON.stringify({ next: {} })
  );
  assert.equal(event.metadata?.array, undefined);
  assert.equal(event.metadata?.number, undefined);
  const meta = Object.fromEntries(
    Array.from({ length: 30 }, (_, i) => [`key${i}`, "é".repeat(256)])
  );
  assert.equal(
    validateTrackingBatch([{ ...valid, metadata: meta }])[0].metadata,
    undefined
  );
  const small = Object.fromEntries(
    Array.from({ length: 30 }, (_, i) => [`key${i}`, true])
  );
  assert.equal(
    Object.keys(
      validateTrackingBatch([{ ...valid, metadata: small }])[0].metadata!
    ).length,
    20
  );
});

test("configuration preserves source reserves and rejects invalid limits", () => {
  assert.deepEqual(readTrackingLimits({}), {
    client: { daily: 80_000, ipDaily: 8_000, queue: 8_000 },
    "server-redirect": { daily: 20_000, ipDaily: 2_000, queue: 2_000 },
  });
  for (const value of ["", "NaN", "-1", "0", "1.5", "1000000001"]) {
    assert.throws(() =>
      readTrackingLimits({ TRACKING_GLOBAL_DAILY_EVENT_LIMIT: value })
    );
  }
});

test("client timestamps never select reporting time or provenance", async () => {
  for (const timestamp of [
    "not-a-date",
    "2000-01-01T00:00:00Z",
    valid.timestamp,
  ]) {
    let payload: Record<string, unknown> | undefined;
    const redis = {
      eval: async (_: string, options: { arguments: string[] }) => {
        payload = JSON.parse(options.arguments[5]);
        return [1, "accepted", 1, 0];
      },
    } as unknown as RedisClientType;
    const before = Date.now();
    await bufferTrackingEvents(redis, req, [
      {
        ...valid,
        timestamp,
        source: "server-redirect",
        userId: "victim",
        sessionId: "fake",
        ipHash: "fake",
      },
    ]);
    assert.equal(payload?.source, "client");
    assert.equal(payload?.userId, "real-user");
    assert.equal(payload?.sessionId, "real-session");
    assert.match(payload?.ipHash as string, /^[a-f0-9]{64}$/);
    assert.ok(Date.parse(payload?.timestamp as string) >= before);
    assert.ok(Date.parse(payload?.timestamp as string) <= Date.now());
    assert.equal(payload?.clientTimestamp, parseClientTimestamp(timestamp));
    assert.ok(Buffer.byteLength(JSON.stringify(payload)) <= MAX_EVENT_BYTES);
  }
});

test("bounds request headers even when expanded JSON escaping exceeds the event limit", async () => {
  let calls = 0;
  const redis = {
    eval: async () => {
      calls++;
      return [1, "accepted", 1, 0];
    },
  } as unknown as RedisClientType;
  const oversized = {
    ...req,
    get: () => "\u0001".repeat(10_000),
  } as unknown as Request;
  await bufferTrackingEvents(redis, oversized, [valid]);
  assert.equal(calls, 0);
});

test("beacon and GraphQL share admission and retain silent-drop contracts", async (t) => {
  let calls = 0;
  const redis = {
    eval: async () => {
      calls++;
      return [0, "global", 0, 0];
    },
  } as unknown as RedisClientType;
  const app = express();
  app.use(express.json());
  trackingRoutes(app, redis);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  t.after(
    () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
      )
  );
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/tracking/beacon`;
  const post = (events: unknown) =>
    fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ events }),
    });
  assert.equal((await post([valid])).status, 204);
  assert.equal((await post([null])).status, 400);
  assert.equal((await post([valid, null])).status, 400);
  assert.equal(calls, 1);
  const context = { redis, req, user: { _id: "", isAuthenticated: false } };
  assert.equal(
    await resolvers.Mutation.trackEvents(null, { events: [valid] }, context),
    true
  );
  assert.equal(calls, 2);
  await assert.rejects(
    resolvers.Mutation.trackEvents(
      null,
      { events: [{ ...valid, eventType: "fake" }] },
      context
    ),
    (error: unknown) =>
      (error as { extensions: { code: string } }).extensions.code ===
      "BAD_USER_INPUT"
  );
  const down = {
    eval: async () => {
      throw new Error("redis down");
    },
  } as unknown as RedisClientType;
  assert.equal(
    await resolvers.Mutation.trackEvents(
      null,
      { events: [valid] },
      { ...context, redis: down }
    ),
    true
  );
});

test("flush discards malformed records, preserves old provenance, and accepts delayed records", async (t) => {
  const buffered = {
    ...valid,
    timestamp: "2000-01-01T00:00:00Z",
    sessionId: "anonymous",
    ipHash: "a".repeat(64),
  };
  const queues: Record<string, string[]> = {
    [TRACKING_QUEUE_KEYS.client]: [
      JSON.stringify({ ...buffered, source: "client" }),
      JSON.stringify({ ...buffered, timestamp: "invalid" }),
      "null",
    ],
    [TRACKING_QUEUE_KEYS["server-redirect"]]: [
      JSON.stringify({
        ...buffered,
        eventType: "click",
        targetType: "banner",
        source: "server-redirect",
      }),
    ],
    "tracking-events-buffer": [JSON.stringify(buffered)],
  };
  const documents: Record<string, unknown>[] = [];
  t.mock.method(
    TrackingEventModel,
    "insertMany",
    async (docs: Record<string, unknown>[]) => {
      documents.push(...docs);
      return docs;
    }
  );
  const redis = {
    lRange: async (key: string, start: number, end: number) =>
      queues[key].slice(start, end + 1),
    lTrim: async (key: string, start: number) => {
      queues[key] = queues[key].slice(start);
    },
    lLen: async (key: string) => queues[key].length,
  } as unknown as RedisClientType;
  assert.deepEqual(await flushTrackingEvents(redis), { flushed: 3, errors: 2 });
  assert.deepEqual(
    documents.map((d) => d.source),
    ["client", "server-redirect", undefined]
  );
  assert.ok(
    documents.every(
      (d) => (d.timestamp as Date).toISOString() === "2000-01-01T00:00:00.000Z"
    )
  );
  assert.ok(Object.values(queues).every((q) => q.length === 0));
});

test("outreach filtering is enforced even without a target or event filter", async (t) => {
  const matches: Record<string, unknown>[] = [];
  t.mock.method(
    TrackingEventModel,
    "aggregate",
    async (pipeline: { $match: Record<string, unknown> }[]) => {
      matches.push(pipeline[0].$match);
      return [{ _id: "2026-10-13", count: 1 }];
    }
  );
  for (const args of [
    [],
    ["click"],
    ["click", "banner", "banner-id"],
    ["search", "course"],
  ] as string[][]) {
    assert.deepEqual(await getTrackingEventsTimeSeries(...args), [
      { date: "2026-10-13", count: 1 },
    ]);
  }
  assert.ok(
    matches.every(
      (m) =>
        JSON.stringify(m.$nor) ===
        JSON.stringify([
          {
            eventType: "click",
            targetType: {
              $in: ["banner", "redirect", "targeted-message", "nav-item"],
            },
            source: { $ne: "server-redirect" },
          },
        ])
    )
  );
});
