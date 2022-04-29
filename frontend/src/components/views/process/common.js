import React, { Fragment } from "react";

import { getFilename } from "../../common/utils";

// Process basic data structure
export const vizTechDict = {
  GradCam: 0,
  Gradient: 1
};

// Process form CSS
export const FormStyle = {
  Card: {
    width: "100%",
    margin: "auto",
    marginTop: "2em",
    marginBottom: "2em",
  },
  Title: {
    marginTop: "1em",
    marginLeft: "1em",
  },
  Checkbox: {
    marginRight: "1em",
  },
};

// Render metric list
export function MetricList(props) {
  const metrics = props.metrics;
  // console.log(metrics);
  const listItems = metrics.map((metric, idx) => (
    <Fragment key={idx}>
      <tr>
        <td>{metric.id}</td>
        <td>{metric.name}</td>
        <td>{getFilename(metric.filepath)}</td>
        <td>
          <button
            className="btn btn-danger"
            onClick={(e) => {
              props.handleRemoveMetric(e, metric);
            }}
          >
            Delete
          </button>
        </td>
      </tr>
    </Fragment>
  ));
  return (
    <Fragment>
      <table style={MetricTableStyle}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>File</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{listItems}</tbody>
      </table>
    </Fragment>
  );
}

const MetricTableStyle = {
  width: "50%",
  margin: "auto",
  marginTop: "1em",
};
