import React from "react";

const CancelButton = ({ cancleBtnName, onClick }) => {
  return (
    <>
      <button onClick={onClick} className="text-white">
        {cancleBtnName}
      </button>
    </>
  );
};

export default CancelButton;
// dd
