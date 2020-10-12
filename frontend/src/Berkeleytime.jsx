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

    const key = 'bt-apps-open-update';
    if (!localStorage[key]) {
      localStorage[key] = true;
      const { dispatch } = this.props;
      dispatch(openBanner());
    }

    //this.updateScreensize = this.updateScreensize.bind(this);
  }

  /**
   * Checks if user is on mobile view
   */
  /*componentDidMount() {
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
  }*/

  easterEgg() {
    console.log(`%c
      Hey there! Checking out how Berkeleytime works? We are a group of student developers
      here at UC Berkeley. We build this site using the latest tech - React, Django, Kubernetes,
      and more. If you love using Berkeleytime and want to see yourself as a contributor,
      we are always looking for passionate individuals to help us improve our product.
      
      Check out our Join Us page, especially towards the start of the Fall semester when we
      are recruiting. Also, send us an email at octo.berkeleytime@asuc.org letting us know you
      found this message!   
 
 
                                     .,,uod8B8bou,,.
                      ..,uod8BBBBBBBBBBBBBBBBRPFT?l!i:.
                 ,=m8BBBBBBBBBBBBBBBRPFT?!||||||||||||||
                 !...:!TVBBBRPFT||||||||||!!^^""'   ||||
                 !.......:!?|||||!!^^""'            ||||
                 !.........||||                     ||||
                 !.........||||  $                  ||||
                 !.........||||                     ||||
                 !.........||||                     ||||
                 !.........||||                     ||||
                 !.........||||                     ||||
                 \`.........||||                    ,||||
                  .;.......||||               _.-!!|||||
           .,uodWBBBBb.....||||       _.-!!|||||||||!:'
        !YBBBBBBBBBBBBBBb..!|||:..-!!|||||||!iof68BBBBBb....
        !..YBBBBBBBBBBBBBBb!!||||||||!iof68BBBBBBRPFT?!::   \`.
        !....YBBBBBBBBBBBBBBbaaitf68BBBBBBRPFT?!:::::::::     \`.
        !......YBBBBBBBBBBBBBBBBBBBRPFT?!::::::;:!^"\`;:::       \`.
        !........YBBBBBBBBBBRPFT?!::::::::::^''...::::::;         iBBbo.
        \`..........YBRPFT?!::::::::::::::::::::::::;iof68bo.      WBBBBbo.
          \`..........:::::::::::::::::::::::;iof688888888888b.     \`YBBBP^'
            \`........::::::::::::::::;iof688888888888888888888b.     \`
              \`......:::::::::;iof688888888888888888888888888888b.
                \`....:::;iof688888888888888888888888888888888899fT!
                  \`..::!8888888888888888888888888888888899fT|!^"'
                    \`' !!988888888888888888888888899fT|!^"'
                        \`!!8888888888888888899fT|!^"'
                          \`!988888888899fT|!^"'
                            \`!9899fT|!^"'
                              \`!^"'
   `, "font-family:monospace");
  }

  render() {
    return (
        <div>
          { this.easterEgg() }
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
