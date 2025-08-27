import { Button } from '../../bt/custom';

import close from '../../assets/svg/common/close.svg';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Banner() {
	const [open, setOpen] = useState(() => localStorage.getItem('fa25recruitment') !== '1');

	const closeBanner = () => {
		setOpen(false);
		localStorage.setItem('fa25recruitment', '1');
	};

	return open ? (
		<div className="banner">
			<div className="content">
				<p>
				Love using Berkeleytime? Join the team! No experience required. Developers, designers, researchers, marketers and more welcome.
				</p>
				<Link to="https://berkeleytime.com/apply">
					<Button size="sm">Apply</Button>
				</Link>
			</div>
			<img src={close} alt="close" onClick={() => closeBanner()} />
		</div>
	) : null;
}
