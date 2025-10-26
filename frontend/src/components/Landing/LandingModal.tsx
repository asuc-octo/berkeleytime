import { useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { H3, P, Button } from '../../bt/custom';
import closeIcon from '../../assets/svg/common/close.svg';

import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../redux/store';
import { closeLandingModal } from '../../redux/common/actions';

// Import images
import gradtrakImg from './betaFiles/gradtrak.png';
import breadthsImg from './betaFiles/breadths.png';

interface PageContent {
	subtitle: string;
	title: string;
	message: string;
	img?: string;
	isLast?: boolean;
}

const pages: PageContent[] = [
	{
		title: 'Introducing the new \nBerkeleytime Beta',
		message: 'With Spring 2026 data, Fall 2025 grades, and new features',
		subtitle: ''
	},
	{
		subtitle: 'New Features',
		title: 'Gradtrak',
		message: 'Try out our new Gradtrak feature to plan out your college career!',
		img: gradtrakImg
	},
	{
		subtitle: 'New Features',
		title: 'L&S Breadths',
		message: 'New filter for L&S breadths.',
		img: breadthsImg
	},
	{
		subtitle: 'New Features',
		title: 'Spring 2026 Classes',
		message: 'Data for Spring 2026 classes are added.',
		isLast: false
	},
	{
		subtitle: 'New Features',
		title: 'Fall 2025 Grades',
		message: 'Data for Fall 2025 grades are added.',
		isLast: true
	}
];

export default function LandingModal() {
	const { landingModal } = useSelector((state: ReduxState) => state.common);
	const dispatch = useDispatch();
	const [currentPage, setCurrentPage] = useState(0);

	const close = useCallback(() => {
		setCurrentPage(0); // Reset to first page when closing
		dispatch(closeLandingModal());
	}, [dispatch]);

	const nextPage = useCallback(() => {
		if (currentPage < pages.length - 1) {
			setCurrentPage(currentPage + 1);
		}
	}, [currentPage]);

	const prevPage = useCallback(() => {
		if (currentPage > 0) {
			setCurrentPage(currentPage - 1);
		}
	}, [currentPage]);

	useEffect(() => {
		return () => {
			close();
		};
	}, [close]);

	const page = pages[currentPage];
	const isFirstPage = currentPage === 0;
	const isLastPage = currentPage === pages.length - 1;

	return (
		<Modal
			show={landingModal}
			onHide={close}
			className="landing-modal"
			dialogClassName={'landing-modal-dialog'}
			backdrop={true}
		>
			<button className="landing-close-btn" onClick={close}>
				<img src={closeIcon} alt="close" />
			</button>
			{page['img'] && (
				<img className="landing-modal-img" src={page['img']} alt="" />
			)}
			{page['subtitle'] && (
				<P bold className="mb-2 landing-modal-subtitle">
					{page['subtitle']}
				</P>
			)}
			{page['title'] && (
				<H3 bold className="mb-2">
					{page['title']}
				</H3>
			)}
			{page['message'] && (
				<P className="landing-modal-text">{page['message']}</P>
			)}
			<div className="landing-modal-buttons">
				{isFirstPage ?
					(
						<Button 
							className="landing-modal-btn-secondary mr-2" 
							onClick={close}
							href={"https://beta.berkeleytime.com"}
							variant="inverted"
						>
							Launch
						</Button>
					)
				 : (
					<Button 
						className="landing-modal-btn-secondary mr-2" 
						onClick={prevPage}
						variant="inverted"
					>
						Previous
					</Button>
				)}
				{isLastPage ? (
					<Button 
						className="landing-modal-btn" 
						onClick={close}
						href={"https://beta.berkeleytime.com"}
					>
						Launch
					</Button>
				) : (
					<Button 
						className="landing-modal-btn" 
						onClick={nextPage}
					>
						{isFirstPage ? 'New Features →' : 'Next'}
					</Button>
				)}
			</div>
		</Modal>
	);
}
