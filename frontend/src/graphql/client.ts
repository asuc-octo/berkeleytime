import { ApolloClient, HttpLink } from '@apollo/client';
import { cache } from './cache';

const httpLink = new HttpLink({
	uri: '/api/graphql'
});

// Explore ways to transform API responses before reaching the components
// to minimize the amount of edge -> node drilling.

// const transformRepsonseLink = new ApolloLink((operation, forward) => {
// 	return forward(operation).map((response) => {
// 		if (response.data) {
// 			const { data } = response;
// 			const keys = Object.keys(data);

// 			keys.map((key) => {
// 				if (data[key]['edges']) {
// 					if (Array.isArray(data[key]['edges'])) {
// 						data[key] = data[key]['edges'].map((edge) => edge.node);
// 					}
// 				}
// 			});
// 		}
// 		return response;
// 	});
// });

const client = new ApolloClient({
	link: httpLink,
	cache: cache
});

export default client;
