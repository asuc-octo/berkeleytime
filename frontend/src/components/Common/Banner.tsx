import { Button } from '../../bt/custom';

import close from '../../assets/svg/common/close.svg';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Banner() {
	const [open, setOpen] = useState(() => localStorage.getItem('enrollment-survey') !== '1');

	const closeBanner = () => {
		setOpen(false);
		localStorage.setItem('enrollment-survey', '1');
	};

	return open ? (
		<div className="banner">
			<div className="content">
				<p>
				We are looking to improve our features to redesign the enrollment experience!
				</p>
				<Link to="https://bit.ly/berkeleytime-enrollment">
					<Button size="sm">Fill out our Survey</Button>
				</Link>
			</div>
			<img src={close} alt="close" onClick={() => closeBanner()} />
		</div>
	) : null;
}
