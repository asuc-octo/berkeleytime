import React, { useEffect, useState } from 'react';

// Wait this many MS before showing the loader.
const TIME_BEFORE_LOADER = 80;

const BTLoader = () => {
  const [showingLoader, setShowingLoader] = useState(false);

  useEffect(() => {
    const loader = setTimeout(() => {
      setShowingLoader(true);
    }, TIME_BEFORE_LOADER);

    return () => clearTimeout(loader);
  }, []);

  if (showingLoader) {
    return (
      <div className="bt-loader-wrapper">
        <div className="bt-loader">
          <div />
          <div />
          <div />
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default BTLoader;
