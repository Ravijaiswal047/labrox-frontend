import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import Accordion from "@app/components/UI/Accordion";
import Tooltip from "../../components/formComponent/Tooltip";


const ImmunoHistoChemistryMasterMaster = () => {
  const location = useLocation();
  const {state} = location;
  const [getMapItem, setGetMapItem] = useState([]);
  const [payloadUnMappedItem, setPayloadUnMappedItem] = useState([]);
  const [payloadMappedItem, setPayloadMappedItem] = useState([]);
  const [getUnMapItem, setGetUnMapItem] = useState([]);
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState({
    mapSearch: "",
    unMapSearch: "",
  });
  


  const filteredMapItem = getMapItem.filter((item) =>
  item?.NAME?.toLowerCase().includes(searchText.mapSearch.toLowerCase())
);

const filteredUnMapItem = getUnMapItem.filter((item) =>
  item?.Name?.toLowerCase().includes(searchText.unMapSearch.toLowerCase())
);

  const handleChange = (e, state) => {
    var options = e.target.options;
    var value = [];
    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(Number(options[i].value));
      }
    }

     const data = state
    .filter((ele) => value.includes(ele?.MasterMapTypeID))
    .map((ele) => ({
      TypeID: ele?.TypeID,
      MasterID: ele?.MasterID,
      MapTypeID: "2",
      mapTypeName: "Antibody",
      MasterMapTypeID: ele?.MasterMapTypeID,
      TypeName: ele?.Name,
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

    const data = state
    .filter((ele) => value.includes(ele?.MapID))
    .map((ele) => ({
      MapID: ele?.MapID,
    }));
  
    setPayloadMappedItem(data);
  };


  const fetchMap = () => {
    axiosInstance
      .post("IHC/MappedData", {
        MasterID: state?.item?.ID,
      })
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            ...ele,
            MapTypeID: "1",
          };
        });
        setGetMapItem(val);
        setSearchText({
          mapSearch: "",
          unMapSearch: "",
        })
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong"
        );
      });
  };

  const fetchUnMap = () => {
    axiosInstance
      .post("IHC/GetUnmappedMarker", {
        TypeName: "Antibody",
        mapTypeID: state?.item?.ID,
      })
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            ...ele,
            MasterID: state?.item?.ID,
          };
        });
        setGetUnMapItem(val);
        setSearchText({
          mapSearch: "",
          unMapSearch: "",
        })
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Wents Wrong"
        );
      });
  };

  const handleMapSave = () => {
    axiosInstance
      .post("IHC/SaveIHCMarkerMapping", {
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
            : "Something Went Wrong"
        );
      });
  };

  const handleMapDelete = () => {
    const mapIDs = payloadMappedItem.map(item => item.MapID);
    axiosInstance
      .post("IHC/UnmappedData", {
        mapIDs: mapIDs,
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
            : "Error Occured"
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
        name={t("ImmmunoHisto Chemistry Master Mapping")}
        defaultValue={true}
        isBreadcrumb={true}
        linkTitle={t("Back To Main Page")}
        linkTo="/ImmunoHistoChemistryMaster"
      >
        {/* <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-3">
            <span style={{ fontWeight: "bold" }}>
              {t("Marker Master")} :&nbsp;
            </span>
            <span>{state?.item?.Name}</span>
          </div>
          <div className="col-sm-2">
            <span style={{ fontWeight: "bold" }}>
              {t("Marker Code")} :&nbsp;
            </span>
            <span>{state?.item?.Markercode}</span>
          </div>
          <div className="col-sm-2">
            <span style={{ fontWeight: "bold" }}>
              {t("Created By")} :&nbsp;
            </span>
            <span>{state?.item?.CreatedByName}</span>
          </div>
          <div className="col-sm-2">
            <span style={{ fontWeight: "bold" }}>
              {t("Created Date")} :&nbsp;
            </span>
            <span>{state?.item?.dtEntry}</span>
          </div>
        </div> */}
        <div
          className="p-dialog-header custom-box-body"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              padding: "0px",
              borderRadius: "8px",
            }}
          >
            {/* Marker Master */}
            <div
              style={{
                display: "flex",
                minWidth: "200px",
                flex: "0 0 auto",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: "bold" }}>
                {t("Marker Master")} : &nbsp;
              </span>
              <Tooltip position="bottom" label={t("Marker Master")}>
                <span>{state?.item?.Name}</span>
              </Tooltip>
            </div>

            {/* Marker Code */}
            <div
              style={{
                display: "flex",
                minWidth: "160px",
                flex: "0 0 auto",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: "bold" }}>
                {t("Marker Code")} : &nbsp;
              </span>
              <Tooltip position="bottom" label={t("Marker Code")}>
                <span>{state?.item?.Markercode}</span>
              </Tooltip>
            </div>

            {/* Created By */}
            <div
              style={{
                display: "flex",
                minWidth: "180px",
                flex: "0 0 auto",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: "bold" }}>
                {t("Created By")} : &nbsp;
              </span>
              <Tooltip position="bottom" label={t("Created By")}>
                <span>{state?.item?.CreatedByName}</span>
              </Tooltip>
            </div>

            {/* Created Date */}
            <div
              style={{
                display: "flex",
                minWidth: "160px",
                flex: "0 0 auto",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: "bold" }}>
                {t("Created Date")} : &nbsp;
              </span>
              <Tooltip position="bottom" label={t("Created Date")}>
                <span>{state?.item?.dtEntry}</span>
              </Tooltip>
            </div>
          </div>
        </div>
      </Accordion>
      <div className="row pt-2 pl-2 pr-2">
        <div className="col-md-5">
          <Accordion title={t("Mapped Item")} defaultValue={true}>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Search..."
              value={searchText?.mapSearch}
              onChange={(e) =>
                setSearchText({
                  ...searchText,
                  mapSearch: e.target.value,
                })
              }
            />
            <select
              multiple
              className="form-control mapping-tag"
              onChange={(e) => handleChangeGetMapData(e, getMapItem)}
              style={{ border: "none" }}
            >
              {filteredMapItem.map((ele, index) => (
                <option key={index} value={ele?.MapID} className="p-2">
                  {ele?.NAME}
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
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Search..."
              value={searchText?.unMapSearch}
              onChange={(e) =>
                setSearchText({
                  ...searchText,
                  unMapSearch: e.target.value,
                })
              }
            />
            <select
              multiple
              className="form-control mapping-tag "
              onChange={(e) => handleChange(e, getUnMapItem)}
              style={{ border: "none" }}
            >
              {filteredUnMapItem.map((ele, index) => (
                <option
                  key={index}
                  value={ele?.MasterMapTypeID}
                  className="p-2"
                >
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

export default ImmunoHistoChemistryMasterMaster;
