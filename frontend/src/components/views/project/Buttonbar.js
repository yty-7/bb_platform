import React from "react";

import { modeConverter } from "../../common/utils";

export default function ButtonBar(props) {
  const projectId = props.project.id;
  const datasetId = props.dataset.id;
  const processId = props.process.id;

  const idx = props.idx;
  const mode = props.mode;
  const projectsDatasetsResults = props.projectsDatasetsResults;

  const baseURL = process.env.REACT_APP_BASE_URL;

  return (
    <tr>
      <td>
        {/* Run Button */}
        <button
          onClick={() => {
            props.sendRunProcess(projectId, datasetId, processId);
          }}
          className="btn btn-danger"
        >
          Run
        </button>
      </td>
      <td>
        <button
          className="btn btn-success"
          onClick={() => {
            props.sendGetDisplayImage(projectId, datasetId, processId);
            props.setDisplayImage();
          }}
          // If dataset mode is inference and dataset status is done
          {...(projectsDatasetsResults[idx] &&
          modeConverter(mode) === "Inference" &&
          projectsDatasetsResults[idx].status === "D"
            ? null
            : { disabled: true })}
        >
          Display
        </button>
      </td>
      <td
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <a
          href={
            projectsDatasetsResults[idx]
              ? baseURL + projectsDatasetsResults[idx].image_output_zip_path
              : null
          }
          download
        >
          <button
            className="btn btn-secondary"
            {...(projectsDatasetsResults[idx] &&
            projectsDatasetsResults[idx].status === "D"
              ? null
              : { disabled: true })}
          >
            Images
          </button>
        </a>
        <a
          href={
            projectsDatasetsResults[idx]
              ? baseURL + projectsDatasetsResults[idx].csv_output_zip_path
              : null
          }
          download
        >
          <button
            className="btn btn-secondary"
            {...(projectsDatasetsResults[idx] &&
            modeConverter(mode) === "Inference" &&
            projectsDatasetsResults[idx].status === "D"
              ? null
              : { disabled: true })}
          >
            Files
          </button>
        </a>
      </td>
    </tr>
  );
}
