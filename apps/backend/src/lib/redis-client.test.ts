import assert from "node:assert/strict";
import net from "node:net";
import { test } from "node:test";
import { setTimeout as sleep } from "node:timers/promises";

import { createRedisClient } from "./redis-client";

// A stand-in for Redis that answers +OK to every command, so the client can
// connect, and that can be stopped and started on the same port.
const fakeRedis = () => {
  const sockets = new Set<net.Socket>();
  let server: net.Server | undefined;

  const start = (port = 0) =>
    new Promise<number>((resolve) => {
      server = net.createServer((socket) => {
        sockets.add(socket);
        socket.on("close", () => sockets.delete(socket));
        socket.on("data", (chunk) => {
          const commands = chunk
            .toString()
            .split("\r\n")
            .filter((line) => line.startsWith("*")).length;
          socket.write("+OK\r\n".repeat(commands));
        });
      });
      // Never keep the test process alive on its own
      server.unref();
      server.listen(port, "127.0.0.1", () => {
        resolve((server!.address() as net.AddressInfo).port);
      });
    });

  // Like Redis being OOM-killed: open connections drop and the port refuses.
  const stop = () =>
    new Promise<void>((resolve) => {
      for (const socket of sockets) socket.destroy();
      if (!server?.listening) return resolve();
      server.close(() => resolve());
    });

  return { start, stop };
};

const waitFor = async (condition: () => boolean, timeoutMs: number) => {
  const deadline = Date.now() + timeoutMs;
  while (!condition()) {
    if (Date.now() > deadline) return false;
    await sleep(25);
  }
  return true;
};

test("the process survives Redis going away and the client reconnects", async (t) => {
  const redis = fakeRedis();
  const port = await redis.start();
  const client = createRedisClient(`redis://127.0.0.1:${port}`);
  // Clean up even when an assertion fails, so a reconnecting client cannot
  // keep the test process running
  t.after(async () => {
    client.destroy();
    await redis.stop();
  });
  await client.connect();
  assert.equal(client.isReady, true);

  // Without an "error" listener this throws an unhandled 'error' event and
  // ends the process, failing the test run.
  await redis.stop();
  assert.equal(await waitFor(() => !client.isReady, 2_000), true);
  await sleep(300); // several failed reconnect attempts
  if (t.signal.aborted) return; // already failed, e.g. on an unhandled error

  await redis.start(port);
  assert.equal(await waitFor(() => client.isReady, 5_000), true);
});
