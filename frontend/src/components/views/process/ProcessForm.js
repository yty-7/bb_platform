import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { addProcess } from "../../../actions/processes";
import { getModels } from "../../../actions/models";
import { getMetrics } from "../../../actions/metrics";

import ReactModal from "react-modal";
import { modalStyles } from "../../common/Modal";

import { vizTechDict, MetricList } from "./common";
import {
  TextField,
  CardField,
  DropdownField,
  CheckboxField,
} from "../../common/CustomField";

export class ProcessForm extends Component {
  static propTypes = {
    models: PropTypes.array.isRequired,
    metrics: PropTypes.array.isRequired,
    addProcess: PropTypes.func.isRequired,
    getModels: PropTypes.func.isRequired,
    getMetrics: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      name: "",
      description: "",
      viz: [],
      vizCheck: new Array(Object.keys(vizTechDict).length).fill(false),
      models: [],
      selectedModel: {},
      metrics: [],
      selectedMetric: {},
      selectedMetrics: [],
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.checkboxOnChange = this.checkboxOnChange.bind(this);
    this.handleRemoveMetric = this.handleRemoveMetric.bind(this);
    this.handleAddMetric = this.handleAddMetric.bind(this);
  }

  onChange(e) {
    var value;
    if (
      e.target.name === "selectedModel" ||
      e.target.name === "selectedMetric"
    ) {
      value = JSON.parse(e.target.value);
    } else {
      value = e.target.value;
    }
    this.setState({
      [e.target.name]: value,
    });
  }

  handleRemoveMetric(e, metric) {
    e.preventDefault();
    this.setState((state) => {
      var nextSelectedMetrics;
      if (state.selectedMetrics.includes(metric)) {
        nextSelectedMetrics = state.selectedMetrics.filter(
          (item) => item.id !== metric.id
        );
      } else {
        nextSelectedMetrics = [...state.selectedMetrics];
      }

      return {
        selectedMetrics: nextSelectedMetrics,
      };
    });
  }

  handleAddMetric(e) {
    e.preventDefault();
    const metric = this.state.selectedMetric;
    this.setState((state) => {
      const selectedMetricsId = state.selectedMetrics.map((item) => {
        return item.id;
      });
      var nextSelectedMetrics;
      if (!selectedMetricsId.includes(metric.id)) {
        nextSelectedMetrics = [...state.selectedMetrics, metric];
      } else {
        nextSelectedMetrics = [...state.selectedMetrics];
      }

      return {
        selectedMetrics: nextSelectedMetrics,
      };
    });
  }

  checkboxOnChange(e) {
    const value = parseInt(e.target.value);
    const idx = parseInt(e.target.id);
    this.setState((state) => {
      var nextState;
      if (state.viz.includes(value)) {
        nextState = state.viz.filter((item) => item !== value);
      } else {
        nextState = [...state.viz, value];
      }

      const nextCheck = state.vizCheck.map((item, i) => {
        if (i === idx) {
          return !item;
        } else {
          return item;
        }
      });

      return {
        ...state,
        viz: nextState,
        vizCheck: nextCheck,
      };
    });
  }

  onSubmit(e) {
    e.preventDefault();
    const {
      name,
      description,
      viz,
      selectedModel,
      selectedMetrics,
    } = this.state;

    const metrics = selectedMetrics.map((metric) => {
      return metric.id;
    });

    const jsonData = {
      name: name,
      description: description,
      viz_tech: JSON.stringify(viz),
      pytorch_model_id: selectedModel.id,
      metric_func_ids: metrics,
    };
    this.props.addProcess(JSON.stringify(jsonData));
    // console.log(this.state);
    this.setState({
      name: "",
      description: "",
    });
  }

  componentDidMount() {
    this.props.getModels();
    this.props.getMetrics();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.metrics !== this.props.metrics) {
      const selectedMetric = this.props.metrics[0] || {};
      this.setState({
        metrics: this.props.metrics,
        selectedMetric: selectedMetric,
      });
    }

    if (prevProps.models !== this.props.models) {
      const selectedModel = this.props.models[0] || {};
      this.setState({
        models: this.props.models,
        selectedModel: selectedModel,
      });
    }
  }

  render() {
    const {
      name,
      description,
      vizCheck,
      models,
      selectedModel,
      metrics,
      selectedMetric,
      selectedMetrics,
    } = this.state;

    const uploadPercentage = this.props.uploadPercentage;
    const formIsUpoading = this.props.formIsUpoading;

    return (
      <Fragment>
        <CardField title="Create Process">
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
            <CheckboxField
              label="Visualization Tech"
              name="viz"
              dict={vizTechDict}
              checkboxOnChange={this.checkboxOnChange}
              checked={vizCheck}
            />

            <DropdownField
              label="PyTorch Model"
              id="model"
              name="selectedModel"
              onChange={this.onChange}
              selected={JSON.stringify(selectedModel)}
              items={models}
              itemType="object"
            />
            <DropdownField
              label="Metrics"
              id="metric"
              name="selectedMetric"
              onChange={this.onChange}
              selected={JSON.stringify(selectedMetric)}
              items={metrics}
              itemType="object"
            >
              <MetricList
                metrics={selectedMetrics}
                handleRemoveMetric={this.handleRemoveMetric}
              ></MetricList>
              <button
                className="btn btn-danger"
                onClick={this.handleAddMetric}
                style={{ marginTop: "1em" }}
              >
                Add Metric
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
  models: state.models.models,
  metrics: state.metrics.metrics,
  uploadPercentage: state.forms.uploadPercentage,
  formIsUpoading: state.forms.formIsUpoading,
});

export default connect(mapStateToProps, { addProcess, getModels, getMetrics })(
  ProcessForm
);
