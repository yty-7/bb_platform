import React, { Fragment } from "react";
import ModelForm from "./ModelForm";
import ModelList from "./ModelList";

export default function Modelboard() {
  return (
    <Fragment>
      <div className="Modelboard">
        {/* <ModelForm /> */}
        <ModelList />
        <ModelForm />
      </div>
    </Fragment>
  );
}
