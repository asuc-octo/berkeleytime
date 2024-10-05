import { Button } from '../../bt/custom';

import close from '../../assets/svg/common/close.svg';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Banner() {
	const [open, setOpen] = useState(() => localStorage.getItem('csd-survey-fa-24') !== '1');

	const closeBanner = () => {
		setOpen(false);
		localStorage.setItem('csd-survey-fa-24', '1');
	};

	return open ? (
		<div className="banner">
			<div className="content">
				<p>
					Help shape the future of Berkeleytime and tell us about your experience with course
					enrollment at UC Berkeley!
				</p>
				<Link to="/survey">
					<Button size="sm">Take the Survey</Button>
				</Link>
			</div>
			<img src={close} alt="close" onClick={() => closeBanner()} />
		</div>
	) : null;
}
