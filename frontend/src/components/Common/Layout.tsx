import Navigation from 'components/Common/Navigation';
import Footer from 'components/Common/Footer';
import { ReactNode } from 'react';
import Meta from './Meta';

interface LayoutProps {
	noFooter?: boolean;
	children: ReactNode;
}

const Layout = ({ children, noFooter }: LayoutProps) => {
	return (
		<>
			<Meta title="Berkeleytime" />
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
