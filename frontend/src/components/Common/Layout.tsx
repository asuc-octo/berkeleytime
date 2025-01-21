import { useEffect } from 'react';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';
import ReactGA from 'react-ga';
import Navigation from './Navigation';
import BTLoader from './BTLoader';
import Footer from './Footer';
import Meta from './Meta';
import Banner from './Banner';

ReactGA.initialize('UA-35316609-1');

interface LayoutProps {
	footer?: boolean;
}

export default function RootLayout({ footer }: LayoutProps) {
	const navigate = useNavigation();
	const location = useLocation();

	useEffect(() => {
		// Scroll to top
		window.scrollTo({ top: 0 });

		// Log page view
		ReactGA.set({ page: window.location.pathname });
		ReactGA.pageview(window.location.pathname);
	}, [location.pathname]);

	return (
		<>
			<Banner />
			<Navigation />
			<Meta title="Berkeleytime" />
			{navigate.state == 'loading' ? (
				<div className="viewport-app">
					<BTLoader />
				</div>
			) : (
				<Outlet />
			)}
			{footer && <Footer />}
		</>
	);
}

RootLayout.defaultProps = {
	footer: true
};
