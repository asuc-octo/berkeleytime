import { FC, Suspense, lazy } from 'react';

import Explore from 'components/Landing/Explore';
import Mission from 'components/Landing/Mission';
import Blurbs from 'components/Landing/Blurbs';
import LandingModal from 'components/Landing/LandingModal';

const Jumbotron = lazy(() => import('components/Landing/Jumbotron'));

const Landing: FC = () => {
	return (
		<div>
			<LandingModal />
			<Suspense fallback={<div style={{width: 500, height: 500}} />}>
				<Jumbotron />
			</Suspense>
			<Explore />
			<Mission />
			<Blurbs />
		</div>
	);
};

export default Landing;
