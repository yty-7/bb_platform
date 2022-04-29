import React, { Fragment } from "react";
import ProcessForm from "./ProcessForm";
import ProcessList from "./ProcessList";

export default function Processboard() {
  return (
    <Fragment>
      <div className="Processboard">
        <ProcessForm />
        <ProcessList />
      </div>
    </Fragment>
  );
}
