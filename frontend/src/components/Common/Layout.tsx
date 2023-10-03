import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga';
import Navigation from './Navigation';
import BTLoader from './BTLoader';
import Footer from './Footer';

ReactGA.initialize('UA-35316609-1');

interface LayoutProps {
	footer?: boolean;
}

export default function RootLayout({ footer }: LayoutProps) {
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
			<Navigation />
			<Outlet />
			{footer && <Footer />}
		</>
	);
}

RootLayout.defaultProps = {
	footer: true
};
