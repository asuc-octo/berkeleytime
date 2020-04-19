import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';

import Banner from './components/Common/Banner';
import Navigation from './components/Common/Navigation';
import Footer from './components/Common/Footer';
import routes from './routes/routes';

// eslint-disable-next-line no-unused-vars
import { openBanner, showMobile, hideMobile } from './redux/actions';

const gaTrackingID = 'UA-35316609-1';
ReactGA.initialize(gaTrackingID);

const logPageView = () => {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
  return null;
};

class Berkeleytime extends Component {
  constructor(props) {
    super(props);

    // comment out to not display banner
    // this.props.dispatch(openBanner());
    this.updateScreensize = this.updateScreensize.bind(this);
  }

  /**
   * Checks if user is on mobile view
   */
  componentDidMount() {
    this.updateScreensize();
    window.addEventListener('resize', this.updateScreensize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateScreensize);
  }

  updateScreensize() {
    const { dispatch } = this.props;
    if (window.innerWidth <= 768) {
      dispatch(showMobile());
    } else {
      dispatch(hideMobile());
    }
  }

  render() {
    return (
      <div>
        <Banner />
        <div className="app-container">
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
      </div>
    );
  }
}

Berkeleytime.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(Berkeleytime);
