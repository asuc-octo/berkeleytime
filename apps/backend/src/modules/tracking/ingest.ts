import { createHash } from "crypto";
import type { Request } from "express";
import type { RedisClientType } from "redis";

import {
  trackingClockSkewCount,
  trackingEventCount,
  trackingQueueDepth,
  trackingQuotaResetCount,
} from "../../lib/metrics";
import { getClientIP } from "../../utils/ip";
import {
  MAX_EVENT_BYTES,
  OUTREACH_TARGETS,
  parseClientTimestamp,
  validateTrackingBatch,
} from "./validation";

export type TrackingSource = "client" | "server-redirect";
export const TRACKING_QUEUE_KEYS = {
  client: "tracking:buffer:client",
  "server-redirect": "tracking:buffer:server-redirect",
};
export const QUOTA_KEY = "tracking:ingest-quota:v1";

export const readTrackingLimits = (env: Record<string, string | undefined>) => {
  const read = (key: string, fallback: number) => {
    const value = env[key] === undefined ? fallback : Number(env[key]);
    if (!Number.isSafeInteger(value) || value < 1 || value > 1_000_000_000) {
      throw new Error(`${key} must be a positive integer at most 1000000000`);
    }
    return value;
  };
  const global = read("TRACKING_GLOBAL_DAILY_EVENT_LIMIT", 100_000);
  const ip = read("TRACKING_IP_DAILY_EVENT_LIMIT", 10_000);
  return {
    client: {
      daily: global - Math.floor(global / 5),
      ipDaily: ip - Math.floor(ip / 5),
      queue: 8_000,
    },
    "server-redirect": {
      daily: Math.floor(global / 5),
      ipDaily: Math.floor(ip / 5),
      queue: 2_000,
    },
  };
};
// Imported during backend startup, after dotenv configuration has loaded.
const limits = readTrackingLimits(process.env);

// TIME and all admission checks run atomically on the shared standalone Redis.
// The fixed-size quota hash has no TTL, so volatile-lru cannot evict it. New
// windows replace old fields; draining a queue never replenishes an allowance.
export const ADMIT_TRACKING_SCRIPT = `
local now = tonumber(redis.call('TIME')[1])
local day = math.floor(now / 86400)
local slot = math.floor(now / 300)
local withinDay = slot % 288
local source = ARGV[1]
local daily = tonumber(ARGV[3])
local allowance = math.floor(daily * (withinDay + 1) / 288) - math.floor(daily * withinDay / 288)
local initialized = redis.call('EXISTS', KEYS[1]) == 0 and 1 or 0
local storedSlot = tonumber(redis.call('HGET', KEYS[1], source .. ':slot') or '-1')
local used = tonumber(redis.call('HGET', KEYS[1], source .. ':used') or '0')
local queued = redis.call('LLEN', KEYS[2])
if slot < storedSlot then return {0, 'clock', queued, 0} end
if slot ~= storedSlot then used = 0 end
local room = math.min(allowance - used, tonumber(ARGV[5]) - queued)
local reason = allowance - used <= tonumber(ARGV[5]) - queued and 'global' or 'queue'
if room <= 0 then return {0, reason, queued, 0} end
local ipKey = 'tracking:ip:' .. source .. ':' .. day .. ':' .. ARGV[2]
local requestKey = 'tracking:requests:' .. source .. ':' .. math.floor(now / 60) .. ':' .. ARGV[2]
local ipUsed = tonumber(redis.call('GET', ipKey) or '0')
if tonumber(redis.call('GET', requestKey) or '0') >= 30 then return {0, 'requests', queued, 0} end
if tonumber(ARGV[4]) - ipUsed < room then room = tonumber(ARGV[4]) - ipUsed; reason = 'ip' end
local accepted = math.min(#ARGV - 5, room)
if accepted <= 0 then return {0, reason, queued, 0} end
-- Charge quotas before append: an OOM failure may consume allowance but cannot
-- enqueue events without accounting. Redis script errors do not roll back writes.
redis.call('HSET', KEYS[1], source .. ':slot', slot, source .. ':used', used + accepted)
redis.call('INCRBY', ipKey, accepted)
redis.call('EXPIREAT', ipKey, (day + 1) * 86400)
redis.call('INCR', requestKey)
redis.call('EXPIREAT', requestKey, (math.floor(now / 60) + 1) * 60)
for i = 1, accepted do redis.call('RPUSH', KEYS[2], ARGV[i + 5]) end
return {accepted, accepted == #ARGV - 5 and 'accepted' or reason, queued + accepted, initialized}
`;

const lastWarning = new Map<string, number>();
export const warnTrackingFailure = (reason: string) => {
  const now = Date.now();
  if (now - (lastWarning.get(reason) ?? 0) < 60_000) return;
  lastWarning.set(reason, now);
  console.warn(`[Tracking] ${reason}; collection may be incomplete`);
};

export const bufferTrackingEvents = async (
  redis: RedisClientType,
  req: Request,
  input: unknown,
  source: TrackingSource = "client"
): Promise<void> => {
  const events = validateTrackingBatch(input);
  // A server-only call site selects source. Nothing from the public JSON body
  // is spread onto buffered records, including provenance and identity fields.
  if (
    source === "server-redirect" &&
    events.some(
      (e) =>
        e.eventType !== "click" ||
        !(OUTREACH_TARGETS as readonly string[]).includes(e.targetType) ||
        !e.targetId
    )
  ) {
    throw new Error(
      "Server redirect events require a resolved outreach target"
    );
  }
  const timestamp = new Date().toISOString();
  const ipHash = createHash("sha256").update(getClientIP(req)).digest("hex");
  const payloads = events.map((event) => {
    const clientTimestamp =
      source === "client" ? parseClientTimestamp(event.timestamp) : undefined;
    if (
      source === "client" &&
      (!clientTimestamp ||
        Math.abs(Date.parse(clientTimestamp) - Date.parse(timestamp)) > 300_000)
    ) {
      trackingClockSkewCount.add(1, {
        kind: clientTimestamp ? "skew" : "invalid",
      });
    }
    return JSON.stringify({
      ...event,
      timestamp,
      clientTimestamp,
      source,
      sessionId: (req.sessionID || "anonymous").slice(0, 128),
      userId: (req.user as { _id?: { toString(): string } } | undefined)?._id
        ?.toString()
        .slice(0, 128),
      ipHash,
      userAgent: req.get("user-agent")?.slice(0, 500),
      referrer: (req.get("referer") || req.get("referrer"))?.slice(0, 512),
    });
  });
  if (payloads.some((p) => Buffer.byteLength(p) > MAX_EVENT_BYTES)) {
    trackingEventCount.add(events.length, {
      source,
      outcome: "dropped",
      reason: "size",
    });
    return;
  }
  const budget = limits[source];
  try {
    const [accepted, reason, depth, initialized] = (await redis.eval(
      ADMIT_TRACKING_SCRIPT,
      {
        keys: [QUOTA_KEY, TRACKING_QUEUE_KEYS[source]],
        arguments: [
          source,
          ipHash,
          String(budget.daily),
          String(budget.ipDaily),
          String(budget.queue),
          ...payloads,
        ],
      }
    )) as [number, string, number, number];
    if (initialized) {
      trackingQuotaResetCount.add(1);
      warnTrackingFailure("quota state initialized or reset");
    }
    trackingQueueDepth.record(depth, { source });
    if (accepted)
      trackingEventCount.add(accepted, {
        source,
        outcome: "accepted",
        reason: "accepted",
      });
    if (accepted < events.length)
      trackingEventCount.add(events.length - accepted, {
        source,
        outcome: "dropped",
        reason,
      });
  } catch {
    trackingEventCount.add(events.length, {
      source,
      outcome: "dropped",
      reason: "redis",
    });
    warnTrackingFailure("Redis admission failed");
  }
};
