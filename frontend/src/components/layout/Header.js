import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { logout } from "../../actions/auth";

import logo from "../../assets/title.png";

export class Header extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
  };

  render() {
    const { isAuthenticated, user } = this.props.auth;

    const authLinks = (
      <nav className="Status" style={style.Status}>
        <span style={{ marginRight: "1em", color: "black" }}>
          <strong>{user ? `Welcome ${user.username}` : ""}</strong>
        </span>
        <button
          onClick={this.props.logout}
          className="nav-link btn btn-info btn-sm text-light"
        >
          Logout
        </button>
      </nav>
    );

    const guestLinks = (
      <nav className="Status" style={style.Status}>
        <Link to="/register" style={style.Link}>
          <nav className="Register" style={style.Register}>
            Register
          </nav>
        </Link>
        <Link to="/login" style={style.Link}>
          <nav className="Login" style={style.Login}>
            Login
          </nav>
        </Link>
      </nav>
    );

    return (
      <div className="Header" style={style.Header}>
        <Link to="/" style={style.Link}>
          <nav className="Title" style={style.Title}>
            <img src={logo} style={style.Logo} className="logo" alt="logo" />
          </nav>
        </Link>
        {isAuthenticated ? authLinks : guestLinks}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logout })(Header);

const style = {
  Header: {
    display: "flex",
    justifyContent: "space-between",
    color: "white",
    boxSizing: "border-box",
    padding: "20px 0",
    width: "80%",
    margin: "auto",
  },
  Logo: {
    height: "80px",
    pointerEvents: "none",
    margin: 0,
  },
  Title: {
    display: "flex",
    alignItems: "center",
  },
  Status: {
    display: "flex",
    alignItems: "center",
  },
  Register: {
    lineHeight: 4,
    marginRight: "1em",
  },
  Login: {
    lineHeight: 4,
  },
  Link: {
    textDecoration: "none",
    color: "black",
  },
};
