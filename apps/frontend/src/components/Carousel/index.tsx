import {
  ComponentPropsWithRef,
  ReactNode,
  UIEvent,
  useRef,
  useState,
} from "react";

import classNames from "classnames";
import { ArrowRight, NavArrowLeft, NavArrowRight } from "iconoir-react";
import { Link, To } from "react-router-dom";

import { Box, Flex, IconButton } from "@repo/theme";

import styles from "./Carousel.module.scss";
import Schedule from "./Schedule";

function Item({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={classNames(styles.item, className)} {...props} />;
}

interface RootProps {
  title: string;
  Icon: ReactNode;
  children: ReactNode;
  to?: To;
}

function Root({ title, Icon, children, to }: RootProps) {
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
      if (
        element &&
        element.offsetLeft < containerRef.current.scrollLeft - 50
      ) {
        containerRef.current.scrollLeft =
          element.offsetLeft - (element.offsetWidth - element.clientWidth);
        return;
      }
    }
    containerRef.current.scrollLeft -= containerRef.current.offsetWidth / 3;
  };

  const scrollRight = () => {
    // scroll to next card to the right
    if (!containerRef.current) return;
    const children = containerRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const element = children.item(i) as HTMLDivElement;
      if (
        element &&
        element.offsetLeft > containerRef.current.scrollLeft + 50
      ) {
        containerRef.current.scrollLeft =
          element.offsetLeft - (element.offsetWidth - element.clientWidth);
        return;
      }
    }
    containerRef.current.scrollLeft += containerRef.current.offsetWidth / 3;
  };

  return (
    <Flex direction="column" gap="4">
      <Flex gap="3" align="center">
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
        <IconButton onClick={scrollLeft}>
          <NavArrowLeft />
        </IconButton>
        <IconButton onClick={scrollRight}>
          <NavArrowRight />
        </IconButton>
      </Flex>
      <Box
        mx="-5"
        className={classNames(styles.body, {
          [styles.start]: start,
          [styles.end]: end,
        })}
      >
        <Flex
          gap="4"
          px="5"
          className={styles.view}
          onScroll={handleScroll}
          ref={containerRef}
        >
          {children}
        </Flex>
      </Box>
    </Flex>
  );
}

const Carousel = {
  Root,
  Item,
  Schedule,
};

export default Carousel;
