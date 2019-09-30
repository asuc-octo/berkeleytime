import React, { PureComponent } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import ReactGA from 'react-ga';

import Navigation from '../Common/Navigation';
import Footer from '../Common/Footer';
import routes from '../../routes/routes';

const gaTrackingID = 'UA-35316609-1';
ReactGA.initialize(gaTrackingID);

const logPageView = () => {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
  return null;
};

class BerkeleyTime extends PureComponent {
  render() {
    return (
      <div className="app">
        <Navigation />
        <Route path="/" component={logPageView} />
        <Switch>
          {
            routes.map(route => {
              if (route.redirect) {
                return (
                  <Redirect exact={route.exact} from={route.path} to={route.to} key={route.name} />
                );
              } else {
                return (
                  <Route exact={route.exact} path={route.path} component={route.component} key={route.name} />
                );
              }
            })
          }
        </Switch>
        <Footer />
      </div>
    );
  }
}

export default BerkeleyTime;
