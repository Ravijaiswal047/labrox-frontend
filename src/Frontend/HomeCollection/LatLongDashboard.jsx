import React, { useEffect, useState } from "react";

import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../utils/axiosInstance";
import DatePicker from "../../components/formComponent/DatePicker";
import axios from "axios";
import MapWithMarkers from "../MyMap/MapWithMarkers";
import moment from "moment";
import { toast } from "react-toastify";
import Loading from "../../components/loader/Loading";
import { SearchButton } from "../../components/UI/CustomButton";
const LatLongDashboard = () => {
  const [tableData, setTableData] = useState([]);
  const { t } = useTranslation();
  const [load, setLoad] = useState("");
  const [payload, setPayload] = useState({
    CentreID: "0",
    City: "0",
    Phelbotomist: "0",
    FromDate: new Date(),
    ToDate: new Date(),
    StateID: "0",
    PhelbotomistType: "1",
  });
  const [statesSearch, setStatesSearch] = useState([]);
  const [phlebos, setPhelbos] = useState([]);
  const [citySearch, setCitySearch] = useState([]);
  const [centre, setCentre] = useState([]);
  const getAccessCentres = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        setCentre(CentreDataValue);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data.message
            ? err?.response?.data.message
            : "Something Went wrong"
        );
      });
  };
  const handleCheckBox = (e) => {
    const { name, checked, type } = e?.target;
    const checkBoxValue = checked ? 1 : 0;
    setPayload({
      ...payload,
      [name]: type === "checkbox" ? checkBoxValue : value,
    });
  };
  const getStates = () => {
    axiosInstance
      .post("LocationMaster/getAllState", {
        BusinessZoneID: "",
      })
      .then((res) => {
        const data = res.data.message;
        const cities = data.map((item) => {
          return { label: item?.State, value: item?.StateId };
        });
        setStatesSearch(cities);
      })
      .catch((err) => {
        toast.error(
          err.response.data.message
            ? err.response.data.message
            : "Something went wrong.33"
        );
        console.log(err);
      });
  };
  const getCitysearch = (value) => {
    return axiosInstance
      .post("LocationMaster/bindAllCity", {
        StateID: String(value),
      })
      .then((res) => {
        if (res?.data?.success) {
          const data = res.data.message;
          const cities = data.map((item) => {
            return { label: item?.City, value: item?.ID };
          });
          setCitySearch(cities);
        } else {
          toast.error("Something went wrong.44");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleDeliveryChange = (name, e) => {
    const { value } = e;
    if (name == "StateID") {
      setPayload({ ...payload, [name]: value, City: "" });
      getCitysearch(value);
    } else if (name == "City") {
      setPayload({ ...payload, [name]: value });
      getPhelbo(value);
    } else {
      setPayload({
        ...payload,
        [name]: value,
      });
    }
  };
  const getPhelbo = (value) => {
    axios
      .post("/api/v1/PhelebotomistMapping/BindPhelbo", {
        CityId: value,
      })
      .then((res) => {
        const data = res.data.message;
        const phelbos = data.map((item) => {
          return { label: item?.Name, value: item?.PheleboId };
        });
        setPhelbos(phelbos);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSearch = () => {
    setLoad(true);
    axios
      .post("/api/v1/HomeCollectionSearch/PhelboTrack", {
        centre: String(payload?.CentreID),
        stateid: payload?.StateID == "0" ? "" : String(payload?.StateID),
        cityid: payload?.City == "0" ? "" : String(payload?.City),
        PhlebotomistID:
          payload?.Phelbotomist == "0" ? "" : String(payload?.Phelbotomist),
        // PhlebotomistID: "7",
        Type: String(payload?.PhelbotomistType),
        FieldBoyID: "0",
        Temp: "0",
        From: String(moment(payload?.FromDate).format("DD-MMM-YYYY")),
        To: String(moment(payload?.ToDate).format("DD-MMM-YYYY")),
      })
      .then((res) => {
        const datas = res?.data?.message;
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
      })
      .finally(() => {
        setLoad(false);
      })
  };
  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
  useEffect(() => {
    getAccessCentres();
    getStates();
  }, []);

  return (
    <>
      <Accordion
        name={t("Phelbo Dashboard")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        {" "}
      </Accordion>
      <div className="row">
        <div className="col-sm-2">
          <div className="card" style={{ minHeight: "80vh" }}>
            <div className="col-sm-12 col-6 mt-3">
              <ReactSelect
                dynamicOptions={[{ label: "All", value: "0" }, ...centre]}
                name="CentreID"
                lable={t("Centre")}
                id="Centre"
                removeIsClearable={true}
                placeholderName={t("Centre")}
                value={payload?.CentreID}
                onChange={handleDeliveryChange}
              />
            </div>
            <div className="col-sm-12 col-6 mt-2">
              <ReactSelect
                dynamicOptions={[{ label: "All", value: "0" }, ...statesSearch]}
                name="StateID"
                lable={t("State")}
                id="StateID"
                removeIsClearable={true}
                placeholderName={t("State")}
                value={payload?.StateID}
                onChange={handleDeliveryChange}
              />
            </div>
            <div className="col-sm-12 col-6 mt-2">
              <ReactSelect
                dynamicOptions={[{ label: "All", value: "0" }, ...citySearch]}
                name="City"
                lable={t("City")}
                id="City"
                removeIsClearable={true}
                placeholderName={t("City")}
                value={payload?.City}
                onChange={handleDeliveryChange}
              />
            </div>

            <div className="col-sm-12 col-6 mt-2">
              <ReactSelect
                dynamicOptions={[{ label: "All", value: "0" }, ...phlebos]}
                name="Phelbotomist"
                lable={t("Phelbotomist")}
                id="Phelbotomist"
                removeIsClearable={true}
                placeholderName={t("Phelbotomist")}
                value={payload?.Phelbotomist}
                onChange={handleDeliveryChange}
              />
            </div>

            <div className="col-sm-12 mt-2">
              <DatePicker
                name="FromDate"
                id="FromDate"
                value={payload?.FromDate}
                onChange={dateSelect}
                maxDate={new Date()}
                lable={t("From Date")}
              />
            </div>
            <div className="col-12 mt-2">
              <DatePicker
                name="ToDate"
                id="ToDate"
                value={payload?.ToDate}
                onChange={dateSelect}
                maxDate={new Date()}
                minDate={new Date(payload?.FromDate)}
                lable={t("To Date")}
              />
            </div>

            <div
              className="search-col mt-2 mb-3"
              style={{ marginLeft: "8px", display: "flex" }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <label className="switch" style={{ marginTop: "7px" }}>
                  <input
                    type="checkbox"
                    name="PhelbotomistType"
                    checked={payload?.PhelbotomistType ? 1 : 0}
                    onChange={handleCheckBox}
                  />
                  <span className="slider"></span>
                </label>
                <span
                  style={{
                    marginLeft: "3px",
                    marginRight: "5px",
                    fontSize: "12px",
                  }}
                >
                  {t("Phelbotomist")}
                </span>
              </div>
              <div className="col-sm-5 ">
                {load ? (
                  <Loading />
                ) : (
                  <SearchButton
                    text={"Search"}
                    onClick={handleSearch}
                  />  
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-10">
          <div className="card">
            <div className="p-1">
              <MapWithMarkers data={tableData} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default LatLongDashboard;
