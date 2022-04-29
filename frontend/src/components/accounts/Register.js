import React, { Component, Fragment } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { register } from "../../actions/auth";
import { createMessage } from "../../actions/messages";

import { TextField, CardField } from "../common/CustomField";
import { LinkTag } from "../common/PrivateRoute";

export class Register extends Component {
  static propTypes = {
    register: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      username: "",
      email: "",
      password: "",
      password2: "",
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
    const { username, email, password, password2 } = this.state;
    if (password !== password2) {
      this.props.createMessage({ passwordNotMatch: "Passwords do not match" });
    } else {
      const newUser = { username, password, email };
      this.props.register(newUser);
    }
  }

  render() {
    if (this.props.isAuthenticated) {
      return <Redirect to="/" />;
    }

    const { username, email, password, password2 } = this.state;

    return (
      <Fragment>
        <CardField title="Register">
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
              label="Email"
              type="text"
              id="email"
              name="email"
              value={email}
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
            <TextField
              label="Confirm Password"
              type="password"
              id="password2"
              name="password2"
              value={password2}
              onChange={this.onChange}
            />
            <button type="submit" className="btn btn-primary">
              Register
            </button>
            <p>
              Don't have an account?
              <LinkTag to="/login">Login</LinkTag>
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

export default connect(mapStateToProps, { register, createMessage })(Register);
