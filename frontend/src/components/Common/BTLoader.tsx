import cx from "classnames";
import React, { useEffect, useState } from "react";

// Wait this many MS before showing the loader.
const TIME_BEFORE_LOADER = 80;

type Props = {
  /**
   * Typically the loading indicator doesn't come up
   * instantly so it doesn't flash for very-fast loads.
   */
  showInstantly?: boolean;

  /**
   * If to show a message about what is currently loading.
   */
  message?: string;

  /**
   * An error to show
   */
  error?: Error | string | null;

  /**
   * If to fill the page
   */
  fill?: boolean;
};

const BTLoader = ({
  showInstantly = false,
  message,
  error,
  fill = false,
}: Props) => {
  const [showingLoader, setShowingLoader] = useState(false);

  useEffect(() => {
    const loader = setTimeout(() => {
      setShowingLoader(true);
    }, TIME_BEFORE_LOADER);

    return () => clearTimeout(loader);
  }, []);

  if (error) {
    return (
      <div
        className={cx("bt-loader-wrapper", "bt-loader--error", {
          "bt-loader--fill": fill,
        })}
      >
        {typeof error === "string" ? (
          <p>{error}</p>
        ) : (
          <>
            <p>An unexpected error occured.</p>
            <p>{error.message}</p>
          </>
        )}
      </div>
    );
  }

  if (showingLoader || showInstantly) {
    return (
      <div
        className={cx("bt-loader-wrapper", {
          "bt-loader--fill": fill,
        })}
      >
        <div className="bt-loader">
          <div />
          <div />
          <div />
        </div>
        {message && <p>{message}</p>}
      </div>
    );
  } else {
    return null;
  }
};

export default BTLoader;
