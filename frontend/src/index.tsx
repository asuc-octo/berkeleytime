import "assets/scss/berkeleytime.scss";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { ApolloProvider } from "@apollo/client";

import Berkeleytime from "./Berkeleytime";
import LogPageView from "./components/Common/LogPageView";
import ScrollToTop from "./components/Common/ScrollToTop";
import client from "./graphql/client";
import store from "./redux/store";

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
