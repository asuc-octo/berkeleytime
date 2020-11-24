import { InMemoryCache, makeVar } from "@apollo/client";
import { persistCacheSync } from 'apollo3-cache-persist';

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

persistCacheSync({
  cache,
  storage: window.localStorage,
});

export { cache };