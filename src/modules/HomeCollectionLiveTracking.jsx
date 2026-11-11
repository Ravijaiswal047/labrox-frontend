import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import MapWithMarkersLiveTracking from "./MapWithMarkersLiveTracking";
import Heading from "../components/UI/Heading";
import { toast } from "react-toastify";

const HomeCollectionLiveTracking = () => {
  // const navigate = useNavigate();

  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [tableData1, setTableData1] = useState([]);
  const [tableData2, setTableData2] = useState([]);
  const [load, setLoad] = useState(false);
  const params = new URLSearchParams();

  const queryData = window.location.search.substring(1);
  console.log(queryData);
  const handleSearch = () => {
    axios
      .post("/api/v1/HomeCollectionSearch/LiveLocationPatientDetail", {
        prebookingid: String(queryData?.split("=")[1]?.split("~")[1]),
        // prebookingid: "4812",
      })
      .then((res) => {
        const datas = res?.data?.message;
        // params.set("data", aa);
        window.history.pushState({}, "", "?" + params.toString());
        if (datas?.length > 0) {
          setTableData(datas);
          setLoad(false);
        } else {
          setLoad(false);
          toast.error("No Data Found.");
          setTableData([]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSearch1 = () => {
    axios
      .post("/api/v1/HomeCollectionSearch/LiveLocationPatientLocation", {
        // prebookingid: String(queryData?.split("=")[1]?.split("~")[1]),
        phelboid: String(queryData?.split("=")[1]?.split("~")[0]),
        // prebookingid: "4812",
      })
      .then((res) => {
        const datas = res?.data?.message;
        if (datas?.length > 0) {
          setTableData1(datas);
          setLoad(false);
        } else {
          setLoad(false);
          toast.error("No Data Found.");
          setTableData1([]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleSearch2 = () => {
    axios
      .post("/api/v1/HomeCollectionSearch/LiveLocationTrackLocation", {
        prebookingid: String(queryData?.split("=")[1]?.split("~")[1]),
        phelboid: String(queryData?.split("=")[1]?.split("~")[0]),
        // prebookingid: "4812",
        // phelboid: "293",
      })
      .then((res) => {
        const datas = res?.data?.message;
        if (datas?.length > 0) {
          setTableData2(datas);
          setLoad(false);
        } else {
          setLoad(false);
          toast.error("No Data Found.");
          setTableData2([]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    handleSearch();
    handleSearch1();
    
  }, []);
  // const handleBackPage = () => {
  //   navigate("/");
  // };
  
  useEffect(() => {
    handleSearch2();
    // const interval = setInterval(() => {
    //  handleSearch2();
    // }, 5000);
    // return () => clearInterval(interval);
  }, []);
  return (
    <>
      <div className="card">
        <Heading
          title={t("Home Collection Live Tracking")}
          // secondTitle={
          //   <div
          //     onClick={handleBackPage}
          //     className="ml-auto p-2"
          //     style={{ cursor: "pointer", fontWeight: "bold" }}
          //   >
          //     Back to Main Page
          //   </div>
          // }
        />
      </div>
      <div className="card">
        <div className="row m-1 d-flex">
          <p className="ml-1">
            <strong>Phlebotomist Name</strong>: &nbsp; {tableData?.[0]?.phname}
          </p>
          <p className="ml-3">
            <strong>Mobile</strong>:&nbsp; {tableData?.[0]?.hpmobile}
          </p>
          <p className="ml-3">
            <strong> Last updated temperature</strong>:&nbsp; {"20"}
          </p>
          <p className="ml-3">
            <strong> Vaccination Status</strong>:&nbsp;{" "}
            {tableData?.[0]?.currentstatus}
          </p>
        </div>
      </div>
      <div className="card">
        <div className="row">
          <MapWithMarkersLiveTracking data={tableData1} track={tableData2}/>
        </div>
      </div>
    </>
  );
};

export default HomeCollectionLiveTracking;
