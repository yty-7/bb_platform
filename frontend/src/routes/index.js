import React from "react";
import { Switch, Route } from "react-router-dom";

import PrivateRoute from "../components/common/PrivateRoute";

import Login from "../components/accounts/Login";
import Register from "../components/accounts/Register";
import Dashboard from "../components/views/Dashboard";

import Projectboard from "../components/views/project/Projectboard";
import ProjectDetail from "../components/views/project/ProjectDetail";
import EditProject from "../components/views/project/EditProject";

import Datasetboard from "../components/views/dataset/Datasetboard";
import EditDataset from "../components/views/dataset/EditDataset";

import Processboard from "../components/views/process/Processboard";
import EditProcess from "../components/views/process/EditProcess";

import Modelboard from "../components/views/model/Modelboard";
import EditModel from "../components/views/model/EditModel";

import Metricboard from "../components/views/metric/Metricboard";
import EditMetric from "../components/views/metric/EditMetric";

export default (
  <Switch>
    <Route exact path="/login" component={Login} />
    <Route exact path="/register" component={Register} />
    <PrivateRoute exact path="/" component={Dashboard} />
    <PrivateRoute exact path="/projects" component={Projectboard} />
    <PrivateRoute exact path="/projects/:id" component={ProjectDetail} />
    <PrivateRoute exact path="/projects/edit/:id" component={EditProject} />

    <PrivateRoute exact path="/datasets" component={Datasetboard} />
    <PrivateRoute exact path="/datasets/edit/:id" component={EditDataset} />

    <PrivateRoute exact path="/processes" component={Processboard} />
    <PrivateRoute exact path="/processes/edit/:id" component={EditProcess} />

    <PrivateRoute exact path="/models" component={Modelboard} />
    <PrivateRoute exact path="/models/edit/:id" component={EditModel} />

    <PrivateRoute exact path="/metrics" component={Metricboard} />
    <PrivateRoute exact path="/metrics/edit/:id" component={EditMetric} />
  </Switch>
);
