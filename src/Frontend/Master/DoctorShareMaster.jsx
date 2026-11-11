import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { isChecked } from "../util/Commonservices";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { autocompleteOnBlur, number } from "../../utils/helpers";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import DoctorTypeDefaultShareModal from "../utils/DoctorTypeDefaultShareModal";
import Tables from "../../components/UI/customTable";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import DoctorTypeCopyShare from "./DoctorTypeCopyShare";
import ReactSelect from "../../components/formComponent/ReactSelect";

const DoctorShareMaster = () => {
  const [Disable, setDisable] = useState(true);
  const handleClose = () => setShow(false);
  const [Department, setDepartment] = useState([]);
  const [dropFalse, setDropFalse] = useState(true);
  const [show, setShow] = useState(false);
  const [load, setLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [indexMatch, setIndexMatch] = useState(0);
  const [TableData, setTableData] = useState([]);
  const [payload, setPayload] = useState({
    DocID: "",
    DepartmentID: "",
    DoctorName: "",
  });
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [zoom, setZoom] = useState(false);
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  const { t } = useTranslation();

  
   const handleReactSelect = (name, e) => { 
      setPayload((prev) => ({ ...prev, [name]: e?.value }));
    };

  const handleChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    if (index >= 0) {
      const data = [...TableData];
      if (name === "ShareAmount") {
        data[index]["SharePer"] = "";
      }
      if (name === "SharePer") {
        data[index]["ShareAmount"] = "";
      }
      data[index][name] =
        type === "checkbox"
          ? checked
          : name === "SharePer"
            ? parseInt(value) > 100
              ? ""
              : value
            : value;
      setTableData(data);
    } else {
      if (type === "checkbox") {
        if (checked) {
          const data = TableData.map((ele) => {
            return {
              ...ele,
              [name]: checked,
            };
          });
          setTableData(data);
        } else {
          const data = TableData.map((ele) => {
            return {
              ...ele,
              [name]: checked,
            };
          });
          setTableData(data);
          document.getElementById("ShareAmount").value = "";
          document.getElementById("SharePer").value = "";
        }
      } else {
        const data = TableData.map((ele) => {
          return {
            ...ele,
            ShareAmount: name === "SharePer" ? "" : value,
            SharePer:
              name === "ShareAmount" ? "" : parseInt(value) > 100 ? "" : value,
          };
        });
        setTableData(data);
        if (name === "SharePer") {
          document.getElementById("ShareAmount").value = "";
          let data = document.getElementById("SharePer").value;
          if (parseInt(data) > 100) {
            document.getElementById("SharePer").value = "";
          }
        }

        if (name === "ShareAmount") {
          document.getElementById("SharePer").value = "";
        }
      }
    }
  };
  const handleIndex = (e) => {
    switch (e.which) {
      case 38:
        if (doctorSuggestion.length > 0) {
          if (indexMatch > 0) {
            setIndexMatch(indexMatch - 1);
          } else {
            setIndexMatch(doctorSuggestion.length - 1);
          }
          setTimeout(() => {
            const el = document.querySelector(".matchIndex");
            if (el) el.scrollIntoView({ block: "nearest" });
          }, 0);
        }
        break;

      case 40: // Arrow Down
        if (doctorSuggestion.length > 0) {
          if (indexMatch === doctorSuggestion.length - 1) {
            setIndexMatch(0); // wrap to top
          } else {
            setIndexMatch(indexMatch + 1);
          }
          setTimeout(() => {
            const el = document.querySelector(".matchIndex");
            if (el) el.scrollIntoView({ block: "nearest" });
          }, 0);
        }
        break;

      case 13:
        if (
          doctorSuggestion.length > 0 &&
          indexMatch >= 0 &&
          doctorSuggestion[indexMatch]
        ) {
          handleListSearch(doctorSuggestion[indexMatch], "DoctorName");
        }
        setIndexMatch(0);
        break;

      default:
        break;
    }
  };

  const handleListSearch = (data, name) => {
    switch (name) {
      case "DoctorName":
        setPayload({
          ...payload,
          [name]: data.Name,
          DocID: data.Name ? data.DoctorReferalID : "",
        });
        setIndexMatch(0);
        setDoctorSuggestion([]);
        setDropFalse(false);
        break;

      default:
        break;
    }
  };
  console.log(payload);

  const handleShow = () => {
    if (!payload?.DocID) {
      toast.error(t("Please select a doctor first"));
      return;
    }
    setShow(true);
  };
  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        let data = res.data.message;
        let Department = data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        });
        Department.unshift({ label: "Select Department", value: "" });
        setPayload({
          ...payload,
          DepartmentID: Department[0]?.value,
        });
        setDepartment(Department);
      })
      .catch((err) => console.log(err));
  };

  const getDoctorTypeShare = () => {
    setLoading(true);
    axiosInstance
      .post("DoctorShare/GetDoctorShare", {
        DocID: payload?.DocID,
        DepartmentID: payload?.DepartmentID,
      })
      .then((res) => {
        if (res.status === 200) {
          const data = res.data.message;
          const val = data.map((ele) => {
            return {
              ...ele,
              ShareAmount: Number(ele?.ShareAmount).toFixed(2),
              SharePer: Number(ele?.SharePer).toFixed(2),
              isChecked: false,
              DocID: payload?.DocID,
              DepartmentID: payload?.DepartmentID,
            };
          });
          setTableData(val);
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const DeleteData = () => {
    const data = TableData?.filter((ele) => ele.isChecked === true);
    axiosInstance
      .post("DoctorShare/DoctorShareDelete", {
        RemoveData: data,
      })
      .then((res) => {
        if (res.data.message) {
          toast.success(res.data.message);
          getDoctorTypeShare();
        } else {
          toast.error("Something went wrong");
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const post = () => {
    const data = TableData?.filter((ele) => ele.isChecked === true);
    const valid = Match(data);
    if (valid) {
      toast.error("Share Amount Cannot be Greater then Rate");
    } else {
      setLoad(true);
      axiosInstance
        .post("DoctorShare/DoctorShareCreate", {
          SaveDoctorShare: data,
        })
        .then((res) => {
          if (res.data.message) {
            setLoad(false);
            toast.success(res.data.message);
            getDoctorTypeShare();
          } else {
            toast.error("Something went wrong");
          }
        })
        .catch((err) => {
          toast.error(err.response.data.message);
          setLoad(false);
        });
    }
  };

  const getDoctorSuggestion = (name) => {
    axiosInstance
      .post("DoctorReferal/getDoctorData", {
        DoctorName: name,
      })
      .then((res) => {
        const data = res?.data?.message;
        const val = data?.map((ele) => {
          return {
            Name: ele?.Name,
            DoctorReferalID: ele?.DoctorReferalID,
          };
        });
        setDoctorSuggestion(val);
      })
      .catch((err) => console.log(err));
  };

  const Match = (TableData) => {
    let match = false;
    let FieldError = {
      index: "",
      minValue: "",
    };
    for (var i = 0; i < TableData.length; i++) {
      if (
        parseFloat(TableData[i].ShareAmount) > parseFloat(TableData[i].Rate) ||
        (TableData[i].ShareAmount === "" && TableData[i].SharePer === "")
      ) {
        match = true;
        FieldError = { index: i, minValue: "ShareAmount", maxValue: "" };
        break;
      }
      if (
        parseFloat(TableData[i].SharePer) > parseFloat(TableData[i].Rate) ||
        (TableData[i].ShareAmount === "" && TableData[i].SharePer === "")
      ) {
        match = true;
        FieldError = { index: i, minValue: "ShareAmount", maxValue: "" };
        break;
      }
    }
    return match;
  };

  useEffect(() => {
    if (TableData.length > 0) {
      let flag = true;
      for (var i = 0; i < TableData.length; i++) {
        if (TableData[i].isChecked === true) {
          flag = false;
          break;
        }
      }
      setDisable(flag);
    }
  }, [TableData]);

  useEffect(() => {
    getDepartment();
  }, []);
  return (
    <>
      {show && (
        <DoctorTypeDefaultShareModal
          show={show}
          handleClose={handleClose}
          DocID={payload?.DocID}
        />
      )}
      <Accordion
        title={t("Doctor Share Master")}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2 ">
            <Input
              className="required-fields"
              type="text"
              id="DoctorName"
              name="DoctorName"
              lable="Referred Doctor"
              value={payload?.DoctorName}
              onChange={(e) => {
                if (e.target.value) {
                  setPayload({
                    ...payload,
                    DoctorName: e.target.value,
                  });
                  getDoctorSuggestion(e.target.value);
                  setDropFalse(true);
                } else {
                  setPayload({ ...payload, DoctorName: "", DocID: "" });
                  setDropFalse(false);
                }
              }}
              onBlur={(e) => {
                autocompleteOnBlur(setDoctorSuggestion);
                setTimeout(() => {
                  const data = doctorSuggestion.filter(
                    (ele) => ele?.Name == e.target.value,
                  );
                  if (data.length === 0) {
                    setPayload({ ...payload, DoctorName: "", DocID: "" });
                  }
                }, 500);
              }}
              onKeyDown={handleIndex}
              placeholder=" "
            />
            {dropFalse && doctorSuggestion.length > 0 && payload.DoctorName && (
              <ul className="suggestion-data" style={{ top: '33px', width: '100%', right: '0px' }}>
                {doctorSuggestion.map((data, index) => (
                  <li
                    onClick={() => handleListSearch(data, "DoctorName")}
                    className={`${index === indexMatch && "matchIndex"}`}
                    key={index}
                  >
                    {data?.Name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              lable="Department"
              id="Department"
              name="DepartmentID"
              dynamicOptions={Department}
              value={payload?.DepartmentID}
              placeholderName="Select Department"
              onChange={handleReactSelect}
            />
          </div>
          <div className="col-sm-1">
            {loading ? (
              <Loading />
            ) : (
              <>
                <SearchButton
                  text={"Search"}
                  type="submit"
                  className="btn-block"
                  onClick={getDoctorTypeShare}
                  disabled={
                    payload?.DocID && payload?.DepartmentID ? false : true
                  }
                />
              </>
            )}
          </div>
          <div className="col-sm-2">
            <CustomButton
                  text={"Default Share"}
                  icon={"share"}
                  type="submit"
                  onClick={handleShow}
                  disabled={!payload?.DocID}
                />
          </div>
          <div className="col-sm-3">
            <CustomButton
              type="submit"
              icon={"copy"}
              text={"Copy Share from one Doctor Rate to Other"}
              onClick={() => setZoom(true)}
            />
          </div>
        </div>
      </Accordion>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Accordion title={t("Search Data")} defaultValue={true}>
            <div className="row px-2 ">
              <div className="col-12">
                {TableData.length > 0 && (
                  <Tables>
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Investigation</th>
                        <th>Rate</th>
                        <th>
                          <Input
                            type="number"
                            placeholder="Share Amount"
                            name="ShareAmount"
                            onChange={handleChange}
                            onInput={(e) => number(e, 4)}
                            id="ShareAmount"
                            disabled={
                              TableData?.length > 0
                                ? isChecked(
                                    "isChecked",
                                    TableData,
                                    true,
                                  ).includes(false)
                                  ? true
                                  : false
                                : false
                            }
                          />
                        </th>
                        <th>
                          <Input
                            type="number"
                            placeholder="Share Percentage"
                            name="SharePer"
                            onChange={handleChange}
                            onInput={(e) => number(e, 3)}
                            id="SharePer"
                            disabled={
                              TableData?.length > 0
                                ? isChecked(
                                    "isChecked",
                                    TableData,
                                    true,
                                  ).includes(false)
                                  ? true
                                  : false
                                : false
                            }
                          />
                        </th>
                        <th>
                          <input
                            type="checkbox"
                            name="isChecked"
                            onChange={handleChange}
                            checked={
                              TableData?.length > 0
                                ? isChecked(
                                    "isChecked",
                                    TableData,
                                    true,
                                  ).includes(false)
                                  ? false
                                  : true
                                : false
                            }
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {TableData.map((data, i) => (
                        <tr key={i}>
                          <td data-title={"S.No"}>{i + 1}</td>
                          <td data-title={"Investigation"}>{data?.TestName}</td>
                          <td data-title={"Rate"}>{data?.Rate}</td>
                          <td data-title={"ShareAmount"}>
                            <Input
                              value={data?.ShareAmount}
                              type="number"
                              onChange={(e) => handleChange(e, i)}
                              onInput={(e) => number(e, 4)}
                              name="ShareAmount"
                              disabled={data?.isChecked ? false : true}
                            />
                          </td>
                          <td data-title={"SharePer"}>
                            <Input
                              value={data?.SharePer}
                              onChange={(e) => handleChange(e, i)}
                              onInput={(e) => number(e, 3)}
                              name="SharePer"
                              type="number"
                              disabled={data?.isChecked ? false : true}
                            />
                          </td>
                          <td data-title={"#"}>
                            <input
                              type="checkbox"
                              name="isChecked"
                              checked={data?.isChecked}
                              onChange={(e) => handleChange(e, i)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                )}
              </div>
            </div>
          </Accordion>
          {TableData.length > 0 && (
            <>
              <div className="row pt-2 pl-2 pr-2 mt-1">
                <div className="col-sm-1">
                  {load ? (
                    <Loading />
                  ) : (
                    <button
                      className="btn btn-block btn-success btn-sm"
                      type="button"
                      onClick={post}
                      disabled={Disable}
                    >
                      Save
                    </button>
                  )}
                </div>
                <div className="col-sm-1">
                  <button
                    className="btn btn-block btn-danger btn-sm"
                    type="button"
                    onClick={DeleteData}
                    disabled={Disable}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
      {zoom && (
        <Dialog
          header="Copy Share from one Doctor Rate to Other"
          visible={zoom}
          onHide={() => setZoom(false)}
          className={theme}
          style={{
            width: isMobile ? "95vw" : "90vw",
          }}
          contentStyle={{ overflow: "visible" }}
        >
          <DoctorTypeCopyShare onHide={() => setZoom(false)} Department={Department} />
        </Dialog>
      )}
    </>
  );
};

export default DoctorShareMaster;
