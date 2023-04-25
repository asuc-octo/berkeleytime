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
import 'react-loading-skeleton/dist/skeleton.css';
import Banner from 'components/Common/Banner';

import "@fontsource/inter";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/900.css";

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
	<ApolloProvider client={client}>
		<Provider store={store}>
			<BrowserRouter>
				<ScrollToTop />
				<LogPageView />
				<Banner />
				<Berkeleytime />
			</BrowserRouter>
		</Provider>
	</ApolloProvider>
);
