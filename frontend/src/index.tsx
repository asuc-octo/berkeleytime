import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/client';
import { IconoirProvider } from 'iconoir-react';

import ScrollToTop from './components/Common/ScrollToTop';
import LogPageView from './components/Common/LogPageView';
import Berkeleytime from './Berkeleytime';
import store from './redux/store';
import client from './graphql/client';
import Banner from 'components/Common/Banner';

import 'assets/scss/berkeleytime.scss';
import 'react-loading-skeleton/dist/skeleton.css';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
	<ApolloProvider client={client}>
		<IconoirProvider iconProps={{ strokeWidth: 2 }}>
			<Provider store={store}>
				<BrowserRouter>
					<ScrollToTop />
					<LogPageView />
					<Banner />
					<Berkeleytime />
				</BrowserRouter>
			</Provider>
		</IconoirProvider>
	</ApolloProvider>
);
