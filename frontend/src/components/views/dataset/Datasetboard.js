import React, { Fragment } from "react";
import DatasetForm from "./DatasetForm";
import DatasetList from "./DatasetList";

export default function Datasetboard() {
  return (
    <Fragment>
      <div className="Datasetboard">
        <DatasetForm />
        <DatasetList />
      </div>
    </Fragment>
  );
}
