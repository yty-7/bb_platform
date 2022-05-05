import React, { Fragment } from "react";
import ProjectForm from "./ProjectForm";
import ProjectList from "./ProjectList";

export default function Projectboard() {
  return (
    <Fragment>
      <div className="Projectboard">
        {/* <ProjectForm /> */}
        <ProjectList />
        <ProjectForm />
      </div>
    </Fragment>
  );
}
