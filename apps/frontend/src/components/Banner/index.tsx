import { useEffect, useMemo, useRef, useState } from "react";

import { ArrowUpRight, Xmark } from "iconoir-react";
import Markdown from "react-markdown";

import {
  useAllBanners,
  useIncrementBannerDismiss,
  useTrackBannerView,
} from "@/hooks/api/banner";
import {
  isBannerSessionDismissed,
  isBannerViewed,
  markBannerAsSessionDismissed,
  markBannerAsViewed,
  syncViewedBanners,
} from "@/lib/banner";

import styles from "./Banner.module.scss";
import BetaBanner from "./BetaBanner";

export default function Banner() {
  const { data: banners, loading, error } = useAllBanners();
  const { incrementDismiss } = useIncrementBannerDismiss();
  const { trackView } = useTrackBannerView();
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(
    new Set()
  );
  const trackedViewsRef = useRef<Set<string>>(new Set());

  // Log errors for debugging
  if (error) {
    console.error("Error fetching banners:", error);
  }

  // Keep localStorage in sync with banners that still exist on the backend
  useEffect(() => {
    if (!banners || banners.length === 0) return;

    syncViewedBanners(banners.map((banner) => banner.id));
  }, [banners]);

  // Get the first banner that hasn't been viewed or dismissed
  const activeBanner = useMemo(() => {
    if (loading || !banners || banners.length === 0) return null;

    for (const banner of banners) {
      // Persistent banners always show and cannot be dismissed
      if (banner.persistent) {
        return banner;
      }

      // Skip if dismissed in this session (in-memory state)
      if (dismissedBanners.has(banner.id)) {
        continue;
      }

      // Reappearing banners use sessionStorage (reappear on new tabs)
      if (banner.reappearing) {
        if (isBannerSessionDismissed(banner.id)) {
          continue;
        }
        return banner;
      }

      // Regular banners use localStorage (permanently dismissed)
      if (isBannerViewed(banner.id)) {
        continue;
      }

      // Found a banner to show
      return banner;
    }

    return null;
  }, [banners, loading, dismissedBanners]);

  // Track view for all banners (always on now)
  useEffect(() => {
    if (!activeBanner) return;
    if (trackedViewsRef.current.has(activeBanner.id)) return;

    trackedViewsRef.current.add(activeBanner.id);
    trackView(activeBanner.id);
  }, [activeBanner, trackView]);

  const handleDismiss = () => {
    if (!activeBanner) return;

    // Track dismissal (always on now)
    incrementDismiss(activeBanner.id);

    // Mark as dismissed in this session (in-memory state)
    setDismissedBanners((prev) => new Set(prev).add(activeBanner.id));

    // Reappearing banners use sessionStorage (reappear on new tabs)
    if (activeBanner.reappearing) {
      markBannerAsSessionDismissed(activeBanner.id);
    } else if (!activeBanner.persistent) {
      // Regular banners use localStorage (permanently dismissed)
      markBannerAsViewed(activeBanner.id);
    }
  };

  if (!activeBanner) {
    return <BetaBanner />;
  }

  // Use redirect-based click tracking for reliable 100% tracking
  const clickUrl = activeBanner.link
    ? `/banner/click/${activeBanner.id}`
    : null;

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Markdown
          className={styles.text}
          allowedElements={["p", "em", "strong", "a", "br"]}
          unwrapDisallowed
          components={{
            // Render links safely with security attributes
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {activeBanner.text}
        </Markdown>
        {activeBanner.link && clickUrl && (
          <div className={styles.actions}>
            <a
              className={styles.link}
              href={clickUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{activeBanner.linkText ?? "Learn more"}</span>
              <ArrowUpRight height={12} width={12} />
            </a>
          </div>
        )}
      </div>
      {!activeBanner.persistent && (
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleDismiss}
          aria-label="Close banner"
        >
          <Xmark width={16} height={16} />
        </button>
      )}
    </div>
  );
}
