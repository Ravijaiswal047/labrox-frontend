import React from "react";
import { useSelector } from "react-redux";
import nodata from "./NoRecord.png";
import NextGenNoRecord from "../../assets/image/nextgen_norecordfound.png";
import "./NoRecordFound.css";

const NoRecordFound = () => {
  const { uiMode, ngColorMode } = useSelector((state) => state?.loadingSlice) || {};

  const showNextGenImage = uiMode === "nextgen" && ngColorMode !== "light";

  return (
    <div className="no-record-found">
      <img src={showNextGenImage ? NextGenNoRecord : nodata} alt="" />
    </div>
  );
};

export default NoRecordFound;
