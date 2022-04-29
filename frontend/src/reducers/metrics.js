import {
  GET_METRICS,
  GET_METRIC,
  DELETE_METRIC,
  ADD_METRIC,
  EDIT_METRIC,
} from "../actions/types.js";

const initialState = {
  metrics: [],
  detailedMetric: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_METRICS:
      return {
        ...state,
        metrics: action.payload || [],
      };
    case GET_METRIC:
      return {
        ...state,
        detailedMetric: action.payload || {},
      };
    case EDIT_METRIC:
      return {
        ...state,
        detailedMetric: action.payload,
      };
    case DELETE_METRIC:
      return {
        ...state,
        metrics: state.metrics.filter((metric) => metric.id !== action.payload),
      };
    case ADD_METRIC:
      return {
        ...state,
        metrics: [...state.metrics, action.payload],
      };
    default:
      return state;
  }
}
