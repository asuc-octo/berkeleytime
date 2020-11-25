import { InMemoryCache, makeVar } from "@apollo/client";
import { LocalStorageWrapper, persistCacheSync } from 'apollo3-cache-persist';

const isLoggedIn = makeVar<boolean>(false);

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        isLoggedIn: {
          read() {
            return isLoggedIn();
          }
        }
      }
    }
  }
});

if (process.env.NODE_ENV === 'development') {
  const MB = 1 << 20;
  persistCacheSync({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
    debug: true,
    maxSize: 2 * MB
  });
}

export { cache };
