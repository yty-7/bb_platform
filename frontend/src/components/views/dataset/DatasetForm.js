import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { addDataset } from "../../../actions/datasets";

import ReactModal from "react-modal";
import { modalStyles } from "../../common/Modal";

import {
  structureDict,
  platformDict,
  modeDict,
  annotationDict,
} from "./common";

import { TextField, CardField, DropdownField } from "../../common/CustomField";

export class DatasetForm extends Component {
  static propTypes = {
    addDataset: PropTypes.func.isRequired,

    formIsUpoading: PropTypes.bool.isRequired,
    uploadPercentage: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {

      name: "",
      description: "",
      platform: platformDict["BlackBird"] || 0,
      mode: modeDict["Training"] || 0,
      structure: structureDict["Default"] || 0,
      annotation: annotationDict["LabelBox"] || 0,
      filepath: "",
      showModal: false,
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
    const {
      name,
      description,
      platform,
      mode,
      structure,
      annotation,
      filepath,
    } = this.state;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("platform", platform);
    formData.append("mode", mode);
    formData.append("structure", structure);
    formData.append("annotation", annotation);
    formData.append("filepath", filepath);
    this.props.addDataset(formData);
    this.setState({
      name: "",
      description: "",
    });
  }

  

  render() {
    const {
      filepath,
      name,
      description,
      platform,
      mode,
      structure,
      annotation,
    } = this.state;

    const uploadPercentage = this.props.uploadPercentage;
    const formIsUpoading = this.props.formIsUpoading;

    return (
      <Fragment>
        <CardField title="Create Dataset">
          <form onSubmit={this.onSubmit}>
            <TextField
              label="Dataset Name"
              type="text"
              id="file"
              name="filepath"
              value={filepath}
              onChange={this.onChange}
            />
            <TextField
              label="Label"
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={this.onChange}
              // autoComplete="please input a unique id"
              // helperText={
              //   "input the unique id"
              // }
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
              label="Mode"
              id="mode"
              name="mode"
              onChange={this.onChange}
              selected={mode}
              items={modeDict}
              itemType="dict"
            />
            <DropdownField
              label="Platform"
              id="platform"
              name="platform"
              onChange={this.onChange}
              selected={platform}
              items={platformDict}
              itemType="dict"
            />
            <DropdownField
              label="Structure"
              id="structure"
              name="structure"
              onChange={this.onChange}
              selected={structure}
              items={structureDict}
              itemType="dict"
            />
            <DropdownField
              label="Annotation"
              id="annotation"
              name="annotation"
              onChange={this.onChange}
              selected={annotation}
              items={annotationDict}
              itemType="dict"
            />
            {/* <div className="form-group">
              <label htmlFor="file">File</label>
              <input
                type="file"
                className="form-control"
                id="file"
                name="filepath"
                onChange={this.fileOnChange}
              />
            </div> */}
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
  uploadPercentage: state.forms.uploadPercentage,
  formIsUpoading: state.forms.formIsUpoading,
});

export default connect(mapStateToProps, { addDataset })(DatasetForm);
