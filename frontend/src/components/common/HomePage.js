// import React from "react";
import grape from "../../assets/grape.jpg";
import "./Homepage.css";
// import Header from "../layout/Header";

import React, { Fragment } from "react";

import { LinkTag } from "../common/PrivateRoute";
import { CardField } from "../common/CustomField";

export default function  homepage(props) {
    return (
         <Fragment>
         <div>
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
         <div className="Dashboard">
           <BoardCard
             link="projects"
             title="Project"
             body="Create new projects and view existing projects"
           />
           <BoardCard
             link="datasets"
             title="Dataset"
             body="Create new datasets and view existing datasets"
           />
           <BoardCard
             link="processes"
             title="Process"
             body="Create new processes and view existing processes"
           />
           <BoardCard
             link="models"
             title="PyTorch Model"
             body="Create new models and view existing models"
           />
           <BoardCard
             link="metrics"
             title="Metric Functions"
             body="Create new metrics and view existing metrics"
           />
         </div>
       </Fragment>
    );
  }

  function BoardCard(props) {
    return (
      <LinkTag to={`/${props.link}`}>
        <CardField title={`${props.title} Board`}>
          <h5>{props.body}</h5>
        </CardField>
      </LinkTag>
    );
  }