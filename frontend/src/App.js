import React, { Component, Fragment } from "react";

import { Provider } from "react-redux";
import store from "./store";

import { Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";

import { BrowserRouter as Router } from "react-router-dom";

import Header from "./components/layout/Header";
import Nav from "./components/layout/Nav";
import Alerts from "./components/layout/Alerts";
import Footer from "./components/layout/Footer";

import PrivateRoute from "./components/common/PrivateRoute";
import Homepage from "./components/common/Homepage";

import masterRoute from "./routes/index";

import { loadUser } from "./actions/auth";

import "./App.css";

// Alert Options
const alertOptions = {
  timeout: 3000,
  position: "top center",
};

export default class App extends Component {
  componentDidMount() {
    store.dispatch(loadUser());
  }

  render() {
    return (
      <Provider store={store}>
        <AlertProvider template={AlertTemplate} {...alertOptions}>
          <Router>
            <Fragment>
              <div className="App">
                <Header />
                {/* <Homepage  /> */}
                <PrivateRoute component={Nav} />
                <Alerts />
                {masterRoute}
                <Footer />
              </div>
            </Fragment>
          </Router>
        </AlertProvider>
      </Provider>
    );
  }
}
