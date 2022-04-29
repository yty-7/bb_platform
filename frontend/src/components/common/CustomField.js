import React, { Fragment } from "react";

import { getFilename } from "./utils";

export function TextField(props) {
  return (
    <div className="form-group">
      <label htmlFor={props.id}>{props.label}</label>
      <input
        type={props.type}
        className="form-control"
        id={props.id}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
}

export function FileField(props) {
  return (
    <div className="form-group">
      <label htmlFor={props.id}>{props.label}</label>
      <input
        type="file"
        className="form-control"
        id={props.id}
        name={props.name}
        onChange={props.fileOnChange}
      />
    </div>
  );
}

export function DropdownField(props) {
  return (
    <div className="form-group">
      <label htmlFor={props.id}>{props.label}</label>
      <select
        className="form-control custom-select"
        id={props.id}
        name={props.name}
        onChange={props.onChange}
        value={props.selected}
      >
        {renderOption(props)}
      </select>
      {props.children}
    </div>
  );
}

const renderOption = (props) => {
  switch (props.itemType) {
    case "object":
      return props.items.map((item, idx) => (
        <option key={idx} value={JSON.stringify(item)}>
          id: {item.id} name: {item.name}
        </option>
      ));
    default:
      return Object.keys(props.items).map((key, idx) => (
        <option key={idx} value={props.items[key]}>
          {key}
        </option>
      ));
  }
};

export function CheckboxField(props) {
  return (
    <div className="form-group">
      <label>{props.label}</label>
      <div>
        {Object.keys(props.dict).map((key, idx) => (
          <div className="form-check form-check-inline" key={idx}>
            <input
              className="form-check-input"
              name={props.name}
              type="checkbox"
              id={idx}
              value={props.dict[key]}
              onChange={props.checkboxOnChange}
              checked={props.checked[idx] ? true : false}
            />
            <label className="form-check-label" htmlFor={idx}>
              {key} {props.checked[idx]}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardField(props) {
  return (
    <div className="card" style={CardStyle.Card}>
      <h2 className="card-title" style={CardStyle.Title}>
        {props.title}
      </h2>
      <div className="card-body">{props.children}</div>
    </div>
  );
}

export function ImageCard(props) {
  const baseURL = process.env.REACT_APP_BASE_URL;
  const metrics = props.value.metrics;
  const images = props.value.images;

  return (
    <Fragment>
      {images.map((image, idx) => (
        <div className="card" key={idx} style={ImageCardStyle.Card}>
          <div className="card-title">
            <strong>Image name:</strong>
            <span style={ImageCardStyle.Text}>{getFilename(props.name)}</span>
          </div>
          <div className="card-body">
            <img
              src={`${baseURL}${image}`}
              width="100%"
              height="100%"
              alt="severity"
            />
          </div>
          <div className="card-footer text-muted">
            <p className="card-text">
              {/* <span style={ImageCardStyle.Text}>{props.severity} %</span> */}
              {metrics.map((metric, m_idx) => (
                <span key={m_idx} style={ImageCardStyle.Text}>
                  <strong style={ImageCardStyle.Footer}>{metric}:</strong>
                  {props.value[metric]} %
                </span>
              ))}
            </p>
          </div>
        </div>
      ))}
    </Fragment>
  );
}

const ImageCardStyle = {
  Card: {
    width: "80%",
    margin: "auto",
    textAlign: "center",
    fontSize: "1.5em",
    marginBottom: "1em",
  },
  Text: {
    marginLeft: "1em",
  },
  Footer: {
    textTransform: "capitalize",
  },
};

export const CardStyle = {
  Card: {
    width: "80%",
    margin: "auto",
    marginTop: "1em",
    marginBottom: "1em",
  },
  Title: {
    marginTop: "1em",
    marginLeft: "1em",
  },
};
