import React, { FC } from 'react';
import { useLocation } from 'react-router';

const ScrollToTop: FC = () => {
  let location = useLocation()

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  return null;
}

export default ScrollToTop;
