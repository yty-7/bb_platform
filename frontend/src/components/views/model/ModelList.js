import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getModels, deleteModel } from "../../../actions/models";

import { ButtonWithAmin } from "./common";
import { modelTypeConverter, getFilename } from "../../common/utils";
import { CardField } from "../../common/CustomField";

export class ModelList extends Component {
  static propTypes = {
    models: PropTypes.array.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    getModels: PropTypes.func.isRequired,
    deleteModel: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.getModels();
  }

  render() {
    return (
      <CardField title="Models">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Model Type</th>
              <th>File</th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {this.props.models.map((model) => (
              <Fragment key={model.id}>
                <tr>
                  <td>{model.id}</td>
                  <td>{model.name}</td>
                  <td>{model.description}</td>
                  <td>{modelTypeConverter(model.model_type)}</td>
                  <td>{getFilename(model.filepath)}</td>
                  <td>
                    <Link to={`/models/edit/${model.id}`}>
                      <ButtonWithAmin
                        isAdmin={this.props.isAdmin}
                        className="btn btn-success"
                        text="Edit"
                      />
                    </Link>
                  </td>
                  <td>
                    <ButtonWithAmin
                      isAdmin={this.props.isAdmin}
                      onClick={() => {
                        this.props.deleteModel(model.id);
                      }}
                      className="btn btn-danger"
                      text="Delete"
                    />
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </CardField>
    );
  }
}

const mapStateToProps = (state) => ({
  models: state.models.models,
  isAdmin: state.auth.isAdmin,
});

export default connect(mapStateToProps, {
  getModels,
  deleteModel,
})(ModelList);
