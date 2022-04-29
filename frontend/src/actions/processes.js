import API from "./api";
import { createMessage, returnErrors } from "./messages";
import { tokenConfig, tokenConfigWithFile } from "./auth";
import {
  GET_PROCESSES,
  GET_PROCESS,
  DELETE_PROCESS,
  ADD_PROCESS,
  EDIT_PROCESS,
  GET_PROCESSMODELS,
  GET_DISPLAYIMAGES,
  GET_PROCESSMETRICS,
  FORM_UPLOADED,
  FORM_UPLOADFAIL,
} from "../actions/types.js";

// GET PROCESSES
export const getProcesses = (page) => (dispatch, getState) => {
  let url = "";
  if (page === undefined) {
    url = "/api/processes/";
  } else {
    url = `/api/processes/?page=${page}`;
  }

  API.get(url, tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: GET_PROCESSES,
        payload: res.data,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// GET A SINGLE PROCESSES
export const getProcess = (id) => (dispatch, getState) => {
  API.get(`/api/processes/${id}`, tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: GET_PROCESS,
        payload: res.data,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// DELETE PROCESS
export const deleteProcess = (id) => (dispatch, getState) => {
  API.delete(`/api/processes/${id}/`, tokenConfig(getState))
    .then((res) => {
      dispatch(createMessage({ deleteProcess: "Process Deleted" }));
      dispatch({
        type: DELETE_PROCESS,
        payload: id,
      });
    })
    .catch((err) => console.log(err));
};

// ADD PROCESS
export const addProcess = (process) => (dispatch, getState) => {
  API.post("/api/processes/", process, tokenConfigWithFile(dispatch, getState))
    .then((res) => {
      dispatch(createMessage({ addProcess: "Process Added" }));
      dispatch({
        type: ADD_PROCESS,
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

// GET MODELS CORRESPONDING TO THE CURRENT PROCESS
export const getProcessModel = (id) => (dispatch, getState) => {
  API.get(`api/pytorch_models/process-${id}/list_model/`, tokenConfig(getState))
    .then((res) => {
      dispatch(createMessage({ getProjectsProcess: "Get Process Model" }));
      dispatch({
        type: GET_PROCESSMODELS,
        payload: res.data,
      });
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
    });
};

// EDIT PROCESS (PARTIAL UPDATE)
export const editProcess = (id, process) => (dispatch, getState) => {
  API.put(
    `/api/processes/${id}/`,
    process,
    tokenConfigWithFile(dispatch, getState)
  )
    .then((res) => {
      dispatch(createMessage({ editProcess: "Process Edited" }));
      dispatch({
        type: EDIT_PROCESS,
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

// GET METRICS CORRESPONDING TO THE CURRENT PROCESS
export const getProcessMetrics = (id) => (dispatch, getState) => {
  API.get(`api/metrics/process-${id}/list_metrics/`, tokenConfig(getState))
    .then((res) => {
      dispatch(createMessage({ getProcessMetrics: "Get Process's Metrics" }));
      dispatch({
        type: GET_PROCESSMETRICS,
        payload: res.data.results,
      });
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
    });
};

// RUN PROCESS
export const runProcess = (identifier) => (dispatch, getState) => {
  API.post(`/api/processes/run_process/`, identifier, tokenConfig(getState))
    .then((res) => {
      dispatch(createMessage({ runProcess: "Process Ran" }));
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// DISPLAY IMAGE
export const getDisplayImage = (identifier) => (dispatch, getState) => {
  API.post(`/api/processes/display_image/`, identifier, tokenConfig(getState))
    .then((res) => {
      dispatch(createMessage({ imageDisplay: "Image Display" }));
      dispatch({
        type: GET_DISPLAYIMAGES,
        payload: res.data,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};
