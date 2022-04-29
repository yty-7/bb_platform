import {
  GET_MODELS,
  GET_MODEL,
  DELETE_MODEL,
  ADD_MODEL,
  EDIT_MODEL,
} from "../actions/types.js";

const initialState = {
  models: [],
  detailedModel: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_MODELS:
      return {
        ...state,
        models: action.payload || [],
      };
    case GET_MODEL:
      return {
        ...state,
        detailedModel: action.payload || {},
      };
    case EDIT_MODEL:
      return {
        ...state,
        detailedModel: action.payload,
      };
    case DELETE_MODEL:
      return {
        ...state,
        models: state.models.filter((model) => model.id !== action.payload),
      };
    case ADD_MODEL:
      return {
        ...state,
        models: [...state.models, action.payload],
      };
    default:
      return state;
  }
}
