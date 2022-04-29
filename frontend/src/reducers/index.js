import { combineReducers } from "redux";
import projects from "./projects";
import errors from "./errors";
import messages from "./messages";
import auth from "./auth";
import datasets from "./datasets";
import processes from "./processes";
import models from "./models";
import metrics from "./metrics";
import forms from "./forms";

export default combineReducers({
  projects: projects,
  errors: errors,
  messages: messages,
  auth: auth,
  datasets: datasets,
  processes: processes,
  models: models,
  metrics: metrics,
  forms: forms,
});
