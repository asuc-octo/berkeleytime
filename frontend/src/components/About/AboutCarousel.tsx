import { useEffect, useRef, useState } from 'react';
import { NavArrowLeft, NavArrowRight } from 'iconoir-react';

import dolores from '../../assets/img/about/group/dolores-social.jpg';
import matt from '../../assets/img/about/group/matt-falling.jpg';
import retreat from '../../assets/img/about/group/retreat.jpg';
import rooftop from '../../assets/img/about/group/rooftop-social.jpg';
import start from '../../assets/img/about/group/start.jpg';

enum Sliding {
	Still = 0,
	Right = 1,
	Left = 2
}

const images = [
	{ img: matt, alt: 'matt falling' },
	{ img: retreat, alt: 'retreat' },
	{ img: start, alt: 'start photo' },
	{ img: dolores, alt: 'dolores park social' },
	{ img: rooftop, alt: 'rooftop social' },
];

const wrap = (val: number) => (val + images.length) % images.length;

const AboutCarousel = () => {
	const [shownImage, setShownImage] = useState<number>(2);
	const [queuedImage, setQueuedImage] = useState<number>(2);
	const [sliding, setSliding] = useState<Sliding>(Sliding.Still);
	const intervalID = useRef<number | undefined>(undefined);

	useEffect(() => {
		const intervalHandler = () => {
			if (sliding === Sliding.Still) {
				setSliding(Sliding.Left);
				setQueuedImage((prev) => wrap(prev + 1));
			}
		};

		intervalID.current = window.setInterval(intervalHandler, 5000);

		return () => {
			clearInterval(intervalID.current);
		};
	}, [sliding]);

	const changeImage = (slide: Sliding) => {
		if (sliding === Sliding.Still) {
			setSliding(slide);
			const direction = slide === Sliding.Left ? 1 : -1;
			setQueuedImage((prev) => wrap(prev + direction));
		}
	};

	const triggerSwap = () => {
		setShownImage(queuedImage);
		setSliding(Sliding.Still);
	};

	const getCarouselItemClass = (idx: number) => {
		let classes = 'about-carousel-item ';
		if (idx === wrap(shownImage - 2)) {
			classes += 'about-carousel-active-prev ';
		} else if (idx === wrap(shownImage - 1)) {
			classes += 'about-carousel-active-first ';
			if (sliding === Sliding.Right) {
				classes += 'focus-in ';
			}
		} else if (idx === shownImage) {
			classes += 'about-carousel-active-second ';
			if (sliding !== Sliding.Still) {
				classes += 'focus-out ';
			}
		} else if (idx === wrap(shownImage + 1)) {
			classes += 'about-carousel-active-third ';
			if (sliding === Sliding.Left) {
				classes += 'focus-in ';
			}
		} else if (idx === wrap(shownImage + 2)) {
			classes += 'about-carousel-active-next ';
		}
		return classes;
	};

	const getCarouselClass = () => {
		let classes = 'about-carousel ';
		if (sliding === Sliding.Left) {
			classes += 'about-carousel-slide-left ';
		} else if (sliding === Sliding.Right) {
			classes += 'about-carousel-slide-right ';
		}
		return classes;
	};

	return (
		<div className="group mb-5">
			<div
				className={getCarouselClass()}
				onTransitionEnd={(e) => {
					if (e.target === e.currentTarget) triggerSwap();
				}}
			>
				{images.map((imgVal, index) => (
					<div key={imgVal.alt} className={getCarouselItemClass(index)}>
						<img src={imgVal.img} alt={imgVal.alt} />
					</div>
				))}
			</div>
			<button
				onClick={() => changeImage(Sliding.Right)}
				className="about-carousel-prev"
				aria-hidden="true"
			>
				<NavArrowLeft />
			</button>
			<button
				onClick={() => changeImage(Sliding.Left)}
				className="about-carousel-next"
				aria-hidden="true"
			>
				<NavArrowRight />
			</button>
		</div>
	);
};

export default AboutCarousel;
