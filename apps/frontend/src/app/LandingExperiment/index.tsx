import { useEffect, useRef, useState } from "react";

import NavigationBar from "@/components/NavigationBar";

import styles from "./LandingExperiment.module.scss";

// Smaller viewport = content appears larger when scaled to fit container
// 1920/1.1 ≈ 1745 for ~110% zoom effect
const IFRAME_WIDTH = 1745;
const IFRAME_HEIGHT = 981;

// Get upcoming semester (what students are likely registering for)
const getUpcomingSemester = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const year = now.getFullYear();

  // Nov-Dec: Spring of next year, Jan-Apr: Fall of same year, May-Oct: Spring of next year
  if (month >= 10) return { year: year + 1, semester: "Spring" }; // Nov-Dec -> Spring next year
  if (month <= 3) return { year, semester: "Fall" }; // Jan-Apr -> Fall same year
  return { year: year + 1, semester: "Spring" }; // May-Oct -> Spring next year
};

const LandingExperiment = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const { year, semester } = getUpcomingSemester();
  const defaultClassUrl = `/catalog/${year}/${semester}/COMPSCI/61A/001?embed=true`;

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        // Fit to container by using the smaller scale factor
        const scaleX = containerWidth / IFRAME_WIDTH;
        const scaleY = containerHeight / IFRAME_HEIGHT;
        setScale(Math.min(scaleX, scaleY));
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.sky} />
      <div className={styles.sky2} />
      <div className={styles.lens} />

      <div className={styles.navbarWrapper}>
        <NavigationBar invert />
      </div>

      <div className={styles.content}>
        <div className={styles.previewContainer} ref={containerRef}>
        <div
          className={styles.previewFrame}
          style={{
            width: IFRAME_WIDTH,
            height: IFRAME_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          <iframe
            src={defaultClassUrl}
            className={styles.previewIframe}
            title="Catalog Preview"
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default LandingExperiment;
