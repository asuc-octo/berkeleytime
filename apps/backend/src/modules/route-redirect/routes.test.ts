import express from "express";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import type { RedisClientType } from "redis";

import {
  BannerModel,
  NavItemModel,
  RouteRedirectModel,
  TargetedMessageModel,
} from "@repo/common/models";

import bannerRoutes from "../banner/routes";
import navItemRoutes from "../nav-item/routes";
import messageRoutes from "../targeted-message/routes";
import routeRedirectRoutes from "./routes";

test("every redirect reaches its destination during Redis failure and uses server provenance", async (t) => {
  const observed: string[] = [];
  const paths: string[] = [];
  t.mock.method(BannerModel, "findByIdAndUpdate", async () => ({
    link: "https://example.com/banner",
    currentVersion: 1,
  }));
  t.mock.method(NavItemModel, "findByIdAndUpdate", async () => ({
    url: "https://example.com/nav",
    label: "Nav",
  }));
  t.mock.method(TargetedMessageModel, "findByIdAndUpdate", async () => ({
    link: "https://example.com/message",
  }));
  t.mock.method(
    RouteRedirectModel,
    "findOneAndUpdate",
    async (query: { fromPath: string }) => {
      paths.push(query.fromPath);
      return { _id: "redirect-id", toPath: "https://example.com/redirect" };
    }
  );
  const redis = {
    eval: async (_: string, options: { arguments: string[] }) => {
      const event = JSON.parse(options.arguments[5]);
      observed.push(event.source);
      assert.equal(event.eventType, "click");
      assert.ok(event.targetId);
      throw new Error("offline");
    },
  } as unknown as RedisClientType;
  const app = express();
  bannerRoutes(app, redis);
  navItemRoutes(app, redis);
  messageRoutes(app, redis);
  routeRedirectRoutes(app, redis);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  t.after(
    () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
      )
  );
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  for (const [path, destination] of [
    ["/banner/click/banner-id", "banner"],
    ["/nav-item/click/nav-id", "nav"],
    ["/message/click/message-id", "message"],
    ["/go/donate/campaign", "redirect"],
    ["/go/a%20b/%2526", "redirect"],
    ["/go/", "redirect"],
  ]) {
    const response = await fetch(`${base}${path}`, { redirect: "manual" });
    assert.equal(response.status, 302);
    assert.equal(
      response.headers.get("location"),
      `https://example.com/${destination}`
    );
  }
  assert.deepEqual(paths, ["/donate/campaign", "/a b/%26", "/"]);
  assert.deepEqual(observed, Array(6).fill("server-redirect"));
});

test("internal destinations work while self and multi-hop loops stop before tracking", async (t) => {
  let destination = "/schedule";
  let queued = 0;
  t.mock.method(RouteRedirectModel, "findOneAndUpdate", async () => ({
    _id: "redirect-id",
    toPath: destination,
  }));
  t.mock.method(RouteRedirectModel, "findOne", () => ({
    lean: async () => (destination === "/other" ? { toPath: "/start" } : null),
  }));
  const app = express();
  routeRedirectRoutes(app, {
    eval: async () => {
      queued++;
      return [1, "accepted", 1, 0];
    },
  } as unknown as RedisClientType);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  t.after(
    () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
      )
  );
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/go/start`;
  assert.equal(
    (await fetch(url, { redirect: "manual" })).headers.get("location"),
    "/schedule"
  );
  for (const path of ["/start", "/go/start", "/other"]) {
    destination = path;
    assert.equal((await fetch(url, { redirect: "manual" })).status, 508);
  }
  assert.equal(queued, 1);
});
