import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { NavArrowLeft, NavArrowRight } from "iconoir-react";

import styles from "./ScrollableRow.module.scss";

interface ScrollableRowProps {
  children: ReactNode;
  className?: string;
}

export default function ScrollableRow({
  children,
  className,
}: ScrollableRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial check
    updateScrollState();

    // Re-check on resize
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);

    // Re-check when children change
    const mutationObserver = new MutationObserver(updateScrollState);
    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [updateScrollState, children]);

  const scrollLeft = () => {
    const container = containerRef.current;
    if (!container) return;

    const cardWidth = container.querySelector(":scope > *")?.clientWidth ?? 300;
    container.scrollBy({ left: -cardWidth - 16, behavior: "smooth" });
  };

  const scrollRight = () => {
    const container = containerRef.current;
    if (!container) return;

    const cardWidth = container.querySelector(":scope > *")?.clientWidth ?? 300;
    container.scrollBy({ left: cardWidth + 16, behavior: "smooth" });
  };

  return (
    <div className={styles.wrapper}>
      {canScrollLeft && (
        <button
          className={`${styles.arrowButton} ${styles.arrowLeft}`}
          onClick={scrollLeft}
          aria-label="Scroll left"
        >
          <NavArrowLeft width={20} height={20} />
        </button>
      )}
      <div
        ref={containerRef}
        className={`${styles.scrollContainer} ${className ?? ""}`}
        onScroll={updateScrollState}
      >
        {children}
      </div>
      {canScrollRight && (
        <button
          className={`${styles.arrowButton} ${styles.arrowRight}`}
          onClick={scrollRight}
          aria-label="Scroll right"
        >
          <NavArrowRight width={20} height={20} />
        </button>
      )}
    </div>
  );
}
