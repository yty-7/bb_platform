// import React from "react";
import { connect } from "react-redux";
import { Route, Redirect, Link } from "react-router-dom";

import React, { Component, Fragment } from "react";
// import Header from "../layout/Header";

const PrivateRoute = ({ component: Component, auth, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (auth.isLoading) {
        return <h2>Loading...</h2>;
      } else if (!auth.isAuthenticated) {
        return <Redirect to="/login" />;   
      } else {
        return <Component {...props} />;
      }
    }}
  />
);

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(PrivateRoute);

export const LinkTag = (props) => {
  return (
  
      <Link to={props.to} style={{ color: "steelblue", textDecoration: "none" }}>   
        {props.children}
      </Link>
    
  );
};
//所有linkTag是这样
