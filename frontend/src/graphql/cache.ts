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

// Enabled only on development to allow for fast local dev. Not enabled on
// production as we don't want to show out-of-date data.
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
