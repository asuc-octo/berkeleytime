import Explore from 'components/Landing/Explore';
import Mission from 'components/Landing/Mission';
import Blurbs from 'components/Landing/Blurbs';
import Jumbotron from 'components/Landing/Jumbotron';

export default function Landing() {
	return (
		<>
			<div className="landing-jumbo">
				<Jumbotron />
			</div>
			<Explore />
			<Mission />
			<Blurbs />
		</>
	);
}
