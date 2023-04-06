import Navigation from 'components/Common/NavigationBar';
import Footer from 'components/Common/Footer';
import { ReactNode } from 'react';

interface LayoutProps {
	noFooter?: boolean;
  standalone?: boolean;
	children: ReactNode;
}

const Layout = ({ children, noFooter, standalone }: LayoutProps) => {
	return (
		<>
			<Navigation standalone={standalone} />
			{children}
			{!noFooter && <Footer standalone={standalone} />}
		</>
	);
};

Layout.defaultProps = {
	noFooter: false
};

export default Layout;
