import { ApolloClient, createHttpLink } from "@apollo/client";
import { cache } from "./cache";

const httpLink = createHttpLink({
    uri: '/api/graphql'
})

const client = new ApolloClient({
    link: httpLink,
    cache: cache
});

export default client;