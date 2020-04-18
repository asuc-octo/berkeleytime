/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import ScrollToTop from './components/Scroll/ScrollToTop';
import Berkeleytime from './components/Common/Berkeleytime';
import store from './redux/store';

import './assets/scss/berkeleytime.css';

ReactDOM.render((
  <Provider store={store}>
    <BrowserRouter>
      <ScrollToTop>
        <Berkeleytime />
      </ScrollToTop>
    </BrowserRouter>
  </Provider>
), document.getElementById('root'));
