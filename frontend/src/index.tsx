import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/client';
import { IconoirProvider } from 'iconoir-react';

import Berkeleytime from './Berkeleytime';
import store from './redux/store';
import client from './graphql/client';

import 'assets/scss/berkeleytime.scss';
import 'react-loading-skeleton/dist/skeleton.css';

createRoot(document.getElementById('root') as HTMLElement).render(
	<ApolloProvider client={client}>
		<Provider store={store}>
			<Berkeleytime />
		</Provider>
	</ApolloProvider>
);
