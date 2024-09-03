import { useSelector, useDispatch } from 'react-redux';
import { Button } from '../../bt/custom';
import { closeBanner } from '../../redux/common/actions';

import close from '../../assets/svg/common/close.svg';
import { ReduxState } from 'redux/store';

export default function Banner() {
	const { banner } = useSelector((state: ReduxState) => state.common);
	const dispatch = useDispatch();

	return banner ? (
		<div className="banner">
			<div className="content">
				<p>
					Berkeleytime is recruiting passionate developers, designers, researchers and more for Fall
					2024!
				</p>
				<Button
					size="sm"
					target="_blank"
					href="https://airtable.com/appllQy6crmpquCOQ/pag5ngU9hgKJt5eAs/form"
				>
					Apply Now
				</Button>
			</div>
			<img src={close} alt="close" onClick={() => dispatch(closeBanner())} />
		</div>
	) : null;
}
