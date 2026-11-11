import React from "react";

const SaveButton = ({ btnName, onClick }) => {
  return (
    <button className="text-white" onClick={onClick}>
      {btnName}
    </button>
  );
};

export default SaveButton;
