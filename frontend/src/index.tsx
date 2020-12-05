import React from 'react';
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'

import ScrollToTop from 'components/Common/ScrollToTop'
import LogPageView from 'components/Common/LogPageView'
import Stanfurdtime from 'Berkeleytime'
import store from './redux/store'

import 'assets/scss/berkeleytime.css';

ReactDOM.render((
  <Provider store={store}>
    <BrowserRouter>
      <ScrollToTop />
      <LogPageView />
      <Stanfurdtime />
    </BrowserRouter>
  </Provider>
), document.getElementById('root'));
