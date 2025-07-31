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
				Check out the beta version of the new Berkeleytime!
				</p>
				<Link to="https://beta.berkeleytime.com">
					<Button size="sm">Open Beta</Button>
				</Link>
			</div>
			<img src={close} alt="close" onClick={() => closeBanner()} />
		</div>
	) : null;
}
