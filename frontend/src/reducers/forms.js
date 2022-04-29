import {
  FORM_UPLOADED,
  FORM_UPLOADING,
  FORM_UPLOADFAIL,
} from "../actions/types";

const initialState = {
  formIsUpoading: false,
  formUploaded: null,
  uploadPercentage: 0,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case FORM_UPLOADING:
      return {
        ...state,
        formIsUpoading: true,
        uploadPercentage: action.payload,
      };
    case FORM_UPLOADED:
      return {
        ...state,
        formIsUpoading: false,
        formUploaded: true,
        uploadPercentage: 0,
      };
    case FORM_UPLOADFAIL:
      return {
        ...state,
        formIsUpoading: false,
        formUploaded: false,
        uploadPercentage: 0,
      };
    default:
      return state;
  }
}
