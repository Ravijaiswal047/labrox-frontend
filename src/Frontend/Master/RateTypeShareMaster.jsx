import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { isChecked } from "../util/Commonservices";
import { number } from "../../utils/helpers";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { Link } from "react-router-dom";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import RateTypeDefaultShareModal from "../utils/RateTypeDefaultShareModal";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton } from "../../components/UI/CustomButton";
import ImportExcelModal from "../utils/ImportExcelModal";
import Modal from "../../components/formComponent/Modal";
import RateTypeCopyShareModal from "../utils/RateTypeCopyShareModal";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const RateTypeShareMaster = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [Disable, setDisable] = useState(true);
  const [Department, setDepartment] = useState([]);
  const [TestList, setTestList] = useState([]);
  const [RateTypeData, setRateTypeData] = useState([]);
  const [load, setLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [TableData, setTableData] = useState([]);
  const [openTemplate, setOpenTemplate] = useState(false);
  const [templateData, setTemplateData] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [logData, setLogData] = useState([]);
  const [openCopy, setOpenCopy] = useState(false);
  const userdata = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userdata?.DefaultCurrencyName;
  const [payload, setPayload] = useState({
    RateTypeID: "",
    // Multiple departments can be selected now (MultiSelectComp) - the
    // backend's RateTypeShare/GetRateTypeShare needs to accept this as an
    // array instead of the single int it currently expects. See summary
    // at the end of this change for full backend-side details.
    DepartmentID: [],
    TestID: "",
    IsOutSource: 0,
  });
  const { t } = useTranslation();

  console.log(TableData);
  const handleSelect = (name, value) => {
    console.log("name, value", name, value)
    // const { name, value } = event.target;
    setPayload({ ...payload, [name]: value.value });
  };

  // MultiSelectComp calls onChange(name, valuesArray) directly.
  const handleDepartmentMultiChange = (name, values) => {
    setPayload((prev) => ({ ...prev, [name]: values, TestID: "" }));
  };

  const handleOpenTemplate = () => {
    setOpenTemplate(true);
  };

  const handleCloseTemplate = () => {
    setOpenTemplate(false);
    setTemplateData([]);
  };

  const getDepartment = (rate) => {
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
        setPayload({
          ...payload,
          RateTypeID: rate,
          // Multiselect now - require an explicit pick instead of
          // auto-selecting the first department.
          DepartmentID: [],
        });
        setDepartment(Department);
      })
      .catch((err) => console.log(err));
  };

  // Test Name dropdown, sourced the same way RateList.jsx does it
  // (RateList/getItemList). That endpoint only accepts a single
  // DepartmentID, so with the department field now a multiselect this
  // fetches per selected department and merges the results client-side -
  // no backend change needed for this particular list.
  const getTestNameList = () => {
    const departmentIDs = payload?.DepartmentID;
    if (!Array.isArray(departmentIDs) || departmentIDs.length === 0) {
      setTestList([]);
      return;
    }

    Promise.all(
      departmentIDs.map((departmentID) =>
        axiosInstance
          .post("RateList/getItemList", { DepartmentID: departmentID })
          .then((res) => res?.data?.message || [])
          .catch((err) => {
            console.log(err);
            return [];
          }),
      ),
    ).then((results) => {
      const merged = results.flat();
      const seen = new Set();
      const val = [];
      merged.forEach((ele) => {
        if (ele?.InvestigationID != null && !seen.has(ele.InvestigationID)) {
          seen.add(ele.InvestigationID);
          val.push({ value: ele.InvestigationID, label: ele.TestName });
        }
      });
      val.unshift({ label: t("Select Test"), value: "" });
      setTestList(val);
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    setPayload((payload) => ({
      ...payload,
      [name]: checked ? 1 : 0,
    }));
  };
  const getRateList = () => {
    axiosInstance
      .get("Centre/getRateList")
      .then((res) => {
        let data = res.data.message;
        if (DefaultCurrencyName === "KES") {
          data = data.filter(
            (ele) => ele?.CentreType?.toLowerCase() === "franchise"
          );
        }
        let RateType = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        setRateTypeData(RateType);
        getDepartment(RateType[0]?.value);
      })
      .catch((err) => console.log(err));
  };

  const getRateTypeShare = () => {
    setLoading(true);
    axiosInstance
      .post("RateTypeShare/GetRateTypeShare", {
        ...payload,
        // "" can't convert to the backend's Nullable<int> - send null
        // instead when no test is selected (same class of fix as
        // mrpRateTypeID in CentreMaster.jsx).
        TestID: payload?.TestID ? Number(payload.TestID) : null,
        // Backend requires an "obj" field with no corresponding frontend
        // control or known meaning yet - sending it empty satisfies the
        // "field is required" validation until its actual purpose is
        // confirmed (same treatment as "cm" on Centre/UpdateCentre).
        obj: "",
      })
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data?.message;
          const val = data.map((ele) => {
            return {
              ...ele,
              ShareAmount: Number(ele?.ShareAmount)?.toFixed(2),
              SharePer: Number(ele?.SharePer)?.toFixed(2),
              isChecked: false,
              RateTypeID: payload?.RateTypeID,
              // payload.DepartmentID is an array now (multiselect) - can't
              // stamp it onto every row like before. Each row needs to
              // carry its OWN department for Save/Delete to scope
              // correctly, so this trusts ele?.DepartmentID from the
              // response. Requires the backend to actually include
              // DepartmentID on each returned row - see summary.
              DepartmentID: ele?.DepartmentID,
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

  const post = () => {
    const data = TableData?.filter((ele) => ele.isChecked === true);
    const valid = Match(data);
    if (valid) {
      toast.error("Share Amount Cannot be Greater then Rate");
    } else {
      setLoad(true);
      axiosInstance
        .post("RateTypeShare/RateTypeShareCreate", {
          RateTypeID: payload?.RateTypeID,
          // Now an array (multiselect) — each row in Data also carries its
          // own DepartmentID (see getRateTypeShare). Backend needs to
          // accept the array here and should prefer each row's own
          // DepartmentID over this outer one when saving.
          DepartmentID: payload?.DepartmentID,
          Data: data,
        })
        .then((res) => {
          if (res.data.message) {
            setLoad(false);
            toast.success(res.data.message);
            getRateTypeShare();
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

  const DeleteData = () => {
    const data = TableData?.filter((ele) => ele.isChecked === true);
    axiosInstance
      .post("RateTypeShare/RateTypeShareDelete", {
        RateTypeID: payload?.RateTypeID,
        // Same as RateTypeShareCreate above — now an array.
        DepartmentID: payload?.DepartmentID,
        Data: data,
      })
      .then((res) => {
        if (res.data.message) {
          toast.success(res.data.message);
          getRateTypeShare();
        } else {
          toast.error("Something went wrong");
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const handleChange = (e, index) => {
    const { name, value, type, checked } = e.target;

    if (index >= 0) {
      let data = [...TableData];
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
              ShareAmount: name === "SharePer" ? "" : value,
              SharePer: name === "ShareAmount" ? "" : value,
              SharePer: name === "SharePer" ? "" : value,
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

    }
    return match;
  };

  const getLog = (row) => {
    axiosInstance
      .post("RateTypeShare/GetRateTypeShareLog", {
        investigationID: row?.InvestigationID,
        rateTypeID: payload?.RateTypeID,
      })
      .then((res) => {
        if (res.data.success && Array.isArray(res?.data?.message)) {
          setLogData(res?.data?.message || []);
          setShowLog(true);
        } else {
          toast.error(res?.data?.message || "No Record Found");
          setLogData([]);
          setShowLog(false);
        }

      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong"
        );

      });
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
    getRateList();
  }, []);

  useEffect(() => {
    getTestNameList();
  }, [payload?.DepartmentID]);
  return (
    <>
      {show && (
        <RateTypeDefaultShareModal
          show={show}
          handleClose={handleClose}
          RateTypeID={payload?.RateTypeID}
        />
      )}
      <Accordion
        name={t("Rate Type Share Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            {/* <SelectBox
              id="RateType"
              lable="RateType"
              name="RateTypeID"
              options={RateTypeData}
              onChange={handleSelect}
              value={payload?.RateTypeID}
            /> */}
            <ReactSelect
              dynamicOptions={RateTypeData}
              name="RateTypeID"
              lable={t("RateType")}
              id="RateType"
              removeIsClearable={true}
              placeholderName={t("RateType")}
              value={payload?.RateTypeID}
              onChange={handleSelect}
              isDisabled={RateTypeData.length === 0}
            />
          </div>
          <div className="col-sm-2">
            {/* <SelectBox
              id="Department"
              lable="Department"
              onChange={handleSelect}
              name="DepartmentID"
              options={Department}
              value={payload?.DepartmentID}
            /> */}
            <MultiSelectComp
              options={Department}
              name="DepartmentID"
              id="Department"
              label={t("Department")}
              value={payload?.DepartmentID}
              onChange={handleDepartmentMultiChange}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={TestList}
              name="TestID"
              lable={t("Test Name")}
              id="TestID"
              removeIsClearable={true}
              placeholderName={t("Test Name")}
              value={payload?.TestID}
              onChange={handleSelect}
              isDisabled={TestList.length === 0}
            />
          </div>
          {/* <div className="col-sm-1">
            <button
              type="submit"
              className="btn btn-block btn-success btn-sm"
              onClick={getRateTypeShare}
            >
              {t("Search")}
            </button>
          </div> */}
          <div className="col-sm-auto d-flex align-items-center">
            <Input
              type="checkbox"
              name="IsOutSource"
              id="IsOutSource"
              checked={payload?.IsOutSource === 1}
              onChange={handleCheckboxChange}
              removeFormGroupClass={true}
              className="mr-1"
            />
            <label htmlFor="IsOutSource" className="ml-1 mb-0">
              {t("IsOutSource")}
            </label>
          </div>
          <CustomButton text="Search" icon="search" onClick={getRateTypeShare} className="mx-2" />
          <CustomButton text="Import / Export" icon="excel" className="mx-2" onClick={handleOpenTemplate} />
          <CustomButton text="Default Share" icon="share" className="mx-2" onClick={handleShow} />
          {/* <div className="col-sm-2">
            <button
              type="submit"
              className="btn btn-block btn-danger btn-sm"
              onClick={handleShow}
            >
              {t("Default Share")}
            </button>
          </div> */}
          <div className="col-sm-auto">
            <CustomButton
              text={t("Transfer")}
              icon={"send"}
              onClick={() => setOpenCopy(true)}
              className="btn-block mx-2"
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : (
          <>
            {TableData.length > 0 && (
              <div className="row p-2">
                <div className="col-12">
                  <Tables>
                    <thead className="cf">
                      <tr>
                        <th>{t("S.No")}</th>
                        <th>{t("Investigation")}</th>
                        <th>{t("Rate")}</th>
                        <th>
                          <Input
                            type="number"
                            placeholder={t("Share Amount")}
                            name="ShareAmount"
                            onChange={handleChange}
                            onInput={(e) => number(e, 8)}
                            numberMin={0}
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
                            placeholder={t("Share Percentage")}
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
                        <th>{t("Log")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TableData.map((data, i) => (
                        <tr key={i}>
                          <td data-title={t("S.No")}>{i + 1}&nbsp;</td>
                          <td data-title={t("Investigation")}>
                            {data?.TestName}&nbsp;
                          </td>
                          <td data-title={t("Rate")}>{data?.Rate}&nbsp;</td>
                          <td data-title={t("ShareAmount")}>
                            <Input
                              value={data?.ShareAmount}
                              type="number"
                              onChange={(e) => handleChange(e, i)}
                              onInput={(e) => number(e, 8)}
                              name="ShareAmount"
                              disabled={data?.isChecked ? false : true}
                            />
                          </td>
                          <td data-title={t("SharePer")}>
                            <Input
                              value={data?.SharePer}
                              onChange={(e) => handleChange(e, i)}
                              onInput={(e) => number(e, 3)}
                              name="SharePer"
                              type="number"
                              disabled={data?.isChecked ? false : true}
                            />
                          </td>
                          <td data-title={t("Status")}>
                            <input
                              type="checkbox"
                              name="isChecked"
                              checked={data?.isChecked}
                              onChange={(e) => handleChange(e, i)}
                            />
                          </td>
                          <td data-title={t("Log")}>
                            <i
                              className="fa fa-search text-primary"
                              style={{ cursor: "pointer" }}
                              onClick={() => getLog(data)}
                            ></i>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                </div>
              </div>
            )}
            {TableData.length > 0 && (
              <div className="row">
                <div className="col-sm-2 mb-1">
                  {load ? (
                    <Loading />
                  ) : (
                    <button
                      className="btn btn-block btn-success btn-sm"
                      onClick={post}
                      disabled={Disable}
                    >
                      {t("Save")}
                    </button>
                  )}
                </div>
                <div className="col-sm-2 mb-1">
                  <button
                    className="btn btn-block btn-danger btn-sm"
                    onClick={DeleteData}
                    disabled={Disable}
                  >
                    {t("Delete")}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Accordion>
      <ImportExcelModal
        open={openTemplate}
        onClose={handleCloseTemplate}
        RateTypeData={RateTypeData}
        RateTypeID={payload?.RateTypeID}
        setTemplateData={setTemplateData}
        templateData={templateData}
      />
      <RateTypeCopyShareModal
        show={openCopy}
        handleClose={() => setOpenCopy(false)}
        RateTypeData={RateTypeData}
        FromRateTypeID={payload?.RateTypeID}
      />
      {showLog && (
        <Modal
          visible={showLog}
          setVisible={setShowLog}
          Header={t("RateTypeShare Log")}
          modalWidth="90vw"
        >
          <div className="row p-2">
            <div className="col-12">
              <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>

                    <th>{t("Rate Type Name")}</th>

                    <th>{t("Test Name")}</th>
                    <th>{t("Test Code")}</th>
                    <th>{t("Old Share Amount")}</th>
                    <th>{t("New Share Amount")}</th>
                    <th>{t("Old Share %")}</th>
                    <th>{t("New Share %")}</th>
                    <th>{t("Old Entry Date")}</th>

                    <th>{t("Old Created By")}</th>
                    <th>{t("New Entry Date")}</th>

                    <th>{t("New Created By")}</th>
                  </tr>
                </thead>
                <tbody>
                  {logData.length > 0 ? (
                    logData.map((log, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>

                        <td>{log?.RateTypeName}</td>

                        <td>{log?.TestName}</td>
                        <td>{log?.TestCode}</td>
                        <td>{log?.OldShareAmount}</td>
                        <td>{log?.NewShareAmount}</td>
                        <td>{log?.OldSharePer}</td>
                        <td>{log?.NewSharePer}</td>
                        <td>{log?.OlddtEntry || "-"}</td>

                        <td>{log?.OldCreatedByName || "-"}</td>
                        <td>{log?.NewdtEntry || "-"}</td>

                        <td>{log?.NewCreatedByName || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="17" className="text-center">
                        {t("No Log Found")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Tables>
            </div>
          </div>
        </Modal>
      )}


    </>
  );
};

export default RateTypeShareMaster;
