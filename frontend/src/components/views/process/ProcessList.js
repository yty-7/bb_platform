import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { getProcesses, deleteProcess } from "../../../actions/processes";

import { statusConverter, vizConverter } from "../../common/utils";

import { Paginator } from "../../common/Paginator";
import { CardField } from "../../common/CustomField";

export class ProcessList extends Component {
  static propTypes = {
    processes: PropTypes.array.isRequired,
    processesCount: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    getProcesses: PropTypes.func.isRequired,
    deleteProcess: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      modalShow: false,
      process: {},
      currentPage: 1,
      totalPages: -1,
    };

    this.setModalShow = this.setModalShow.bind(this);
    this.setProcess = this.setProcess.bind(this);
    this.setPage = this.setPage.bind(this);
    this.setPrevNextPage = this.setPrevNextPage.bind(this);
  }

  setModalShow(show) {
    this.setState({
      modalShow: show,
    });
  }

  setProcess(process) {
    this.setState({
      process: process,
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
    this.props.getProcesses(currentPage);
  }

  componentDidUpdate(prevProps, prevState) {
    const currentPage = this.state.currentPage;
    if (prevState.currentPage !== currentPage) {
      this.props.getProcesses(currentPage);
    }

    if (prevProps.processesCount !== this.props.processesCount) {
      const totalPages =
        Math.ceil(this.props.processesCount / this.props.pageSize) || 1;
      this.setState({
        totalPages: totalPages,
      });
    }
  }

  render() {
    const { totalPages } = this.state;

    return (
      <Fragment>
        <CardField title="Processes">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Visualization Tech</th>
                <th>Status</th>
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {this.props.processes.map((process) => (
                <Fragment key={process.id}>
                  <tr>
                    <td>{process.id}</td>
                    <td>{process.name}</td>
                    <td>{process.description}</td>
                    <td>{vizConverter(process.viz_tech)}</td>
                    <td>{statusConverter(process.status)}</td>
                    <td>
                      <Link to={`/processes/edit/${process.id}`}>
                        <button className="btn btn-primary">Edit</button>
                      </Link>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          this.props.deleteProcess(process.id);
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
  processes: state.processes.processes,
  processesCount: state.processes.processesCount,
  pageSize: state.processes.pageSize,
});

export default connect(mapStateToProps, {
  getProcesses,
  deleteProcess,
})(ProcessList);
