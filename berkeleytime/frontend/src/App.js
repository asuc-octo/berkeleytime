import React from 'react';
import ReactDOM from 'react-dom';

import {
  HashRouter,
  Route,
  Switch,
} from 'react-router-dom';

import BT from './components/BerkeleyTime/index.jsx';

import './assets/css/bootstrap.min.css';
import './assets/css/animate.min.css';
import './assets/sass/light-bootstrap-dashboard.css';
import './assets/css/demo.css';
import './assets/css/pe-icon-7-stroke.css';

const App = () => (
  <HashRouter>
    <Switch>
      <Route path="/" name="Home" component={BT} />
    </Switch>
  </HashRouter>
);
const wrapper = document.getElementById("root");
wrapper ? ReactDOM.render(<App />, wrapper) : null;