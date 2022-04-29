import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getProjects, deleteProject } from "../../../actions/projects";

import { statusConverter } from "../../common/utils";

import { Paginator } from "../../common/Paginator";
import { CardField } from "../../common/CustomField";

export class ProjectList extends Component {
  static propTypes = {
    projects: PropTypes.array.isRequired,
    projectsCount: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    getProjects: PropTypes.func.isRequired,
    deleteProject: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      totalPages: -1,
    };

    this.setPage = this.setPage.bind(this);
    this.setPrevNextPage = this.setPrevNextPage.bind(this);
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
    this.props.getProjects(currentPage);
  }

  componentDidUpdate(prevProps, prevState) {
    const currentPage = this.state.currentPage;
    if (prevState.currentPage !== currentPage) {
      this.props.getProjects(currentPage);
    }

    if (prevProps.projectsCount !== this.props.projectsCount) {
      const totalPages =
        Math.ceil(this.props.projectsCount / this.props.pageSize) || 1;

      this.setState({
        totalPages: totalPages,
      });
    }
  }

  render() {
    const { totalPages } = this.state;

    return (
      <Fragment>
        <CardField title="Projects">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Date</th>
                <th>Location</th>
                <th>Description</th>
                <th>Status</th>
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {this.props.projects.map((project) => (
                <Fragment key={project.id}>
                  <tr>
                    <td>{project.id}</td>
                    <td>{project.name}</td>
                    <td>{project.date}</td>
                    <td>{project.location}</td>
                    <td>{project.description}</td>
                    <td>{statusConverter(project.status)}</td>
                    <td>
                      <Link to={`/projects/${project.id}`}>
                        <button className="btn btn-primary">View</button>
                      </Link>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          this.props.deleteProject(project.id);
                        }}
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
  // state.projects(the projects reducer).projects(var defined in the state)
  projects: state.projects.projects,
  projectsCount: state.projects.projectsCount,
  pageSize: state.projects.pageSize,
});

export default connect(mapStateToProps, {
  getProjects,
  deleteProject,
})(ProjectList);
