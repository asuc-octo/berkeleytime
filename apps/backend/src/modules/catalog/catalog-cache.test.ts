import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";

import {
  CatalogClassModel,
  ClassModel,
  CourseModel,
  type ICatalogClassItem,
} from "@repo/common/models";

import { getCachedCatalog, getSearchIndex } from "./catalog-cache";

const CACHE_TTL = 5 * 60 * 1000;

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const makeCatalog = (titles: string[]) =>
  titles.map((courseTitle, i) => ({
    courseId: `course-${i}`,
    subject: "COMPSCI",
    courseNumber: `${i}`,
    number: "001",
    courseTitle,
    searchableNames: [`COMPSCI ${i}`],
  })) as unknown as ICatalogClassItem[];

// Each test queues the results its catalog loads should return, in order
let pendingFinds: ReturnType<typeof deferred<ICatalogClassItem[]>>[];
let findCalls: number;

beforeEach(() => {
  pendingFinds = [];
  findCalls = 0;

  mock.timers.enable({ apis: ["Date"], now: 0 });
  mock.method(CatalogClassModel, "find", () => {
    const next = pendingFinds[findCalls++];
    assert.ok(next, "unexpected catalog load");
    return { lean: () => next.promise };
  });
  // Former course names lookup used by the search index
  mock.method(ClassModel, "aggregate", async () => []);
  mock.method(CourseModel, "find", () => ({ lean: async () => [] }));
  mock.method(console, "log", () => {});
  mock.method(console, "error", () => {});
});

afterEach(() => {
  mock.timers.reset();
  mock.restoreAll();
});

test("concurrent requests for an uncached term share one load", async () => {
  const load = deferred<ICatalogClassItem[]>();
  pendingFinds.push(load);

  const requests = Array.from({ length: 20 }, () =>
    getCachedCatalog(2001, "Spring")
  );
  const catalog = makeCatalog(["Data Structures"]);
  load.resolve(catalog);

  const results = await Promise.all(requests);
  assert.equal(findCalls, 1);
  for (const result of results) assert.equal(result, catalog);
});

test("a stale term is served immediately while one background refresh runs", async () => {
  const first = deferred<ICatalogClassItem[]>();
  const refresh = deferred<ICatalogClassItem[]>();
  pendingFinds.push(first, refresh);

  const oldCatalog = makeCatalog(["Old Title"]);
  first.resolve(oldCatalog);
  assert.equal(await getCachedCatalog(2002, "Spring"), oldCatalog);

  mock.timers.tick(CACHE_TTL + 1);

  // Every request gets the stale copy without waiting; only one refresh starts
  const results = await Promise.all(
    Array.from({ length: 20 }, () => getCachedCatalog(2002, "Spring"))
  );
  for (const result of results) assert.equal(result, oldCatalog);
  assert.equal(findCalls, 2);

  const newCatalog = makeCatalog(["New Title"]);
  refresh.resolve(newCatalog);
  await refresh.promise;
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(await getCachedCatalog(2002, "Spring"), newCatalog);
  assert.equal(findCalls, 2);
});

test("a failed refresh keeps serving the stale copy and retries later", async () => {
  const first = deferred<ICatalogClassItem[]>();
  const failed = deferred<ICatalogClassItem[]>();
  const retry = deferred<ICatalogClassItem[]>();
  pendingFinds.push(first, failed, retry);

  const oldCatalog = makeCatalog(["Old Title"]);
  first.resolve(oldCatalog);
  await getCachedCatalog(2003, "Spring");

  mock.timers.tick(CACHE_TTL + 1);
  assert.equal(await getCachedCatalog(2003, "Spring"), oldCatalog);

  failed.reject(new Error("mongo unavailable"));
  await failed.promise.catch(() => {});
  await new Promise((resolve) => setImmediate(resolve));

  // Still stale, so the next request starts a new refresh
  assert.equal(await getCachedCatalog(2003, "Spring"), oldCatalog);
  assert.equal(findCalls, 3);

  const newCatalog = makeCatalog(["New Title"]);
  retry.resolve(newCatalog);
  await retry.promise;
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(await getCachedCatalog(2003, "Spring"), newCatalog);
});

test("the search index is built once per catalog load", async () => {
  const first = deferred<ICatalogClassItem[]>();
  const refresh = deferred<ICatalogClassItem[]>();
  pendingFinds.push(first, refresh);

  first.resolve(makeCatalog(["Data Structures", "Linear Algebra"]));

  const indexes = await Promise.all(
    Array.from({ length: 20 }, () => getSearchIndex(2004, "Spring"))
  );
  for (const index of indexes) assert.equal(index, indexes[0]);
  assert.equal(findCalls, 1);
  assert.equal(
    indexes[0].search("data structures")[0]?.item.courseTitle,
    "Data Structures"
  );

  // After the refresh lands, a new index is built from the new data, once
  mock.timers.tick(CACHE_TTL + 1);
  assert.equal(await getSearchIndex(2004, "Spring"), indexes[0]);

  refresh.resolve(makeCatalog(["Operating Systems"]));
  await refresh.promise;
  await new Promise((resolve) => setImmediate(resolve));

  const [refreshed, again] = await Promise.all([
    getSearchIndex(2004, "Spring"),
    getSearchIndex(2004, "Spring"),
  ]);
  assert.notEqual(refreshed, indexes[0]);
  assert.equal(refreshed, again);
  assert.equal(
    refreshed.search("operating")[0]?.item.courseTitle,
    "Operating Systems"
  );
});
