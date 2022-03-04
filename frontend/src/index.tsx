import Berkeleytime from "Berkeleytime";
import "assets/scss/berkeleytime.scss";
import axios from "axios";
import LogPageView from "components/Common/LogPageView";
import ScrollToTop from "components/Common/ScrollToTop";
import { REACT_APP_API_URL } from "config";
import client from "graphql/client";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "redux/store";
import { setAuthToken } from "utils/utils";

import { ApolloProvider } from "@apollo/client";

if (localStorage.id_token) {
  axios
    .post(`${REACT_APP_API_URL}/users/google/callback`, {
      idToken: localStorage.id_token,
      accessToken: localStorage.access_token,
    })
    .then(() => {
      setAuthToken(localStorage.id_token);
    })
    .catch(() => {
      delete localStorage.id_token;
      delete localStorage.access_token;
    });
}

ReactDOM.render(
  <ApolloProvider client={client}>
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop />
        <LogPageView />
        <Berkeleytime />
      </BrowserRouter>
    </Provider>
  </ApolloProvider>,
  document.getElementById("root")
);
