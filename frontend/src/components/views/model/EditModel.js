import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getModel, editModel } from "../../../actions/models";

import ReactModal from "react-modal";
import { modalStyles } from "../../common/Modal";

import { getFilename } from "../../common/utils";

import { modelTypeDict, ButtonWithAmin } from "./common";
import { TextField, CardField, DropdownField } from "../../common/CustomField";

export class ModelForm extends Component {
  static propTypes = {
    detailedModel: PropTypes.object.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    editModel: PropTypes.func.isRequired,
    getModel: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      id: "",
      name: "",
      description: "",
      type: modelTypeDict["SqueezeNet"] || 0,
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
    formData.append("model_type", type);
    if (newFile !== "") {
      formData.append("filepath", newFile);
    }
    // console.log(this.state);
    this.props.editModel(id, formData);
    this.props.history.goBack();
  }

  componentDidMount() {
    const ModelId = parseInt(this.props.match.params.id);
    this.props.getModel(ModelId);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.detailedModel !== this.props.detailedModel) {
      this.setState(this.props.detailedModel);
      this.setState({
        type: this.props.detailedModel["model_type"],
      });
    }
  }

  render() {
    const { name, description, type, filepath } = this.state;

    const uploadPercentage = this.props.uploadPercentage;
    const formIsUpoading = this.props.formIsUpoading;

    return (
      <Fragment>
        <CardField title="Edit Model">
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
              label="Model Type"
              id="type`"
              name="type"
              onChange={this.onChange}
              selected={type}
              items={modelTypeDict}
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
  detailedModel: state.models.detailedModel,
  isAdmin: state.auth.isAdmin,
  uploadPercentage: state.forms.uploadPercentage,
  formIsUpoading: state.forms.formIsUpoading,
});

export default connect(mapStateToProps, { editModel, getModel })(ModelForm);
