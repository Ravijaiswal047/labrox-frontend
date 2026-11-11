import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
const QRCodeReport = () => {
  const { id } = useParams();
  const getURL = () => {
    axios
      .post(`/reports/v1/commonReports/GetLabReport`, {
        PHead: 1,
        LedgerTransactionIDHash: id,
        TestIDHash: [],
        PrintColour: "1",
      })
      .then((res) => {
        window.open(res?.data?.url, "_blank");
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    getURL();
  }, []);
  return <></>;
};

export default QRCodeReport;
