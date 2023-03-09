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
			<div className="landing-jumbo">
				<Suspense fallback={null}>
					<Jumbotron />
				</Suspense>
			</div>
			<Explore />
			<Mission />
			<Blurbs />
		</>
	);
};

export default Landing;
