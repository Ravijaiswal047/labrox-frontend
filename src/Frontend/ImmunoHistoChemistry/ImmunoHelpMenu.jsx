import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import { Input } from "@profabric/react-components";
import { SelectBox } from "../../components/formComponent/SelectBox";
import HelpMenuModal from "../utils/HelpMenuModal";
import Loading from "../../components/loader/Loading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import {
  ImmunoHistoType,
  IsActive,
  MarkerResultOptions,
} from "../../utils/Constants";
import ImmunoHelpMenuModal from "./ImmunoHelpMenuModal";

const ImmunoHelpMenu = () => {
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [Edit, setEdit] = useState(false);
  const [Value, setValue] = useState([]);
  const [HelpMenu, setHelpMenu] = useState([]);
  const [load, setLoad] = useState(false);
  const [TableData, setTableData] = useState([]);
  const [formData, setFormData] = useState({
    Id: 0,
    MarkerID: "",
    MarkerName: "",
    MarkerResultOptionsID: "",
    MarkerResultOptionsName: "",
    HelpMenuId: "",
    IsActive: 1,
    MenuName: "",
    MapMenuID:0,
    isBold: "0",
  });
  const { t } = useTranslation();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const getHelpMenu = () => {
    axiosInstance
      .get("/IHC/GetIHCMarkerHelp")
      .then((res) => {
        let data = res.data.message;
        let helpMenu = data.map((ele) => {
          return {
            value: ele.ID,
            label: ele.Help,
          };
        });

        setHelpMenu(helpMenu);
      })
      .catch((err) => console.log(err));
  };
  const MapUnMapHelpMenu = (active) => {
    if (formData?.HelpMenuId) {
      setLoad(true);
      axiosInstance
        .post("/IHC/MapUnmapMarkerHelp", {
          IsActive: active,
          help: formData?.MenuName?.toString(),
          helpId: formData?.HelpMenuId?.toString(),
          markerID: formData?.MarkerID,
          markerName: formData?.MarkerName,
          resultOption: formData?.MarkerResultOptionsName,
          id: formData?.MapMenuID,
          isBold: Number(formData?.isBold),
        })
        .then((res) => {
          setLoad(false);
          if (res.data.success) {
            // getHelpMenu()
            toast.success("Mapped successfully");
            setFormData({
              ...formData, MenuName:"", HelpMenuId:"", Id: 0,isBold:"0",
            })
            handleShowMapMenu(formData?.MarkerID,formData?.MarkerResultOptionsName);
          } else {
            toast.error(res?.data?.message);
          }
        })
        .catch((err) => {
          setLoad(false);
          toast.error(err.response.data.message);
        });
    } else {
      toast.error("please Choose Help menu");
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    });
  };

  const handleSearchSelectChange = (label, value) => {
   if (label === "HelpMenuId") {
     const selectedHelpValue = value?.value;
     const selectedHelpLabel = value?.label;

     const matchedItem = Value?.length> 0 && Value.find(
       (item) =>
         item.MarkerID === Number(formData.MarkerID) &&
         item.ResultOption === formData.MarkerResultOptionsName &&
         item.Help === selectedHelpLabel
     );

     setFormData((prev) => ({
       ...prev,
       HelpMenuId: selectedHelpValue,
       MenuName: selectedHelpLabel,
       Id: selectedHelpValue,
       MapMenuID: matchedItem ? matchedItem.ID : 0,
     }));
   } else if (label === "MarkerID") {
     const selectedMarker = TableData.find((ele) => ele.value === value?.value);
     setFormData({
       ...formData,
       [label]: value?.value,
       MarkerName: selectedMarker ? selectedMarker.label : "",
       HelpMenuId: "",
     });
     formData.MarkerResultOptionsID &&
       handleShowMapMenu(value?.value, formData.MarkerResultOptionsName);
   } else if (label === "MarkerResultOptionsID") {
     const selectedOption = MarkerResultOptions.find(
       (ele) => ele.value === value?.value
     );
     setFormData({
       ...formData,
       [label]: value?.value,
       MarkerResultOptionsName: selectedOption ? selectedOption.label : "",
       HelpMenuId: "",
     });
     formData?.MarkerID && handleShowMapMenu(formData?.MarkerID, value?.label);
   }
  };

  const getBold = (value) => {
    const values = Value?.filter((ele) => ele.value == value);
    return values[0]?.isBold;
  };

  // useEffect(() => {
  //   if (!Value?.length) return;
  //   debugger

  //   const matchedItem = Value.find(
  //     (item) =>
  //       item.MarkerID === Number(formData.MarkerID) &&
  //       item.ResultOption === formData.MarkerResultOptionsName &&
  //       item.Help === formData.HelpMenuId
  //   );

  //   if (matchedItem) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       MapMenuID: matchedItem.ID,
  //     }));
  //   }
  // }, [
  //   Value,
  //   formData.MarkerID,
  //   formData.MarkerResultOptionsName,
  //   formData.HelpMenuId,
  // ]);

  const handleShowMapMenu = (markerId, resultOptionName) => {
    axiosInstance
      .post("IHC/GetMapIHCMarkerHelp", {
        ResultOption : resultOptionName,
        MarkerID :markerId,
        IsActive : 1
      })
      .then((res) => {
        const data = res?.data?.message;
        setValue(data);
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
    // handleShowMapMenu();
    handleTestSearch();
    getHelpMenu();
  }, []);

  const handleTestSearch = () => {
    setLoad(true);
    axiosInstance
      .post("IHC/GetIHCMarker", {
        TypeName: "Marker",
        ID: 0,
      })
      .then((res) => {
        setLoad(false);
        let data = res.data.message;
        let response = data.map((ele) => {
          return {
            value: ele.ID,
            label: ele.Name,
          };
        });
        setTableData(response);
      })
      .catch((err) => {
        setLoad(false);
        setTableData([]);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went wrong."
        );
      });
  };

  return (
    <>
      {" "}
      {show && (
        <ImmunoHelpMenuModal
          show={show}
          handleClose={handleClose}
          Edit={Edit}
          getHelpMenu={getHelpMenu}
          state={formData}
          setFormData2={setFormData}
        />
      )}{" "}
      <Accordion
        name={t("IHC Marker Help Menu")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-6">
            <div className="row pt-2 pl-2 pr-2">
              <div className="col-sm-4">
                <ReactSelect
                  dynamicOptions={TableData}
                  name="MarkerID"
                  lable="MarkerID"
                  id="MarkerID"
                  removeIsClearable={true}
                  placeholderName="Marker"
                  value={formData?.MarkerID}
                  onChange={handleSearchSelectChange}
                />
              </div>
              <div className="col-sm-4">
                <ReactSelect
                  dynamicOptions={MarkerResultOptions}
                  name="MarkerResultOptionsID"
                  lable="MarkerResultOptionsID"
                  id="MarkerResultOptionsID"
                  removeIsClearable={true}
                  placeholderName="MarkerResultOptions"
                  value={formData?.MarkerResultOptionsID}
                  onChange={handleSearchSelectChange}
                />
              </div>
              <div className="col-sm-4">
                <button
                  className="btn btn-success btn-block btn-sm"
                  onClick={() => {
                    handleShow();
                    setEdit(false);
                  }}
                  state={{ data: state?.data?.TestName }}
                >
                  {t("Add New Help")}
                </button>
              </div>
            </div>
            <div className="row pt-2 pl-2 pr-2">
              <div className="col-sm-4">
                <ReactSelect
                  dynamicOptions={HelpMenu}
                  name="HelpMenuId"
                  lable="Help Menu"
                  id="Help Menu"
                  removeIsClearable={true}
                  placeholderName="Help Menu"
                  value={formData?.HelpMenuId}
                  onChange={handleSearchSelectChange}
                />
              </div>
              <div className="col-sm-2 mt-2">
              <input
                type="checkbox"
                name="isBold"
                id="isBold"
                onChange={handleChange}
                checked={formData?.isBold == "1" ? true : false}
              />
              <label className="ml-2" htmlFor="isBold"> {t("IsBold")}</label>
            </div>
              <div className="col-sm-2">
                <button
                  disabled={formData?.HelpMenuId == "" || formData?.MarkerID=="" || formData?.MarkerResultOptionsID==""}
                  className="btn btn-success btn-block btn-sm"
                  onClick={()=>MapUnMapHelpMenu(1)}
                >
                  {t("Map")}
                </button>
              </div>
              <div className="col-sm-2">
                <button
                  disabled={formData?.HelpMenuId == ""}
                  className="btn btn-success btn-block btn-sm"
                  onClick={()=>MapUnMapHelpMenu(0)}
                >
                  {t("UnMap")}
                </button>
              </div>
              <div className="col-sm-2">
                <button
                  className="btn  btn-success  btn-block btn-sm"
                  disabled={formData?.HelpMenuId == ""}
                  onClick={() => {
                    handleShow();
                    setEdit(true);
                  }}
                >
                  {t("Edit Help")}
                </button>
              </div>{" "}
            </div>
          </div>
          <div className="col-sm-6">
            <div
              className="text-center"
              style={{
                border: "1px solid black",
                padding: "20px",
                //   width: "500px",
              }}
            >
              <h5>{t("Details")} : </h5>
              <span className="text-center"> {Value?.map(item => item.Help).join(", ")}</span>
            </div>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default ImmunoHelpMenu;
