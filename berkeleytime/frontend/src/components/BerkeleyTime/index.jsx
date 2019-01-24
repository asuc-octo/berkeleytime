import React from 'react';
import {
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

import Navigation from '../Navigation/index.jsx';
import Footer from '../Footer/index.jsx';

import appRoutes from '../../routes/app.js';

function BerkeleyTime({ props }) {
  return (
    <div className="bt">
      <div id="main-panel" className="main-panel">
        <Navigation {...props} />
        <Switch>
          {
            appRoutes.map((prop, key) => {
              if (prop.redirect) {
                return (
                  <Redirect from={prop.path} to={prop.to} key={key} />
                );
              }
              return (
                <Route path={prop.path} component={prop.component} key={key} />
              );
            })
          }
        </Switch>
        <Footer />
      </div>
    </div>
  );
}

export default BerkeleyTime;
