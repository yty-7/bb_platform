import React, { Fragment } from "react";
import MetricForm from "./MetricForm";
import MetricList from "./MetricList";

export default function Modelboard() {
  return (
    <Fragment>
      <div className="Modelboard">
        {/* <MetricForm /> */}
        <MetricList />
        <MetricForm />
      </div>
    </Fragment>
  );
}
