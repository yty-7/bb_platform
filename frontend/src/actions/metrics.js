import API from "./api";
import { createMessage, returnErrors } from "./messages";
import { tokenConfig, tokenConfigWithFile } from "./auth";
import {
  GET_METRICS,
  GET_METRIC,
  DELETE_METRIC,
  ADD_METRIC,
  EDIT_METRIC,
  FORM_UPLOADFAIL,
  FORM_UPLOADED,
} from "../actions/types.js";

// GET MODELS
export const getMetrics = () => (dispatch, getState) => {
  API.get("/api/metrics/", tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: GET_METRICS,
        payload: res.data.results,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// GET A SINGLE MODELS
export const getMetric = (id) => (dispatch, getState) => {
  API.get(`/api/metrics/${id}`, tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: GET_METRIC,
        payload: res.data,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// DELETE MODEL
export const deleteMetric = (id) => (dispatch, getState) => {
  API.delete(`/api/metrics/${id}/`, tokenConfig(getState))
    .then((res) => {
      dispatch(createMessage({ deleteMetric: "Metric Deleted" }));
      dispatch({
        type: DELETE_METRIC,
        payload: id,
      });
    })
    .catch((err) => console.log(err));
};

// ADD MODEL
export const addMetric = (model) => (dispatch, getState) => {
  API.post("/api/metrics/", model, tokenConfigWithFile(dispatch, getState))
    .then((res) => {
      dispatch(createMessage({ addMetric: "Metric Added" }));
      dispatch({
        type: ADD_METRIC,
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

// EDIT MODEL (PARTIAL UPDATE)
export const editMetric = (id, model) => (dispatch, getState) => {
  API.put(`/api/metrics/${id}/`, model, tokenConfigWithFile(dispatch, getState))
    .then((res) => {
      dispatch(createMessage({ editMetric: "Metric Edited" }));
      dispatch({
        type: EDIT_METRIC,
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
