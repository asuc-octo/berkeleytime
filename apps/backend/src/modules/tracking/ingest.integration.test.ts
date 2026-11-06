import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { createClient } from "redis";

import { ADMIT_TRACKING_SCRIPT } from "./ingest";

// Opt in with a disposable standalone Redis. All test-owned keys are uniquely
// namespaced; no FLUSHDB or global configuration changes are performed.
const redisUrl = process.env.TRACKING_TEST_REDIS_URL;

test("atomic admission on real Redis", { skip: !redisUrl }, async (t) => {
  const redis = createClient({ url: redisUrl });
  redis.on("error", () => {});
  await redis.connect();
  const prefix = `tracking-test:${randomUUID()}:`;
  // Keep simulated expirations in the future relative to the actual Redis
  // clock; EXPIREAT must not immediately delete counters during time travel.
  const epochBase = (Math.ceil(Date.now() / 86_400_000) + 1) * 86_400;
  t.after(async () => {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length) await redis.del(keys);
    await redis.close();
  });
  // Replace only TIME so rollover tests exercise the production Lua admission
  // logic without waiting for the clock. Never expose time overrides publicly.
  const admit = async ({
    time = 86400,
    source = "client",
    ip = "ip",
    count = 50,
    daily = 80000,
    ipDaily = 8000,
    capacity = 8000,
  } = {}) => {
    const script = ADMIT_TRACKING_SCRIPT.replace(
      "tonumber(redis.call('TIME')[1])",
      String(epochBase + time - 86400)
    ).replaceAll("tracking:", prefix);
    return (await redis.eval(script, {
      keys: [`${prefix}quota`, `${prefix}queue:${source}`],
      arguments: [
        source,
        ip,
        String(daily),
        String(ipDaily),
        String(capacity),
        ...Array(count).fill("{}"),
      ],
    })) as [number, string, number, number];
  };
  const reset = async () => {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length) await redis.del(keys);
  };

  await t.test(
    "concurrent batches admit exactly the window allowance, including a partial prefix",
    async () => {
      const results = await Promise.all(
        Array.from({ length: 30 }, (_, i) => admit({ ip: `ip-${i}` }))
      );
      assert.equal(
        results.reduce((sum, r) => sum + r[0], 0),
        277
      );
      assert.equal(await redis.lLen(`${prefix}queue:client`), 277);
      assert.ok(results.some((r) => r[0] === 27));
      assert.equal(await redis.ttl(`${prefix}quota`), -1); // protected from volatile-lru
      await redis.del(`${prefix}queue:client`); // flush cannot replenish allowance
      assert.equal((await admit())[0], 0);
      assert.equal((await admit({ time: 86700 }))[0], 50);
    }
  );

  await t.test(
    "five-minute allocations sum to the exact daily ceiling",
    async () => {
      await reset();
      let accepted = 0;
      for (let slot = 0; slot < 288; slot++) {
        for (let batch = 0; batch < 7; batch++) {
          accepted += (
            await admit({ time: 86400 + slot * 300, ip: `${slot}-${batch}` })
          )[0];
        }
        await redis.del(`${prefix}queue:client`);
      }
      assert.equal(accepted, 80000);
    }
  );

  await t.test(
    "client exhaustion cannot consume redirect quotas or queue room",
    async () => {
      await reset();
      for (let i = 0; i < 6; i++) await admit();
      assert.equal((await admit())[0], 0);
      assert.equal(
        (
          await admit({
            source: "server-redirect",
            daily: 20000,
            ipDaily: 2000,
            capacity: 2000,
          })
        )[0],
        50
      );
      assert.equal(
        (
          await admit({
            source: "server-redirect",
            daily: 20000,
            ipDaily: 2000,
            capacity: 2000,
          })
        )[0],
        19
      );
    }
  );

  await t.test(
    "queue capacity is atomic and independently reserved",
    async () => {
      await reset();
      const results = await Promise.all(
        Array.from({ length: 10 }, () => admit({ capacity: 17 }))
      );
      assert.equal(
        results.reduce((sum, r) => sum + r[0], 0),
        17
      );
      assert.equal(await redis.lLen(`${prefix}queue:client`), 17);
      assert.equal(
        (await admit({ source: "server-redirect", capacity: 17 }))[0],
        17
      );
    }
  );

  await t.test(
    "per-IP daily limits survive windows and reset at UTC rollover",
    async () => {
      await reset();
      assert.equal((await admit({ ipDaily: 20 }))[0], 20);
      assert.equal((await admit({ ipDaily: 20, time: 86700 }))[0], 0);
      assert.equal(
        (await admit({ ipDaily: 20, ip: "other", time: 86700 }))[0],
        20
      );
      assert.equal((await admit({ ipDaily: 20, time: 172800 }))[0], 20);
    }
  );

  await t.test(
    "request throttle, bounded key creation, boundary bursts, and state resets",
    async () => {
      await reset();
      for (let i = 0; i < 30; i++)
        assert.equal((await admit({ count: 1 }))[0], 1);
      assert.equal((await admit({ count: 1 }))[1], "requests");
      assert.equal((await admit({ time: 86460, count: 1 }))[0], 1);
      assert.equal((await admit({ ip: "denied", capacity: 0 }))[0], 0);
      assert.equal(
        await redis.exists(`${prefix}ip:client:${epochBase / 86400}:denied`),
        0
      );
      await reset();
      assert.equal((await admit({ time: 86699 }))[3], 1);
      assert.equal((await admit({ time: 86700 }))[0], 50);
      await redis.del(`${prefix}quota`);
      assert.equal((await admit({ time: 86700 }))[3], 1); // documented data-loss reset
    }
  );
});
