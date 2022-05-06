import React from "react";
import grape from "../../assets/grape.jpg";
import "./Homepage.css";
import Header from "../layout/Header";
export default function  homepage(props) {
    
    return (
        <div>
            {/* <Header /> */}
            <div className="intro"> Cloud-based Information System For <span className="emp">Digital Agriculture</span> </div>
            <div className="small">A system that can manage,curate, analyze, and visualize image datasets for high throughput plant pheotyping</div>

            <div className="img">
                <img
                    src={grape}
                    width="100%"
                    height="100%"
                    alt="severity"
                    />
            </div>
        </div>
    );
  }