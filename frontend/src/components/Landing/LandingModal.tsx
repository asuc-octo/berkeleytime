import { useCallback, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { H3, P, Button } from '../../bt/custom';
import closeIcon from '../../assets/svg/common/close.svg';

import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../redux/store';
import { closeLandingModal } from '../../redux/common/actions';

const modal_info = {
	subtitle: '',
	title: 'Join the Berkeleytime Team!',
	message: 'Love using Berkeleytime? Join the team! No experience required. Developers, designers, researchers, marketers and more are all welcome.',
	button: 'Apply',
	link: '/apply',
	img: null
};

export default function LandingModal() {
	const { landingModal } = useSelector((state: ReduxState) => state.common);
	const dispatch = useDispatch();

	const close = useCallback(() => dispatch(closeLandingModal()), [dispatch]);

	useEffect(() => {
		return () => {
			close();
		};
	}, [close]);

	return (
		<Modal
			show={landingModal}
			onHide={close}
			className="landing-modal"
			dialogClassName={'landing-modal-dialog'}
		>
			<button className="landing-close-btn" onClick={close}>
				<img src={closeIcon} alt="close" />
			</button>
			{modal_info['img'] && (
				<img className="landing-modal-img" src={modal_info['img']} alt="" />
			)}
			{modal_info['subtitle'] && (
				<P bold className="mb-2 landing-modal-subtitle">
					{modal_info['subtitle']}
				</P>
			)}
			{modal_info['title'] && (
				<H3 bold className="mb-2">
					{modal_info['title']}
				</H3>
			)}
			{modal_info['message'] && (
				<P className="landing-modal-text">{modal_info['message']}</P>
			)}
			{modal_info['button'] && (
				<Button className="landing-modal-btn" href={{ as_link: modal_info['link'] }}>
					{modal_info['button']}
				</Button>
			)}
		</Modal>
	);
}
