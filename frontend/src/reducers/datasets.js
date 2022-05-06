import {
  GET_DATASETS,
  GET_DATASET,
  DELETE_DATASET,
  ADD_DATASET,
  EDIT_DATASET,
} from "../actions/types.js";

const initialState = {
  datasets: [],
  detailedDataset: {},
  datasetsCount: 0,
  pageSize: 0,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_DATASETS:
      return {
        ...state,
        datasets: action.payload.results,
        datasetsCount: action.payload.count,
        pageSize: action.payload.page_size,
      };
    case GET_DATASET:
      return {
        ...state,
        detailedDataset: action.payload || [],
      };
    case EDIT_DATASET:
      return {
        ...state,
        detailedDataset: action.payload || {},
      };
    case DELETE_DATASET:
      console.log("Deletedhhhhhhh>>>>>>>>>")
      return {
        ...state,
        datasets: state.datasets.filter(
          (dataset) => dataset.id !== action.payload
        ),
      };
    case ADD_DATASET:
      console.log("hhhhhhh>>>>>>>>>")
      return {
        ...state,
        datasets: [...state.datasets, action.payload],
      };
    default:
      return state;
  }
}
