import React, { FC, useState } from "react";

import doe from 'assets/img/about/group/doe.jpg'
import michaels from 'assets/img/about/group/michaels.jpg'
import retreat from 'assets/img/about/group/retreat.jpg'
import grace_janet from 'assets/img/about/group/grace_janet.jpg'
import will from 'assets/img/about/group/will.jpg'
import jemma from 'assets/img/about/group/jemma.jpg'
import christina_janet from 'assets/img/about/group/christina_janet.jpg'
import retreat_silly from 'assets/img/about/group/retreat_silly.png'
import zoom from 'assets/img/about/group/zoom.png'
enum Sliding {
  Still = 0,
  Right = 1,
  Left = 2
}
const AboutCarousel : FC = () => {
  const [shownImage, setShownImage] = useState<number>(2);

  const [queuedImage, setQueuedImage] = useState<number>(2);
  const [sliding, setSliding] = useState<Sliding>(Sliding.Still);
  const images = [retreat_silly, zoom, doe, grace_janet, retreat,
  christina_janet, michaels, will, jemma];
  const wrap = (val: number) => {
    return (val + images.length) % images.length;
  }
  const previousImage = () => {
    if (sliding === Sliding.Still) {
      setSliding(Sliding.Right)
      setQueuedImage(wrap(shownImage - 1))
    }
  }
  const nextImage = () => {
    if (sliding === Sliding.Still) {
      setSliding(Sliding.Left)
      setQueuedImage(wrap(shownImage + 1))
    }
  }
  const triggerSwap = () => {
    setShownImage(queuedImage)
    setSliding(Sliding.Still)
  }
  const getCarouselItemClass = (idx: number) => {
    let classes = "about-carousel-item "
    if (idx === shownImage) {
      classes += "about-carousel-active-second "
    } else if (idx === wrap(shownImage - 1)) {
      classes += "about-carousel-active-first "
    } else if (idx === wrap(shownImage + 1)) {
      classes += "about-carousel-active-third "
    } else if (idx === wrap(shownImage - 2)) {
      classes += "about-carousel-active-prev "
    } else if (idx === wrap(shownImage + 2)) {
      classes += "about-carousel-active-next "
    }
    return classes
  }
  const getCarouselClass = () => {
    let classes = "about-carousel "
    if (sliding === Sliding.Left) {
      classes += "about-carousel-slide-left "
    } else if (sliding === Sliding.Right) {
      classes += "about-carousel-slide-right "
    }
    return classes
  }
  return (
    <div className="group mb-5">
      <div className={getCarouselClass()} onTransitionEnd={triggerSwap}>
        {images.map((imgVal, idx) => 
          <div key={imgVal} className={getCarouselItemClass(idx)}>
            <img src={imgVal} alt="" />
          </div>)}
      </div>
      <div className="about-carousel-prev">
        <span onClick={previousImage} className="about-carousel-prev-icon" aria-hidden="true"></span>
      </div>
      <div className="about-carousel-next">
        <span onClick={nextImage} className="about-carousel-next-icon" aria-hidden="true"></span>
      </div>
    </div>
  );
}

export default AboutCarousel;