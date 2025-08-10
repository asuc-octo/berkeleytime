import { ReactNode, UIEvent, useRef, useState } from "react";

import classNames from "classnames";

import { Box, Flex } from "@repo/theme";

import styles from "../Carousel.module.scss";

interface RootProps {
  children: ReactNode;
}

export default function CarouselNoTitle({ children }: RootProps) {
  const [start, setStart] = useState(false);
  const [end, setEnd] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollWidth, clientWidth } =
      event.target as HTMLDivElement;

    setStart(scrollLeft > 0);
    setEnd(scrollLeft + clientWidth < scrollWidth);
  };

  return (
    <Flex direction="column" gap="4">
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
