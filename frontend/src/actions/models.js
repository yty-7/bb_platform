import API from "./api";
import { createMessage, returnErrors } from "./messages";
import { tokenConfig, tokenConfigWithFile } from "./auth";
import {
  GET_MODELS,
  GET_MODEL,
  DELETE_MODEL,
  ADD_MODEL,
  EDIT_MODEL,
  FORM_UPLOADFAIL,
  FORM_UPLOADED,
} from "../actions/types.js";

// GET MODELS
export const getModels = () => (dispatch, getState) => {
  API.get("/api/pytorch_models/", tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: GET_MODELS,
        payload: res.data.results,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// GET A SINGLE MODELS
export const getModel = (id) => (dispatch, getState) => {
  API.get(`/api/pytorch_models/${id}`, tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: GET_MODEL,
        payload: res.data,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// DELETE MODEL
export const deleteModel = (id) => (dispatch, getState) => {
  API.delete(`/api/pytorch_models/${id}/`, tokenConfig(getState))
    .then((res) => {
      dispatch(createMessage({ deleteModel: "Model Deleted" }));
      dispatch({
        type: DELETE_MODEL,
        payload: id,
      });
    })
    .catch((err) => console.log(err));
};

// ADD MODEL
export const addModel = (model) => (dispatch, getState) => {
  API.post(
    "/api/pytorch_models/",
    model,
    tokenConfigWithFile(dispatch, getState)
  )
    .then((res) => {
      dispatch(createMessage({ addModel: "Model Added" }));
      dispatch({
        type: ADD_MODEL,
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
export const editModel = (id, model) => (dispatch, getState) => {
  API.put(
    `/api/pytorch_models/${id}/`,
    model,
    tokenConfigWithFile(dispatch, getState)
  )
    .then((res) => {
      dispatch(createMessage({ editModel: "Model Edited" }));
      dispatch({
        type: EDIT_MODEL,
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
