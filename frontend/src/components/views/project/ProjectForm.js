import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { addProject } from "../../../actions/projects";
import { getDatasets } from "../../../actions/datasets";
import { getProcesses } from "../../../actions/processes";

import ReactModal from "react-modal";
import { modalStyles } from "../../common/Modal";

import { DatasetList } from "./common";
import { TextField, CardField, DropdownField } from "../../common/CustomField";

export class ProjectForm extends Component {
  static propTypes = {
    datasets: PropTypes.array.isRequired,
    processes: PropTypes.array.isRequired,
    addProject: PropTypes.func.isRequired,
    getDatasets: PropTypes.func.isRequired,
    getProcesses: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      name: "",
      description: "",
      date: "",
      location: "",
      datasets: [],
      selectedDataset: {},
      selectedDatasets: [],
      processes: [],
      selectedProcess: {},
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleRemoveDataset = this.handleRemoveDataset.bind(this);
    this.handleAddDataset = this.handleAddDataset.bind(this);
  }

  onChange(e) {
    // console.log(JSON.parse(e.target.value));
    var value;
    if (e.target.name === "selectedDataset") {
      value = JSON.parse(e.target.value);
    } else {
      value = e.target.value;
    }
    this.setState({
      [e.target.name]: value,
    });
  }

  handleRemoveDataset(e, dataset) {
    e.preventDefault();
    this.setState((state) => {
      var nextSelectedDatasets;
      if (state.selectedDatasets.includes(dataset)) {
        nextSelectedDatasets = state.selectedDatasets.filter(
          (item) => item.id !== dataset.id
        );
      } else {
        nextSelectedDatasets = [...state.selectedDatasets];
      }

      return {
        selectedDatasets: nextSelectedDatasets,
      };
    });
  }

  handleAddDataset(e) {
    e.preventDefault();
    const dataset = this.state.selectedDataset;
    this.setState((state) => {
      const selectedDatasetsId = state.selectedDatasets.map((item) => {
        return item.id;
      });
      var nextSelectedDatasets;
      if (!selectedDatasetsId.includes(dataset.id)) {
        nextSelectedDatasets = [...state.selectedDatasets, dataset];
      } else {
        nextSelectedDatasets = [...state.selectedDatasets];
      }

      return {
        selectedDatasets: nextSelectedDatasets,
      };
    });
  }

  onSubmit(e) {
    e.preventDefault();
    const {
      name,
      description,
      date,
      location,
      selectedDatasets,
      selectedProcess,
    } = this.state;
    // console.log(this.state);
    const datasets = selectedDatasets.map((dataset) => {
      return dataset.id;
    });
    const jsonData = {
      name: name,
      date: date,
      location: location,
      description: description,
      dataset_ids: datasets,
      process_id: selectedProcess.id,
    };
    // console.log(jsonData);
    this.props.addProject(JSON.stringify(jsonData));
    this.setState({
      name: "",
      description: "",
      location: "",
    });
  }

  componentDidMount() {
    this.props.getDatasets();
    this.props.getProcesses();
  }

  componentDidUpdate(prevProps) {
    // console.log(this.state.datasets);
    // console.log(this.props.datasets);
    if (prevProps.datasets !== this.props.datasets) {
      const selectedDataset = this.props.datasets[0] || {};
      this.setState({
        datasets: this.props.datasets,
        selectedDataset: selectedDataset,
      });
    }

    if (prevProps.processes !== this.props.processes) {
      const selectedProcess = this.props.processes[0] || {};
      this.setState({
        processes: this.props.processes,
        selectedProcess: selectedProcess,
      });
    }
  }

  render() {
    const {
      name,
      description,
      date,
      location,
      datasets,
      selectedDataset,
      selectedDatasets,
      processes,
      selectedProcess,
    } = this.state;

    const uploadPercentage = this.props.uploadPercentage;
    const formIsUpoading = this.props.formIsUpoading;

    return (
      <Fragment>
        <CardField title="Create Project">
          <form onSubmit={this.onSubmit}>
            <TextField
              label="Name"
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={this.onChange}
            />
            <TextField
              label="Description"
              type="text"
              id="description"
              name="description"
              value={description}
              onChange={this.onChange}
            />
            <TextField
              label="Date"
              type="date"
              id="date"
              name="date"
              value={date}
              onChange={this.onChange}
            />
            <TextField
              label="Location"
              type="text"
              id="location"
              name="location"
              value={location}
              onChange={this.onChange}
            />
            <DropdownField
              label="Process"
              id="process"
              name="selectedProcess"
              onChange={this.onChange}
              selected={JSON.stringify(selectedProcess)}
              items={processes}
              itemType="object"
            />
            <DropdownField
              label="Datasets"
              id="dataset"
              name="selectedDataset"
              onChange={this.onChange}
              selected={JSON.stringify(selectedDataset)}
              items={datasets}
              itemType="object"
            >
              <DatasetList
                datasets={selectedDatasets}
                handleRemoveDataset={this.handleRemoveDataset}
              ></DatasetList>
              <button
                className="btn btn-danger"
                onClick={this.handleAddDataset}
                style={{ marginTop: "1em" }}
              >
                Add Dataset
              </button>
            </DropdownField>
            <button type="submit" className="btn btn-primary">
              Create
            </button>
          </form>
        </CardField>
        <div>
          <ReactModal
            isOpen={formIsUpoading}
            style={modalStyles}
            contentLabel="Form Upload Modal"
          >
            <div>File Uploading</div>
            <div className="progress">
              <div
                className="progress-bar progress-bar-striped"
                role="progressbar"
                style={{ width: `${uploadPercentage}%` }}
                aria-valuenow={uploadPercentage}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </ReactModal>
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  datasets: state.datasets.datasets,
  processes: state.processes.processes,
  uploadPercentage: state.forms.uploadPercentage,
  formIsUpoading: state.forms.formIsUpoading,
});

export default connect(mapStateToProps, {
  addProject,
  getDatasets,
  getProcesses,
})(ProjectForm);
