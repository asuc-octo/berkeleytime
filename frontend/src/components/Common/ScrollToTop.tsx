import React, { FC } from 'react';
import { useLocation } from 'react-router';

const ScrollToTop: FC = (props) => {
  let location = useLocation()

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  return props.children as JSX.Element
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/44572
}

export default ScrollToTop;
