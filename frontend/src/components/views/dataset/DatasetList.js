import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getDatasets, deleteDataset } from "../../../actions/datasets";

import {
  statusConverter,
  platformConverter,
  structureConverter,
  modeConverter,
  annotationConverter,
} from "../../common/utils";

import { Paginator } from "../../common/Paginator";
import { CardField } from "../../common/CustomField";

export class DatasetList extends Component {
  static propTypes = {
    datasets: PropTypes.array.isRequired,
    datasetsCount: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    getDatasets: PropTypes.func.isRequired,
    deleteDataset: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      modalShow: false,
      dataset: {},
      currentPage: 1,
      totalPages: -1,
    };

    this.setModalShow = this.setModalShow.bind(this);
    this.setDataset = this.setDataset.bind(this);
    this.setPage = this.setPage.bind(this);
    this.setPrevNextPage = this.setPrevNextPage.bind(this);
  }

  setModalShow(show) {
    this.setState({
      modalShow: show,
    });
  }

  setDataset(dataset) {
    this.setState({
      dataset: dataset,
    });
  }

  setPage(e) {
    this.setState({
      currentPage: Number(e.target.id),
    });
  }

  setPrevNextPage(e) {
    const { currentPage, totalPages } = this.state;
    var delta = 0;
    if (e.target.id === "prev" && currentPage !== 1) {
      delta = -1;
    } else if (e.target.id === "next" && currentPage !== totalPages) {
      delta = 1;
    }
    this.setState({
      currentPage: currentPage + delta,
    });
  }

  componentDidMount() {
    const currentPage = this.state.currentPage;
    this.props.getDatasets(currentPage);
  }

  componentDidUpdate(prevProps, prevState) {
    const currentPage = this.state.currentPage;
    if (prevState.currentPage !== currentPage) {
      this.props.getDatasets(currentPage);
    }
    if (prevProps.datasetsCount !== this.props.datasetsCount) {
      const totalPages =
        Math.ceil(this.props.datasetsCount / this.props.pageSize) || 1;

      this.setState({
        totalPages: totalPages,
      });
    }
  }

  render() {
    const { totalPages } = this.state;

    return (
      <Fragment>
        <CardField title="Datasets">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Platform</th>
                <th>Mode</th>
                <th>Structure</th>
                <th>Annotation</th>
                <th>Status</th>
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {this.props.datasets.map((dataset) => (
                <Fragment key={dataset.id}>
                  <tr>
                    <td>{dataset.id}</td>
                    <td>{dataset.name}</td>
                    <td>{platformConverter(dataset.platform)}</td>
                    <td>{modeConverter(dataset.mode)}</td>
                    <td>{structureConverter(dataset.structure)}</td>
                    <td>{annotationConverter(dataset.annotation)}</td>
                    <td>{statusConverter(dataset.status)}</td>
                    <td>
                      <Link to={`/datasets/edit/${dataset.id}`}>
                        <button className="btn btn-primary">Edit</button>
                      </Link>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          this.props.deleteDataset(dataset.id);
                        }}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
          <Paginator
            totalPages={totalPages}
            setPage={this.setPage}
            setPrevNextPage={this.setPrevNextPage}
          />
        </CardField>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  datasets: state.datasets.datasets,
  datasetsCount: state.datasets.datasetsCount,
  pageSize: state.datasets.pageSize,
});

export default connect(mapStateToProps, {
  getDatasets,
  deleteDataset,
})(DatasetList);
