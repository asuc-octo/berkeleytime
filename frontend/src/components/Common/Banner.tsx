import { Button } from '../../bt/custom';

import close from '../../assets/svg/common/close.svg';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Banner() {
	const [open, setOpen] = useState(() => localStorage.getItem('sp25recruitment') !== '1');

	const closeBanner = () => {
		setOpen(false);
		localStorage.setItem('sp25recruitment', '1');
	};

	return open ? (
		<div className="banner">
			<div className="content">
				<p>
				Berkeleytime is recruiting passionate developers, designers, researchers and more for Spring
				2025!
				</p>
				<Link to="/apply">
					<Button size="sm">Apply Now</Button>
				</Link>
			</div>
			<img src={close} alt="close" onClick={() => closeBanner()} />
		</div>
	) : null;
}
