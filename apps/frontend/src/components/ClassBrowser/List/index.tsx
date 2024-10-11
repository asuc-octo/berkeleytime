import { useEffect, useRef } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowRight, FrameAltEmpty, Sparks } from "iconoir-react";
import { Link, useSearchParams } from "react-router-dom";

import { LoadingIndicator } from "@repo/theme";

import { IClass } from "@/lib/api";

import Header from "../Header";
import useBrowser from "../useBrowser";
import Class from "./Class";
import styles from "./List.module.scss";

interface ListProps {
  onClassSelect: (_class: IClass) => void;
}

export default function List({ onClassSelect }: ListProps) {
  const { classes, loading } = useBrowser();

  const rootRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  const virtualizer = useVirtualizer({
    count: classes.length,
    getScrollElement: () => rootRef.current,
    estimateSize: () => 136,
    paddingStart: 72,
    paddingEnd: 72,
    gap: 12,
  });

  useEffect(() => {
    rootRef.current?.scrollTo({ top: 0 });
  }, [searchParams]);

  const items = virtualizer.getVirtualItems();

  const totalSize = virtualizer.getTotalSize();

  return (
    <div ref={rootRef} className={styles.root}>
      <div
        className={styles.view}
        style={{
          height: totalSize,
        }}
      >
        <Header />
        {loading && items.length === 0 ? (
          <div className={styles.placeholder}>
            <LoadingIndicator size="lg" />
            <div className={styles.text}>
              <p className={styles.heading}>Fetching courses...</p>
              <p className={styles.description}>
                Search for, filter, and sort courses to narrow down your
                results.
              </p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.placeholder}>
            <FrameAltEmpty width={32} height={32} />
            <div className={styles.text}>
              <p className={styles.heading}>No courses found</p>
              <p className={styles.description}>
                Find courses by broadening your search or entering a different
                query.
              </p>
            </div>
          </div>
        ) : (
          <div
            className={styles.body}
            style={{ transform: `translateY(${items[0]?.start ?? 0}px)` }}
          >
            {items.map(({ key, index }) => {
              const _class = classes[index];

              return (
                <Class
                  {..._class}
                  index={index}
                  key={key}
                  ref={virtualizer.measureElement}
                  onClick={() => onClassSelect(_class)}
                />
              );
            })}
          </div>
        )}
        <div className={styles.footer}>
          <Link to="/discover" className={styles.button}>
            <Sparks />
            <p className={styles.text}>Try discovering courses</p>
            <ArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
