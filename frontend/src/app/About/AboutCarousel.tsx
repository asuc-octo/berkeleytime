import { useEffect, useRef, useState } from 'react';
import { NavArrowLeft, NavArrowRight } from 'iconoir-react';

import michaels from '/images/michaels.jpeg';
import retreat from '/images/retreat.png';
import will from '/images/will.jpeg';
import jemma from '/images/jemma.jpeg';
import christina_janet from '/images/christina_janet.jpeg';
import retreat_silly from '/images/retreat_silly.jpg';
import zoom from '/images/zoom.png';




const images = [
    { img: retreat_silly, alt: 'retreat silly' },
    { img: zoom, alt: 'zoom' },
    { img: retreat, alt: 'retreat' },
    { img: christina_janet, alt: 'christina_janet' },
    { img: michaels, alt: 'michaels' },
    { img: will, alt: 'will' },
    { img: jemma, alt: 'jemma' }
];


import styles from './About.module.scss';

enum Sliding {
    Still = 0,
    Right = 1,
    Left = 2
}


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
        let classes = `${styles.aboutCarouselItem} `;
        if (idx === wrap(shownImage - 2)) {
            classes += `${styles.aboutCarouselActivePrev} `;;
        } else if (idx === wrap(shownImage - 1)) {
            classes += `${styles.aboutCarouselActiveFirst} `;
            if (sliding === Sliding.Right) {
                classes += `${styles.focusIn} `;
            }
        } else if (idx === shownImage) {
            classes += `${styles.aboutCarouselActiveSecond} `;
            if (sliding !== Sliding.Still) {
                classes += `${styles.focusOut} `;
            }
        } else if (idx === wrap(shownImage + 1)) {
            classes += `${styles.aboutCarouselActiveThird} `;
            if (sliding === Sliding.Left) {
                classes += `${styles.focusIn} `;;
            }
        } else if (idx === wrap(shownImage + 2)) {
            classes += `${styles.aboutCarouselActiveNext} `;;
        }
        return classes.trim();
    };

    const getCarouselClass = () => {
        let classes = `${styles.aboutCarousel} `;;
        if (sliding === Sliding.Left) {
            classes += `${styles.aboutCarouselSlideLeft} `;;
        } else if (sliding === Sliding.Right) {
            classes += `${styles.aboutCarouselSlideRight} `;;
        }
        return classes.trim();
    };

    return (
        <div className={styles.group}>
            <div
                className={getCarouselClass()}
                onTransitionEnd={(e) => {
                    if (e.target === e.currentTarget) triggerSwap();
                }}
            >
                {images.map((imgVal, index) => (
                    <div key={imgVal.alt} className={(getCarouselItemClass(index))}>
                        <img src={imgVal.img} alt={imgVal.alt} />
                    </div>
                ))}
            </div>
            <button
                onClick={() => changeImage(Sliding.Right)}
                className={styles.aboutCarouselPrev}
                aria-hidden="true"
            >
                <NavArrowLeft />
            </button>
            <button
                onClick={() => changeImage(Sliding.Left)}
                className={styles.aboutCarouselNext}
                aria-hidden="true"
            >
                <NavArrowRight />
            </button>
        </div>
    );
};

export default AboutCarousel;