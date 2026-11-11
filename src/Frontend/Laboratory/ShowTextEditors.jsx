import React from "react";
import HistoEditor from "./HistoEditor";

const ShowTextEditors = ({ id, value, onChange, name, height }) => {
  return (
    <div>
      <HistoEditor
        id={id}
        value={value}
        setValue={onChange}
        name={name}
        height={height}
      />
    </div>
  );
};

export default ShowTextEditors;
