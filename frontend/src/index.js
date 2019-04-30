import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter,
  Route,
  Switch,
} from 'react-router-dom';
import ScrollToTop from './components/Scroll/ScrollToTop.jsx';

import BT from './components/BerkeleyTime/index.jsx';

import './assets/css/bootstrap.min.css';
import './assets/css/animate.min.css';
import './assets/sass/berkeleytime.css';
import './assets/css/demo.css';
import './assets/css/pe-icon-7-stroke.css';

ReactDOM.render((
  <BrowserRouter>
    <ScrollToTop>
      <Switch>
        <Route path="/" name="Home" component={BT} />
      </Switch>
    </ScrollToTop>
  </BrowserRouter>
), document.getElementById('root'));
