import { useEffect, useMemo, useState } from "react";

import { ArrowUpRight, Xmark } from "iconoir-react";

import { useAllBanners } from "@/hooks/api/banner";
import {
  isBannerViewed,
  markBannerAsViewed,
  syncViewedBanners,
} from "@/lib/banner";

import styles from "./Banner.module.scss";
import BetaBanner from "./BetaBanner";

export default function Banner() {
  const { data: banners, loading, error } = useAllBanners();
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(
    new Set()
  );

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
      // Skip if persistent (always show) or if already dismissed in this session
      if (banner.persistent) {
        return banner;
      }

      // Skip if dismissed in this session
      if (dismissedBanners.has(banner.id)) {
        continue;
      }

      // Skip if viewed in localStorage
      if (isBannerViewed(banner.id)) {
        continue;
      }

      // Found a banner to show
      return banner;
    }

    return null;
  }, [banners, loading, dismissedBanners]);

  const handleDismiss = () => {
    if (!activeBanner) return;

    // Mark as dismissed in this session
    setDismissedBanners((prev) => new Set(prev).add(activeBanner.id));

    // If not persistent, mark as viewed in localStorage
    if (!activeBanner.persistent) {
      markBannerAsViewed(activeBanner.id);
    }
  };

  if (!activeBanner) {
    return <BetaBanner />;
  }

  return (
    <div className={styles.root}>
      <p
        className={styles.text}
        dangerouslySetInnerHTML={{ __html: activeBanner.text }}
      />
      <div className={styles.actions}>
        {activeBanner.link && (
          <a
            className={styles.link}
            href={activeBanner.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{activeBanner.linkText ?? "Learn more"}</span>
            <ArrowUpRight height={12} width={12} />
          </a>
        )}
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
    </div>
  );
}
