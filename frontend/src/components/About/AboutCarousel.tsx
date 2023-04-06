import { useEffect, useRef, useState } from 'react';
import { NavArrowLeft, NavArrowRight } from 'iconoir-react';

import doe from 'assets/img/about/group/doe.jpg';
import michaels from 'assets/img/about/group/michaels.jpg';
import retreat from 'assets/img/about/group/retreat.jpg';
import grace_janet from 'assets/img/about/group/grace_janet.jpg';
import will from 'assets/img/about/group/will.jpg';
import jemma from 'assets/img/about/group/jemma.jpg';
import christina_janet from 'assets/img/about/group/christina_janet.jpg';
import retreat_silly from 'assets/img/about/group/retreat_silly.png';
import zoom from 'assets/img/about/group/zoom.png';

enum Sliding {
	Still = 0,
	Right = 1,
	Left = 2
}

const images = [
	{ img: retreat_silly, alt: 'retreat silly' },
	{ img: zoom, alt: 'zoom' },
	{ img: doe, alt: 'doe' },
	{ img: grace_janet, alt: 'grace_janet' },
	{ img: retreat, alt: 'retreat' },
	{ img: christina_janet, alt: 'christina_janet' },
	{ img: michaels, alt: 'michaels' },
	{ img: will, alt: 'will' },
	{ img: jemma, alt: 'jemma' }
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
