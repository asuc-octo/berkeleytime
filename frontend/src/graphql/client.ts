import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";

const httpLink = createHttpLink({
    uri: 'api/graphql'
})

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
});

export default client;