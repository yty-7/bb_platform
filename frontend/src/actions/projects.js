import API from "./api";
import { createMessage, returnErrors } from "./messages";
import { tokenConfig, tokenConfigWithFile } from "./auth";
import {
  GET_PROJECTS,
  GET_PROJECT,
  DELETE_PROJECT,
  ADD_PROJECT,
  EDIT_PROJECT,
  GET_PROJECTSDATASET,
  GET_PROJECTSPROCESS,
  GET_PROJECTSDATASETSTATUS,
  GET_PROJECTSDATASETSRESULTS,
  FORM_UPLOADED,
  FORM_UPLOADFAIL,
} from "./types";

// GET PROJECTS
export const getProjects = (page) => (dispatch, getState) => {
  API.get(`/api/projects/?page=${page}`, tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: GET_PROJECTS,
        payload: res.data,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// GET A SINGLE PROJECTS
export const getProject = (id) => (dispatch, getState) => {
  API.get(`/api/projects/${id}`, tokenConfig(getState))
    .then((res) => {
      // console.log(res);
      dispatch({
        type: GET_PROJECT,
        payload: res.data,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// DELETE PROJECT
export const deleteProject = (id) => (dispatch, getState) => {
  console.log(id);
  API.delete(`/api/projects/${id}/`, tokenConfig(getState))
    .then((res) => {
      dispatch(createMessage({ deleteProject: "Project Deleted" }));
      dispatch({
        type: DELETE_PROJECT,
        payload: id,
      });
    })
    .catch((err) => console.log(err));
};

// ADD PROJECT
export const addProject = (project) => (dispatch, getState) => {
  API.post("/api/projects/", project, tokenConfigWithFile(dispatch, getState))
    .then((res) => {
      dispatch(createMessage({ addProject: "Project Added" }));
      dispatch({
        type: ADD_PROJECT,
        payload: res.data,
      });
      dispatch({
        type: FORM_UPLOADED,
      });
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
      dispatch({
        type: FORM_UPLOADFAIL,
      });
    });
};

// EDIT PROJECT
export const editProject = (id, project) => (dispatch, getState) => {
  API.put(
    `/api/projects/${id}/`,
    project,
    tokenConfigWithFile(dispatch, getState)
  )
    .then((res) => {
      dispatch(createMessage({ editProject: "Project Edited" }));
      dispatch({
        type: EDIT_PROJECT,
        payload: res.data,
      });
      dispatch({
        type: FORM_UPLOADED,
      });
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
      dispatch({
        type: FORM_UPLOADFAIL,
      });
    });
};

// GET DATASETS CORRESPONDING TO THE CURRENT PROJECT
export const getProjectsDatasets = (id) => (dispatch, getState) => {
  API.get(`api/datasets/project-${id}/list_datasets/`, tokenConfig(getState))
    .then((res) => {
      dispatch(
        createMessage({ getProjectsDatasets: "Get Projects' Datasets" })
      );
      dispatch({
        type: GET_PROJECTSDATASET,
        payload: res.data.results,
      });
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
    });
};

// GET DATASETS STATUS CORRESPONDING TO THE CURRENT PROJECT
export const getProjectsDatasetStatus = (id) => (dispatch, getState) => {
  API.get(`api/datasets/project-${id}/query_status/`, tokenConfig(getState))
    .then((res) => {
      dispatch(
        createMessage({
          getProjectsDatasetStatus: "Get Projects' Dataset's status",
        })
      );
      dispatch({
        type: GET_PROJECTSDATASETSTATUS,
        payload: res.data.status,
      });
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
    });
};

// GET PROCESSES CORRESPONDING TO THE CURRENT PROJECT
export const getProjectsProcess = (id) => (dispatch, getState) => {
  API.get(`api/processes/project-${id}/list_process/`, tokenConfig(getState))
    .then((res) => {
      dispatch(createMessage({ getProjectsProcess: "Get Projects' Process" }));
      dispatch({
        type: GET_PROJECTSPROCESS,
        payload: res.data,
      });
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
    });
};

// GET DATASETS' RESULTS CORRESPONDING TO THE CURRENT PROJECT
export const getProjectsDatasetResults = (id) => (dispatch, getState) => {
  API.get(`api/project-${id}/project_dataset_inter/`, tokenConfig(getState))
    .then((res) => {
      dispatch(
        createMessage({ getProjectsDatasetResults: "Get Datasets' Results" })
      );
      dispatch({
        type: GET_PROJECTSDATASETSRESULTS,
        payload: res.data,
      });
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
    });
};
