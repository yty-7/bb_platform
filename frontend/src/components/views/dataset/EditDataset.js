import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getDataset, editDataset } from "../../../actions/datasets";

import { getFilename } from "../../common/utils";

import ReactModal from "react-modal";
import { modalStyles } from "../../common/Modal";

import {
  structureDict,
  platformDict,
  modeDict,
  annotationDict,
} from "./common";

import { TextField, CardField, DropdownField } from "../../common/CustomField";

export class EditDataset extends Component {
  static props = {
    detailedDataset: PropTypes.object.isRequired,
    getDataset: PropTypes.func.isRequired,
    deleteDataset: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      id: "",
      name: "",
      description: "",
      platform: platformDict["BlackBird"] || 0,
      mode: modeDict["Training"] || 0,
      structure: structureDict["Default"] || 0,
      annotation: annotationDict["LabelBox"] || 0,
      filepath: "",
      newFile: "",
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.fileOnChange = this.fileOnChange.bind(this);
  }

  componentDidMount() {
    const datasetId = parseInt(this.props.match.params.id);
    this.props.getDataset(datasetId);
  }

  componentDidUpdate(prevProps) {
    // console.log(isEmpty(prevProps.detailedDataset));
    if (prevProps.detailedDataset !== this.props.detailedDataset) {
      this.setState(this.props.detailedDataset);
      // Mode from database is a string ("[0, 1]")
      // Parse to an array first
      const mode = JSON.parse(this.props.detailedDataset["mode"]);

      this.setState({
        // Filter out empty elements
        mode: mode,
      });
    }
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
      id,
      name,
      description,
      platform,
      mode,
      structure,
      annotation,
      newFile,
    } = this.state;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("platform", platform);
    formData.append("mode", JSON.stringify(mode));
    formData.append("structure", structure);
    formData.append("annotation", annotation);
    if (newFile !== "") {
      formData.append("filepath", newFile);
    }
    // console.log(this.state);
    this.props.editDataset(id, formData);
    this.props.history.goBack();
  }

  render() {
    const {
      name,
      description,
      platform,
      mode,
      structure,
      annotation,
      filepath,
    } = this.state;

    const uploadPercentage = this.props.uploadPercentage;
    const formIsUpoading = this.props.formIsUpoading;

    return (
      <Fragment>
        <CardField title="Edit Dataset">
          <form onSubmit={this.onSubmit}>
            <TextField
              label="Label"
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
            <div className="alert alert-danger" role="alert">
              Current File: <strong>{getFilename(filepath)}</strong>
            </div>
            <button type="submit" className="btn btn-primary">
              Save
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
  detailedDataset: state.datasets.detailedDataset,
  uploadPercentage: state.forms.uploadPercentage,
  formIsUpoading: state.forms.formIsUpoading,
});

export default connect(mapStateToProps, {
  getDataset,
  editDataset,
})(EditDataset);
