import Footer from 'components/Common/Footer';
import { Outlet } from 'react-router-dom';

export default function FooterLayout() {
	return (
		<>
			<Outlet />
			<Footer />
		</>
	);
}
