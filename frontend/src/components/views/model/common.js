import React from "react";

// Model basic data structure
export const modelTypeDict = {
  SqueezeNet: 0,
  GoogleNet: 1,
  ResNet: 2,
  VGG: 3,
  AlexNet: 4,
};

// Button needs permission to fire
export function ButtonWithAmin(props) {
  const type = props.type;
  const isAdmin = props.isAdmin;
  const className = props.className;
  const text = props.text;
  return (
    <button
      type={type}
      className={className}
      {...(isAdmin ? "" : { disabled: true })}
      onClick={props.onClick}
    >
      {text}
    </button>
  );
}
