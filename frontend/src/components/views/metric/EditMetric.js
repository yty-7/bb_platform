import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getMetric, editMetric } from "../../../actions/metrics";

import ReactModal from "react-modal";
import { modalStyles } from "../../common/Modal";

import { getFilename } from "../../common/utils";

import { metricTypeDict } from "./common";
import { ButtonWithAmin } from "../model/common";
import { TextField, CardField, DropdownField } from "../../common/CustomField";

export class MetricForm extends Component {
  static propTypes = {
    detailedMetric: PropTypes.object.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    editMetric: PropTypes.func.isRequired,
    getMetric: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      id: "",
      name: "",
      description: "",
      type: metricTypeDict["Patch"] || 0,
      filepath: "",
      newFile: "",
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.fileOnChange = this.fileOnChange.bind(this);
  }

  onChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  fileOnChange(e) {
    this.setState({
      [e.target.name]: e.target.files[0],
    });
  }

  onSubmit(e) {
    e.preventDefault();
    const { id, name, description, type, newFile } = this.state;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("metric_func", type);
    if (newFile !== "") {
      formData.append("filepath", newFile);
    }
    // console.log(this.state);
    this.props.editMetric(id, formData);
    this.props.history.goBack();
  }

  componentDidMount() {
    const MetricId = parseInt(this.props.match.params.id);
    this.props.getMetric(MetricId);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.detailedMetric !== this.props.detailedMetric) {
      this.setState(this.props.detailedMetric);
      this.setState({
        type: this.props.detailedMetric["metric_func"],
      });
    }
  }

  render() {
    const { name, description, type, filepath } = this.state;

    const uploadPercentage = this.props.uploadPercentage;
    const formIsUpoading = this.props.formIsUpoading;

    return (
      <Fragment>
        <CardField title="Edit Metric">
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
            <DropdownField
              label="Metric Type"
              id="type`"
              name="type"
              onChange={this.onChange}
              selected={type}
              items={metricTypeDict}
              itemType="dict"
            />
            <div className="alert alert-danger" role="alert">
              Current File: <strong>{getFilename(filepath)}</strong>
            </div>
            <div className="form-group">
              <label htmlFor="file">File</label>
              <input
                type="file"
                className="form-control"
                id="file"
                name="newFile"
                onChange={this.fileOnChange}
              />
            </div>
            <ButtonWithAmin
              type="submit"
              isAdmin={this.props.isAdmin}
              className="btn btn-primary"
              text="Save"
            />
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
  detailedMetric: state.metrics.detailedMetric,
  isAdmin: state.auth.isAdmin,
  uploadPercentage: state.forms.uploadPercentage,
  formIsUpoading: state.forms.formIsUpoading,
});

export default connect(mapStateToProps, { editMetric, getMetric })(MetricForm);
