import React, { Component, Fragment } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { login } from "../../actions/auth";

import { TextField, CardField } from "../common/CustomField";
import { LinkTag } from "../common/PrivateRoute";

export class Login extends Component {
  static propTypes = {
    login: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.login(this.state.username, this.state.password);
  }

  render() {
    if (this.props.isAuthenticated) {
      return <Redirect to="/" />;
    }

    const { username, password } = this.state;
    return (
      <Fragment>
        <CardField title="Login">
          <form onSubmit={this.onSubmit}>
            <TextField
              label="Username"
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={this.onChange}
            />
            <TextField
              label="Password"
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={this.onChange}
            />
            <button type="submit" className="btn btn-primary">
              Login
            </button>
            <p>
              Don't have an account?
              <LinkTag to="/register">Register</LinkTag>
            </p>
          </form>
        </CardField>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { login })(Login);
