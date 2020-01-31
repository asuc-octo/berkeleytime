/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import ScrollToTop from './components/Scroll/ScrollToTop';

import BerkeleyTime from './components/Site/BerkeleyTime';
import store from './redux/store'
import { Provider } from 'react-redux';

import './assets/scss/berkeleytime.css';
//import './assets/css/animate.min.css';
//import './assets/css/demo.css';
//import './assets/css/pe-icon-7-stroke.css';

ReactDOM.render((
  <Provider store={store}>
    <BrowserRouter>
      <ScrollToTop>
        <Switch>
          <Route path="/" name="Home" component={BerkeleyTime} />
        </Switch>
      </ScrollToTop>
    </BrowserRouter>
  </Provider>
), document.getElementById('root'));
