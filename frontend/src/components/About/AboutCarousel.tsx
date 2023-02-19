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

const AboutCarousel : FC = () => {
  const [shownImage, setShownImage] = useState<number>(2);
  const images = [retreat_silly, zoom, doe, grace_janet, retreat,
  christina_janet, michaels, will, jemma];
  const wrap = (val: number) => {
    return (val + images.length) % images.length;
  }
  const previousImage = () => {
    setShownImage(wrap(shownImage - 1))
  }
  const nextImage = () => {
    setShownImage(wrap(shownImage + 1))
  }
  const getCarouselItemClass = (idx: number) => {
    let classes = "about-carousel-item "
    if (idx === shownImage) {
      classes += "about-carousel-active-second"
    } else if (idx === wrap(shownImage - 1)) {
      classes += "about-carousel-active-first"
    } else if (idx === wrap(shownImage + 1)) {
      classes += "about-carousel-active-third"
    }
    return classes
  }
  return (
    <div className="group mb-5">
      {images.map((imgVal, idx) => 
        <div key={imgVal} className={getCarouselItemClass(idx)}>
          <img src={imgVal} alt="" />
        </div>)}
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