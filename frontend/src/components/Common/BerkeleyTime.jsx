import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import ReactGA from 'react-ga';

import Banner from './Banner';
import Navigation from './Navigation';
import Footer from './Footer';
import routes from '../../routes/routes';

import { openBanner, showMobile, hideMobile } from '../../redux/actions';

const gaTrackingID = 'UA-35316609-1';
ReactGA.initialize(gaTrackingID);

const logPageView = () => {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
  return null;
};

class BerkeleyTime extends PureComponent {
  constructor(props) {
    super(props);

    // comment out to not display banner
    this.props.dispatch(openBanner());
    this.updateScreensize = this.updateScreensize.bind(this);
  }

   /**
   * Checks if user is on mobile view
   */
  componentDidMount() {
    this.updateScreensize();
    window.addEventListener("resize", this.updateScreensize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateScreensize);
  }

  updateScreensize() {
    const { dispatch } = this.props;
    if (window.innerWidth <= 768) {
      dispatch(showMobile());
    }
    else {
      dispatch(hideMobile());
    }
  }

  render() {
    const bannerText = 'We have a new announcement! Here is a longer description of the main text and more details about the whole thing.';
    const { banner } = this.props;

    return (
      <div className="app-container">
        <Banner text={bannerText} />
        <Navigation />
        <Route path="/" component={logPageView} />
        <div className={`${banner ? 'banner-visible' : ''}`}>
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
        </div>
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { banner } = state.banner;
  return {
    banner,
  }
}

export default connect(mapStateToProps)(BerkeleyTime);
