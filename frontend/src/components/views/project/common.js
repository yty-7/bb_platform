import React, { Fragment } from "react";

import { getFilename } from "../../common/utils";

// Render datset list
export function DatasetList(props) {
  const datasets = props.datasets;
  // console.log(datasets);
  const listItems = datasets.map((dataset, idx) => (
    <Fragment key={idx}>
      <tr>
        <td>{dataset.id}</td>
        <td>{dataset.name}</td>
        <td>{getFilename(dataset.filepath)}</td>
        <td>
          <button
            className="btn btn-danger"
            onClick={(e) => {
              props.handleRemoveDataset(e, dataset);
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
      <table style={DatasetTableStyle}>
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

const DatasetTableStyle = {
  width: "50%",
  margin: "auto",
  marginTop: "1em",
};
