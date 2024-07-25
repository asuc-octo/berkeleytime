import { ReactNode, UIEvent, useState } from "react";

import classNames from "classnames";
import { ArrowRight, NavArrowLeft, NavArrowRight } from "iconoir-react";
import { Link, To } from "react-router-dom";

import IconButton from "@/components/IconButton";

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

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollWidth, clientWidth } =
      event.target as HTMLDivElement;

    setStart(scrollLeft > 0);
    setEnd(scrollLeft + clientWidth < scrollWidth);
  };

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
        <IconButton>
          <NavArrowLeft />
        </IconButton>
        <IconButton>
          <NavArrowRight />
        </IconButton>
      </div>
      <div
        className={classNames(styles.body, {
          [styles.start]: start,
          [styles.end]: end,
        })}
      >
        <div className={styles.view} onScroll={handleScroll}>
          {children}
        </div>
      </div>
    </div>
  );
}
