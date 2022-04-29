import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import {
  getProject,
  deleteProject,
  getProjectsDatasets,
  getProjectsProcess,
  getProjectsDatasetStatus,
  getProjectsDatasetResults,
} from "../../../actions/projects";

import { runProcess, getDisplayImage } from "../../../actions/processes";

import {
  statusConverter,
  platformConverter,
  structureConverter,
  modeConverter,
  annotationConverter,
  threadConverter,
  vizConverter,
  isEmpty,
} from "../../common/utils";

import Buttonbar from "./Buttonbar";

import { CardField, ImageCard } from "../../common/CustomField";

export class ProjectDetail extends Component {
  static props = {
    detailedProject: PropTypes.object.isRequired,
    projectsProcess: PropTypes.object.isRequired,

    projectsDatasets: PropTypes.array.isRequired,
    projectsDatasetsResults: PropTypes.array.isRequired,
    displayImages: PropTypes.array.isRequired,

    projectsDatasetStatus: PropTypes.string.isRequired,

    getProject: PropTypes.func.isRequired,
    deleteProject: PropTypes.func.isRequired,
    getProjectsDatasets: PropTypes.func.isRequired,
    getProjectsProcess: PropTypes.func.isRequired,
    getProjectsDatasetResults: PropTypes.func.isRequired,
    runProcess: PropTypes.func.isRequired,
    getDisplayImage: PropTypes.func.isRequired,
    getProjectsDatasetStatus: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      modalShow: false,
      displayImage: false,
      process: {},
      dataset: {},
      btnBar: [],
    };

    this.setDisplayImage = this.setDisplayImage.bind(this);
    this.showBtnBar = this.showBtnBar.bind(this);
    this.sendRunProcess = this.sendRunProcess.bind(this);
    this.sendGetDisplayImage = this.sendGetDisplayImage.bind(this);
  }

  setDisplayImage() {
    this.setState({
      displayImage: !this.state.displayImage,
    });
  }

  showBtnBar(idx) {
    const btnBar = this.state.btnBar.map((status, i) => {
      if (i === idx) {
        return !status;
      } else {
        return status;
      }
    });
    this.setState({
      btnBar: btnBar,
    });
  }

  sendRunProcess(project_id, dataset_id, process_id) {
    const jsonData = {
      project_id: project_id,
      dataset_id: dataset_id,
      process_id: process_id,
    };
    // console.log(jsonData);
    this.props.runProcess(JSON.stringify(jsonData));
  }

  sendGetDisplayImage(project_id, dataset_id, process_id) {
    const jsonData = {
      project_id: project_id,
      dataset_id: dataset_id,
      process_id: process_id,
    };
    // console.log(jsonData);
    this.props.getDisplayImage(JSON.stringify(jsonData));
  }

  componentDidMount() {
    const projectId = parseInt(this.props.match.params.id);
    this.props.getProject(projectId);
    this.props.getProjectsDatasets(projectId);
    this.props.getProjectsProcess(projectId);
    this.props.getProjectsDatasetStatus(projectId);
    this.props.getProjectsDatasetResults(projectId);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.projectsDatasets !== this.props.projectsDatasets) {
      const btnBar = new Array(this.props.projectsDatasets.length).fill(false);
      this.setState({
        btnBar: btnBar,
      });
    }
  }

  render() {
    const project = this.props.detailedProject;
    const process = this.props.projectsProcess;
    const datasets = this.props.projectsDatasets;
    const datasetStatus = this.props.projectsDatasetStatus;
    const images = this.props.displayImages;
    const displayImage = this.state.displayImage;

    // For each image in that tray
    const renderTray = (images) =>
      Object.entries(images).map(([key, value]) => {
        return <ImageCard key={key} name={key} value={value} />;
      });

    // For each tray
    const renderTrays = () =>
      Object.entries(images).map(([key, value]) => {
        return <div key={key}>{renderTray(value)}</div>;
      });

    return (
      <Fragment>
        <CardField title="Project Detail">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{project.id}</td>
                <td>{project.name}</td>
                <td>{project.date}</td>
                <td>{project.location}</td>
                <td>{statusConverter(project.status)}</td>
                <td>
                  <Link to={`/projects/edit/${project.id}`}>
                    <button className="btn btn-primary">Edit</button>
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </CardField>

        <CardField title="Attached Datasets">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Platform</th>
                <th>Mode</th>
                <th>Structure</th>
                <th>Annotation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((dataset, idx) => (
                <Fragment key={dataset.id}>
                  <tr
                    onClick={() => {
                      this.showBtnBar(idx);
                    }}
                  >
                    <td>{dataset.id}</td>
                    <td>{dataset.name}</td>
                    <td>{platformConverter(dataset.platform)}</td>
                    <td>{modeConverter(dataset.mode)}</td>
                    <td>{structureConverter(dataset.structure)}</td>
                    <td>{annotationConverter(dataset.annotation)}</td>
                    <td>{threadConverter(datasetStatus)}</td>
                  </tr>
                  {this.state.btnBar[idx] ? (
                    <Buttonbar
                      idx={idx}
                      mode={dataset.mode}
                      project={project}
                      dataset={dataset}
                      process={process}
                      projectsDatasetsResults={
                        this.props.projectsDatasetsResults
                      }
                      sendRunProcess={this.sendRunProcess}
                      sendGetDisplayImage={this.sendGetDisplayImage}
                      setDisplayImage={this.setDisplayImage}
                    />
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </CardField>

        <CardField title="Attached Process">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Visualization Tech</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {!isEmpty(process) ? (
                <tr>
                  <td>{process.id}</td>
                  <td>{process.name}</td>
                  <td>{process.description}</td>
                  <td>{vizConverter(process.viz_tech)}</td>
                  <td>{statusConverter(process.status)}</td>
                  <td>
                    <Link to={`/processes/edit/${process.id}`}>
                      <button className="btn btn-primary">Edit</button>
                    </Link>
                  </td>
                </tr>
              ) : (
                <tr></tr>
              )}
            </tbody>
          </table>
        </CardField>

        {/* Image Card */}
        <div className="Cards">
          {displayImage ? renderTrays() : <div></div>}
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  detailedProject: state.projects.detailedProject,
  projectsDatasets: state.projects.projectsDatasets,
  projectsProcess: state.projects.projectsProcess,
  projectsDatasetsResults: state.projects.projectsDatasetsResults,
  projectsDatasetStatus: state.projects.projectsDatasetStatus,
  displayImages: state.projects.displayImages,
});

export default connect(mapStateToProps, {
  getProject,
  deleteProject,
  getProjectsDatasets,
  getProjectsProcess,
  getProjectsDatasetResults,
  runProcess,
  getDisplayImage,
  getProjectsDatasetStatus,
})(ProjectDetail);
