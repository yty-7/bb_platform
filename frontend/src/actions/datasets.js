import API from "./api";
import { createMessage, returnErrors } from "./messages";
import { tokenConfig, tokenConfigWithFile } from "./auth";
import {
  GET_DATASETS,
  GET_DATASET,
  DELETE_DATASET,
  ADD_DATASET,
  EDIT_DATASET,
  FORM_UPLOADED,
  FORM_UPLOADFAIL,
} from "./types.js";

// GET DATASETS WITH PAGINATION
export const getDatasets = (page) => (dispatch, getState) => {
  let url = "";
  if (page === undefined) {
    url = "/api/datasets/";
  } else {
    url = `/api/datasets/?page=${page}`;
  }

  API.get(url, tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: GET_DATASETS,
        payload: res.data,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// GET A SINGLE DATASETS
export const getDataset = (id) => (dispatch, getState) => {
  API.get(`/api/datasets/${id}`, tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: GET_DATASET,
        payload: res.data,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// DELETE DATASET
export const deleteDataset = (id) => (dispatch, getState) => {
  API.delete(`/api/datasets/${id}/`, tokenConfig(getState))
    .then((res) => {
      dispatch(createMessage({ deleteDataset: "Dataset Deleted" }));
      dispatch({
        type: DELETE_DATASET,
        payload: id,
      });
    })
    .catch((err) => console.log(err));
};

// ADD DATASET
export const addDataset = (dataset) => (dispatch, getState) => {
  API.post("/api/datasets/", dataset, tokenConfigWithFile(dispatch, getState))
    .then((res) => {
      dispatch(createMessage({ addDataset: "Dataset Added" }));
      dispatch({
        type: ADD_DATASET,
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

// EDIT DATASET (PARTIAL UPDATE)
export const editDataset = (id, dataset) => (dispatch, getState) => {
  API.patch(
    `/api/datasets/${id}/`,
    dataset,
    tokenConfigWithFile(dispatch, getState)
  )
    .then((res) => {
      dispatch(createMessage({ editDataset: "Dataset Edited" }));
      dispatch({
        type: EDIT_DATASET,
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
