import {
  GET_PROCESSES,
  GET_PROCESS,
  DELETE_PROCESS,
  ADD_PROCESS,
  EDIT_PROCESS,
  GET_PROCESSMODELS,
  GET_PROCESSMETRICS,
} from "../actions/types.js";

const initialState = {
  processes: [],
  processModel: {},
  detailedProcess: {},
  processMetrics: [],
  processesCount: 0,
  pageSize: 0,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_PROCESSES:
      return {
        ...state,
        processes: action.payload.results || [],
        processesCount: action.payload.count,
        pageSize: action.payload.page_size,
      };
    case GET_PROCESS:
      return {
        ...state,
        detailedProcess: action.payload || {},
      };
    case EDIT_PROCESS:
      return {
        ...state,
        detailedProcess: action.payload,
      };
    case DELETE_PROCESS:
      return {
        ...state,
        processes: state.processes.filter(
          (process) => process.id !== action.payload
        ),
      };
    case ADD_PROCESS:
      return {
        ...state,
        processes: [...state.processes, action.payload],
      };
    case GET_PROCESSMODELS:
      return {
        ...state,
        processModel: action.payload || [],
      };
    case GET_PROCESSMETRICS:
      return {
        ...state,
        processMetrics: action.payload || [],
      };
    default:
      return state;
  }
}
