import Navigation from 'components/Common/Navigation';
import Footer from 'components/Common/Footer';
import { ReactNode } from 'react';

interface LayoutProps {
	noFooter?: boolean;
  standalone?: boolean;
	children: ReactNode;
}

const Layout = ({ children, noFooter }: LayoutProps) => {
	return (
		<>
			<Navigation />
			{children}
			{!noFooter && <Footer />}
		</>
	);
};

Layout.defaultProps = {
	noFooter: false
};

export default Layout;
