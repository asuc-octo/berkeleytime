import Navigation from 'components/Common/Navigation';
import Footer from 'components/Common/Footer/Footer';
import { ReactNode } from 'react';

interface LayoutProps {
	noFooter?: boolean;
  noNavigation?: boolean;
	children: ReactNode;
}

const Layout = ({ children, noFooter, noNavigation }: LayoutProps) => {
	return (
		<>
			{!noNavigation && <Navigation />}
			{children}
			{!noFooter && <Footer />}
		</>
	);
};

export default Layout;
