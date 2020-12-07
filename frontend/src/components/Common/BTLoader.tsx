import React, { useEffect, useState } from 'react';

// Wait this many MS before showing the loader.
const TIME_BEFORE_LOADER = 80;

type Props = {
  showInstantly?: boolean;
};

const BTLoader = ({
  showInstantly = false
}: Props) => {
  const [showingLoader, setShowingLoader] = useState(false);

  useEffect(() => {
    const loader = setTimeout(() => {
      setShowingLoader(true);
    }, TIME_BEFORE_LOADER);

    return () => clearTimeout(loader);
  }, []);

  if (showingLoader || showInstantly) {
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
