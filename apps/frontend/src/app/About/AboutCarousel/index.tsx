import { useEffect, useRef, useState } from "react";

import classNames from "classnames";
import { NavArrowLeft, NavArrowRight } from "iconoir-react";

import dolores from "../../../assets/img/about/group/dolores-social.jpg";
import matt from "../../../assets/img/about/group/matt-falling.jpg";
import retreat from "../../../assets/img/about/group/retreat.jpg";
import rooftop from "../../../assets/img/about/group/rooftop-social.jpg";
import start from "../../../assets/img/about/group/start.jpg";
import styles from "./AboutCarousel.module.scss";

enum Sliding {
  Still = 0,
  Right = 1,
  Left = 2,
}

const images = [
  { img: matt, alt: "matt falling" },
  { img: retreat, alt: "retreat" },
  { img: start, alt: "start photo" },
  { img: dolores, alt: "dolores park social" },
  { img: rooftop, alt: "rooftop social" },
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
    let classes = [styles.aboutCarouselItem];
    if (idx === wrap(shownImage - 2)) {
      classes.push(styles.aboutCarouselActivePrev);
    } else if (idx === wrap(shownImage - 1)) {
      classes.push(styles.aboutCarouselActiveFirst);
      if (sliding === Sliding.Right) {
        classes.push(styles.focusIn);
      }
    } else if (idx === shownImage) {
      classes.push(styles.aboutCarouselActiveSecond);
      if (sliding !== Sliding.Still) {
        classes.push(styles.focusOut);
      }
    } else if (idx === wrap(shownImage + 1)) {
      classes.push(styles.aboutCarouselActiveThird);
      if (sliding === Sliding.Left) {
        classes.push(styles.focusIn);
      }
    } else if (idx === wrap(shownImage + 2)) {
      classes.push(styles.aboutCarouselActiveNext);
    }
    return classes;
  };

  const getCarouselClass = () => {
    let classes = [styles.aboutCarousel];
    if (sliding === Sliding.Left) {
      classes.push(styles.aboutCarouselSlideLeft);
    } else if (sliding === Sliding.Right) {
      classes.push(styles.aboutCarouselSlideRight);
    }
    return classes;
  };

  return (
    <div className={styles.group}>
      <div
        className={classNames(getCarouselClass())}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget) triggerSwap();
        }}
      >
        {images.map((imgVal, index) => (
          <div
            key={imgVal.alt}
            className={classNames(getCarouselItemClass(index))}
          >
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
