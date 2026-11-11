import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import Accordion from "@app/components/UI/Accordion";

const MicroBiologyMasterMapping = () => {
  const location = useLocation();
  const [getMapItem, setGetMapItem] = useState([]);
  const [payloadUnMappedItem, setPayloadUnMappedItem] = useState([]);
  const [payloadMappedItem, setPayloadMappedItem] = useState([]);
  const [getUnMapItem, setGetUnMapItem] = useState([]);
  const { t } = useTranslation();

  const handleChange = (e, state) => {
    var options = e.target.options;
    var value = [];
    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(Number(options[i].value));
      }
    }

    const data = state
      .filter((ele) => value.includes(ele?.MapMasterID))
      .map((ele) => ({
        TypeID: String(ele?.TypeID),
        MasterID: ele?.MasterID,
        MapTypeID: ele?.MapTypeID,
        MapMasterID: ele?.MapMasterID,
        BreakPoint: ele?.Name,
      }));

    setPayloadUnMappedItem(data);
  };

  const handleChangeGetMapData = (e, state) => {
    var options = e.target.options;
    var value = [];
    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(Number(options[i].value));
      }
    }

    let data = state.filter((ele) => {
      if (value.includes(ele?.MapID)) {
        return {
          TypeID: ele?.TypeID,
          MasterID: ele?.MasterID,
          MapTypeID: ele?.MapTypeID,
          MapMasterID: ele?.MapMasterID,
          BreakPoint: ele?.Name,
        };
      }
    });
    setPayloadMappedItem(data);
  };

  const fetchMap = () => {
    axiosInstance
      .post("MapMicroMaster/getsaveddata", {
        SearchType: String(location?.state?.typeid),
        MasterID: location?.state?.id,
      })
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            ...ele,
            MapTypeID: "4",
          };
        });
        setGetMapItem(val);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };
  const fetchUnMap = () => {
    axiosInstance
      .post("MapMicroMaster/getunmappeddata", {
        SearchType: String(location?.state?.typeid),
        MasterID: location?.state?.id,
      })
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            ...ele,
            MasterID: location?.state?.id,
          };
        });
        setGetUnMapItem(val);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Wents Wrong",
        );
      });
  };

  const handleMapSave = () => {
    axiosInstance
      .post("MapMicroMaster/savemapping", {
        MappingData: payloadUnMappedItem,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        setPayloadUnMappedItem([]);
        fetchMap();
        fetchUnMap();
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  const handleMapDelete = () => {
    axiosInstance
      .post("MapMicroMaster/deletemapping", {
        MappingData: payloadMappedItem,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        setPayloadMappedItem([]);
        fetchMap();
        fetchUnMap();
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  useEffect(() => {
    fetchMap();
    fetchUnMap();
  }, []);
  return (
    <>
      <Accordion
        name={t("Micro Biology Master Mapping")}
        defaultValue={true}
        isBreadcrumb={true}
        linkTitle={t("Back To Main Page")}
        linkTo="/MicroBiologyMaster"
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-4">
            <span style={{ fontWeight: "bold" }}>
              {location?.state?.typeid === 2
                ? t("Organism Master")
                : location?.state?.typeid === 3
                  ? t("Antibiotic Group")
                  : t("Unknown Type")}
              :&nbsp;
            </span>
            <span>{location?.state?.Name}</span>
          </div>
          <div className="col-sm-3">
            <span style={{ fontWeight: "bold" }}>{t("Code")} :&nbsp;</span>
            <span> {location?.state?.Code}</span>
          </div>
        </div>
      </Accordion>
      <div className="row pt-2 pl-2 pr-2">
        <div className="col-md-5">
          <Accordion title={t("Mapped Item")} defaultValue={true}>
            <select
              multiple
              className="form-control mapping-tag"
              onChange={(e) => handleChangeGetMapData(e, getMapItem)}
              style={{ border: "none" }}
            >
              {getMapItem.map((ele, index) => (
                <option key={index} value={ele?.MapID} className="p-2">
                  {ele?.Name}
                </option>
              ))}
            </select>
          </Accordion>
        </div>
        <div
          className="col-sm-2 col-md-2"
          style={{
            display: "flex",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "180px",
            // margin:"auto"
          }}
        >
          <div>
            <button
              className="btn btn-info btn-sm btn-block"
              style={{ width: "100px" }}
              onClick={() => handleMapSave("Left")}
              disabled={payloadUnMappedItem?.length > 0 ? false : true}
            >
              {t("Left")}
            </button>
          </div>
          <div>
            <button
              className="btn btn-info btn-sm btn-block"
              style={{ width: "100px", marginLeft: "5px" }}
              onClick={() => handleMapDelete("Right")}
              disabled={payloadMappedItem?.length > 0 ? false : true}
            >
              {t("Right")}
            </button>
          </div>
        </div>
        <div className="col-md-5">
          <Accordion title={t("UnMapped Item")} defaultValue={true}>
            <select
              multiple
              className="form-control mapping-tag "
              onChange={(e) => handleChange(e, getUnMapItem)}
              style={{ border: "none" }}
            >
              {getUnMapItem.map((ele, index) => (
                <option key={index} value={ele?.MapMasterID} className="p-2">
                  {ele?.Name}
                </option>
              ))}
            </select>
          </Accordion>
        </div>
      </div>
    </>
  );
};

export default MicroBiologyMasterMapping;
