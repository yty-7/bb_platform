import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getMetrics, deleteMetric } from "../../../actions/metrics";

import { ButtonWithAmin } from "../model/common";
import { metricTypeConverter, getFilename } from "../../common/utils";
import { CardField } from "../../common/CustomField";

export class MetricList extends Component {
  static propTypes = {
    metrics: PropTypes.array.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    getMetrics: PropTypes.func.isRequired,
    deleteMetric: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.getMetrics();
  }

  render() {
    return (
      <CardField title="Metrics">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Metric Type</th>
              <th>File</th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {this.props.metrics.map((metric) => (
              <Fragment key={metric.id}>
                <tr>
                  <td>{metric.id}</td>
                  <td>{metric.name}</td>
                  <td>{metric.description}</td>
                  <td>{metricTypeConverter(metric.metric_func)}</td>
                  <td>{getFilename(metric.filepath)}</td>
                  <td>
                    <Link to={`/metrics/edit/${metric.id}`}>
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
                        this.props.deleteMetric(metric.id);
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
  metrics: state.metrics.metrics,
  isAdmin: state.auth.isAdmin,
});

export default connect(mapStateToProps, {
  getMetrics,
  deleteMetric,
})(MetricList);
