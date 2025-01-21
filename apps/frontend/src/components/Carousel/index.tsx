import { ReactNode, UIEvent, useRef, useState } from "react";

import classNames from "classnames";
import { ArrowRight, NavArrowLeft, NavArrowRight } from "iconoir-react";
import { Link, To } from "react-router-dom";

import { IconButton } from "@repo/theme";

import styles from "./Carousel.module.scss";

interface CarouselProps {
  title: string;
  Icon: ReactNode;
  children: ReactNode;
  to?: To;
}

export default function Carousel({ title, Icon, children, to }: CarouselProps) {
  const [start, setStart] = useState(false);
  const [end, setEnd] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollWidth, clientWidth } =
      event.target as HTMLDivElement;

    setStart(scrollLeft > 0);
    setEnd(scrollLeft + clientWidth < scrollWidth);
  };

  const scrollLeft = () => {
    // scroll to next card to the left
    if (!containerRef.current) return;
    const children = containerRef.current.children;
    for (let i = children.length; i >= 0; i--) {
      const element = children.item(i) as HTMLDivElement;
      if (element && element.offsetLeft < containerRef.current.scrollLeft - 50) {
        containerRef.current.scrollLeft = element.offsetLeft - (element.offsetWidth - element.clientWidth);
        return;
      }
    }
    containerRef.current.scrollLeft -= containerRef.current.offsetWidth / 3;
  }
  const scrollRight = () => {
    // scroll to next card to the right
    if (!containerRef.current) return;
    const children = containerRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const element = children.item(i) as HTMLDivElement;
      if (element && element.offsetLeft > containerRef.current.scrollLeft + 50) {
        containerRef.current.scrollLeft = element.offsetLeft - (element.offsetWidth - element.clientWidth);
        return;
      }
    }
    containerRef.current.scrollLeft += containerRef.current.offsetWidth / 3;
  }


  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.title}>
          <div className={styles.icon}>{Icon}</div>
          {title}
        </div>
        {to && (
          <Link to={to} className={styles.link}>
            View all
            <ArrowRight />
          </Link>
        )}
        <IconButton onClick={ scrollLeft }>
          <NavArrowLeft />
        </IconButton>
        <IconButton onClick={scrollRight}>
          <NavArrowRight />
        </IconButton>
      </div>
      <div
        className={classNames(styles.body, {
          [styles.start]: start,
          [styles.end]: end,
        })}
      >
        <div className={styles.view} onScroll={handleScroll} ref={containerRef}>
          {children}
        </div>
      </div>
    </div>
  );
}
