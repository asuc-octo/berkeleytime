import { InMemoryCache } from '@apollo/client';

const cache = new InMemoryCache({
	typePolicies: {
		BerkeleytimeUserType: {
			fields: {
				schedules: {
					merge(_existing = [], incoming: any[]) {
						return incoming;
					}
				}
			}
		}
	}
});

export { cache };
