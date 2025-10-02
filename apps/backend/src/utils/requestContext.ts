import { AsyncLocalStorage } from "node:async_hooks";

interface RequestStore {
  responseCacheHit: boolean;
}

const asyncLocalStore = new AsyncLocalStorage<RequestStore>();

export const withRequestStore = (_req: any, _res: any, next: () => void) => {
  asyncLocalStore.run({ responseCacheHit: false }, () => next());
};

export const markResponseCacheHit = () => {
  const store = asyncLocalStore.getStore();
  if (store) store.responseCacheHit = true;
};

export const isResponseCacheHit = () => {
  return !!asyncLocalStore.getStore()?.responseCacheHit;
};
