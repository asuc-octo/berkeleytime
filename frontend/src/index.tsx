;
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/client';

import ScrollToTop from './components/Common/ScrollToTop';
import LogPageView from './components/Common/LogPageView';
import Berkeleytime from './Berkeleytime';
import store from './redux/store';
import client from './graphql/client';

import 'assets/scss/berkeleytime.scss';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
	<ApolloProvider client={client}>
		<Provider store={store}>
			<BrowserRouter>
				<ScrollToTop />
				<LogPageView />
				<Berkeleytime />
			</BrowserRouter>
		</Provider>
	</ApolloProvider>
);
