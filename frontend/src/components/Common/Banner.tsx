import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'bt/custom';
import { closeBanner } from '../../redux/common/actions';

import close from '../../assets/svg/common/close.svg';
import { ReduxState } from 'redux/store';

export default function Banner() {
	const { banner } = useSelector((state: ReduxState) => state.common);
	const dispatch = useDispatch();

	return banner ? (
		<div className="banner">
			<div className="content">
				<p>Berkeleytime is looking for student designers and developers to join our team!</p>
				<Button size="sm" href="https://berkeleytime.com/apply">
					Apply Now
				</Button>
			</div>
			<img src={close} alt="close" onClick={() => dispatch(closeBanner())} />
		</div>
	) : null;
}
