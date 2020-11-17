import React, { FC } from 'react';
import { useLocation } from 'react-router';
import ReactGA from 'react-ga'

const gaTrackingID = 'UA-35316609-1'

ReactGA.initialize(gaTrackingID)

const LogPageView: FC = () => {
  let location = useLocation()

  React.useEffect(() => {
    ReactGA.set({ page: window.location.pathname })
    ReactGA.pageview(window.location.pathname)
  }, [location.pathname])

  return null;
}

export default LogPageView;
