import { InMemoryCache, makeVar } from "@apollo/client";

const isLoggedIn = makeVar<boolean>(false);

export const cache = new InMemoryCache({
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