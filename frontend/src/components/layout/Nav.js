import React, { Component } from "react";

import "./Nav.css";
import { Link } from "react-router-dom";

const boards = ["Project", "Dataset", "Process", "Model", "Metric"];
const boardsURL = {
  Project: "/projects",
  Dataset: "/datasets",
  Process: "/processes",
  Model: "/models",
  Metric: "/metrics",
};

export class Nav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menu: false,
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu() {
    this.setState({ menu: !this.state.menu });
  }

  render() {
    const show = this.state.menu ? " show" : "";

    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            <li className={"nav-item dropdown" + show}>
              <div
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-toggle="dropdown"
                onClick={this.toggleMenu}
                aria-haspopup="true"
                aria-expanded="false"
              >
                Board
              </div>
              <div
                className={"dropdown-menu" + show}
                aria-labelledby="navbarDropdown"
              >
                {boards.map((board, idx) => (
                  <Link
                    key={idx}
                    className="dropdown-item"
                    to={boardsURL[board]}
                    onClick={this.toggleMenu}
                  >
                    {board}
                  </Link>
                ))}
              </div>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">
                About
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default Nav;
