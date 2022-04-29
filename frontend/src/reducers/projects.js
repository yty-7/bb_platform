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
  GET_DISPLAYIMAGES,
} from "../actions/types.js";

const initialState = {
  projects: [],
  projectsCount: 0,
  pageSize: 0,
  detailedProject: {},
  projectsDatasets: [],
  projectsDatasetStatus: "",
  projectsDatasetsResults: [],
  displayImages: [],
  projectsProcess: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_PROJECTS:
      return {
        ...state,
        projects: action.payload.results,
        projectsCount: action.payload.count,
        pageSize: action.payload.page_size,
      };
    case GET_PROJECT:
      return {
        ...state,
        detailedProject: action.payload || {},
      };
    case EDIT_PROJECT:
      return {
        ...state,
        detailedProject: action.payload,
      };
    case DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(
          (project) => project.id !== action.payload
        ),
      };
    case ADD_PROJECT:
      return {
        ...state,
        projects: [...state.projects, action.payload],
        projectsCount: state.projectsCount + 1,
      };
    case GET_PROJECTSDATASET:
      return {
        ...state,
        projectsDatasets: action.payload || [],
      };
    case GET_PROJECTSPROCESS:
      return {
        ...state,
        projectsProcess: action.payload || {},
      };
    case GET_PROJECTSDATASETSTATUS:
      return {
        ...state,
        projectsDatasetStatus: action.payload || "",
      };
    case GET_PROJECTSDATASETSRESULTS:
      return {
        ...state,
        projectsDatasetsResults: action.payload || [],
      };
    case GET_DISPLAYIMAGES:
      return {
        ...state,
        displayImages: action.payload || [],
      };
    default:
      return state;
  }
}
