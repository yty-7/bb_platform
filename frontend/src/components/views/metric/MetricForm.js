import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { addMetric } from "../../../actions/metrics";

import ReactModal from "react-modal";
import { modalStyles } from "../../common/Modal";

import { metricTypeDict } from "./common";
import { ButtonWithAmin } from "../model/common";

import { TextField, CardField, DropdownField } from "../../common/CustomField";

export class MetricForm extends Component {
  static propTypes = {
    addMetric: PropTypes.func.isRequired,
    isAdmin: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      name: "",
      description: "",
      type: metricTypeDict["Patch"] || 0,
      filepath: "",
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
    const { name, description, type, filepath } = this.state;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("metric_func", type);
    formData.append("filepath", filepath);
    this.props.addMetric(formData);
    this.setState({
      name: "",
      description: "",
      type: "",
    });
  }

  render() {
    const { name, description, type } = this.state;

    const uploadPercentage = this.props.uploadPercentage;
    const formIsUpoading = this.props.formIsUpoading;

    return (
      <Fragment>
        <CardField title="Create Metric">
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
              label="Metrc Type"
              id="type"
              name="type"
              onChange={this.onChange}
              selected={type}
              items={metricTypeDict}
              itemType="dict"
            />
            <div className="form-group">
              <label htmlFor="file">File</label>
              <input
                type="file"
                className="form-control"
                id="file"
                name="filepath"
                onChange={this.fileOnChange}
              />
            </div>
            <ButtonWithAmin
              type="submit"
              isAdmin={this.props.isAdmin}
              className="btn btn-primary"
              text="Create"
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
  isAdmin: state.auth.isAdmin,
  uploadPercentage: state.forms.uploadPercentage,
  formIsUpoading: state.forms.formIsUpoading,
});

export default connect(mapStateToProps, { addMetric })(MetricForm);
