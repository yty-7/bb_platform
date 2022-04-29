import React, { Component } from "react";

import cornell from "../../assets/cornell_seal.png";
import logo from "../../assets/cair.png";

import "./Footer.css";

export class Footer extends Component {
  render() {
    return (
      <footer>
        <div className="first">
          <a
            href="https://cals.cornell.edu/cornell-agritech"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="left">
              <img src={cornell} alt="Cornell University" width="80px" height="80px" />
            </div>
            <div className="right">
              <p>
                Cornell University
                <br />
                Cornell AgriTech
              </p>
            </div>
          </a>
          <a href="https://cals.cornell.edu/yu-jiang">
            <div className="logo">
              <img src={logo} alt="Lab Logo" height="65px" />
            </div>
            {/* <div className="right">
              <p>
                &nbsp; Yu Group
                <br />
                &nbsp; CAIR
              </p>
            </div> */}
          </a>
        </div>
        <div className="second">
          <p>
            Visit the
            <a
              href="https://cals.cornell.edu/yu-jiang"
              style={{ color: "#99ccff", textDecoration: "none" }}
            >
              <b className='needSpace'>CAIR Lab</b>
            </a>
            for contact information<br />© CAIR Lab 2020-2021
          </p>
        </div>
      </footer>
    );
  }
}

export default Footer;
