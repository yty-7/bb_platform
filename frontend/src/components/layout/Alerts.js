import React, { Component, Fragment } from "react";
import { withAlert } from "react-alert";
import { connect } from "react-redux";
import PropTypes from "prop-types";

export class Alerts extends Component {
  static propTypes = {
    error: PropTypes.object.isRequired,
    message: PropTypes.object.isRequired,
  };

  componentDidUpdate(prevProps) {
    // console.log(prevProps);
    // console.log(this.props);
    const { error, alert, message } = this.props;
    if (error !== prevProps.error) {
      if (error.msg.name) alert.error(`Name: ${error.msg.name.join()}`);
      // if (error.msg.email) alert.error(`Email: ${error.msg.email.join()}`);

      if (error.msg.message)
        alert.error(`Message: ${error.msg.message.join()}`);
      if (error.msg.non_field_errors)
        alert.error(error.msg.non_field_errors.join());
      if (error.msg.username) alert.error(error.msg.username.join());
      // if (error.msg.detail) alert.error(error.msg.detail);
      if (error.msg.validation) alert.error(error.msg.validation);
    }

    if (message !== prevProps.message) {
      // Project
      if (message.addProject) alert.success(message.addProject);
      if (message.deleteProject) alert.success(message.deleteProject);
      if (message.editProject) alert.success(message.editProject);
      // Dataset
      if (message.addDataset) alert.success(message.addDataset);
      if (message.deleteDataset) alert.success(message.deleteDataset);
      if (message.editDataset) alert.success(message.editDataset);
      // Process
      if (message.addProcess) alert.success(message.addProcess);
      if (message.deleteProcess) alert.success(message.deleteProcess);
      if (message.editProcess) alert.success(message.editProcess);
      if (message.runProcess) alert.success(message.runProcess);
      // PyTorch Model
      if (message.addModel) alert.success(message.addModel);
      if (message.deleteModel) alert.success(message.deleteModel);
      if (message.editModel) alert.success(message.editModel);
      if (message.passwordNotMatch) alert.error(message.passwordNotMatch);
      // Metric
      if (message.addMetric) alert.success(message.addMetric);
      if (message.deleteMetric) alert.success(message.deleteMetric);
      if (message.editMetric) alert.success(message.editMetric);
    }
  }

  render() {
    return <Fragment />;
  }
}

const mapStateToProps = (state) => ({
  error: state.errors,
  message: state.messages,
});

export default connect(mapStateToProps)(withAlert()(Alerts));
