import { FC, Suspense, lazy } from 'react';

import Explore from 'components/Landing/Explore';
import Mission from 'components/Landing/Mission';
import Blurbs from 'components/Landing/Blurbs';
import LandingModal from 'components/Landing/LandingModal';

const Jumbotron = lazy(() => import('components/Landing/Jumbotron'));

const Landing: FC = () => {
	return (
		<>
			<LandingModal />
			<Suspense fallback={<div style={{ display: 'flex', flex: '1' }} />}>
				<Jumbotron />
			</Suspense>
			<Explore />
			<Mission />
			<Blurbs />
		</>
	);
};

export default Landing;
