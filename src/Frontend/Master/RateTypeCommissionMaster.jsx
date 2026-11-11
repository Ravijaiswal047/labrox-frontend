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
import RateTypeDefaultCommissionModal from "../utils/RateTypeDefaultCommissionModal";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";
import ImportExcelCommissionModal from "../utils/ImportExcelCommissionModal";
import Modal from "../../components/formComponent/Modal";
import RateTypeCopyCommissionModal from "../utils/RateTypeCopyCommissionModal";

const RateTypeCommissionMaster = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [Disable, setDisable] = useState(true);
  const [Department, setDepartment] = useState([]);
  const [RateTypeData, setRateTypeData] = useState([]);
  const [load, setLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [TableData, setTableData] = useState([]);
  const [openTemplate, setOpenTemplate] = useState(false);
  const [templateData, setTemplateData] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [logData, setLogData] = useState([]);
  const [openCopy, setOpenCopy] = useState(false);
  const [payload, setPayload] = useState({
    RateTypeID: "",
    DepartmentID: "",
  });
  const { t } = useTranslation();

  const handleSelect = (name, value) => {
    setPayload({ ...payload, [name]: value.value });
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
          DepartmentID: Department[0]?.value,
        });
        setDepartment(Department);
      })
      .catch((err) => console.log(err));
  };

  const getRateList = () => {
    axiosInstance
      .get("Centre/getRateList")
      .then((res) => {
        let data = res.data.message;
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

  const getRateTypeCommission = () => {
    setLoading(true);
    axiosInstance
      .post("RateTypeCommission/GetRateTypeCommission", payload)
      .then((res) => {
        if (res.data?.isSuccess || res.status === 200) {
          const data = res?.data?.message;
          const val = data.map((ele) => {
            return {
              ...ele,
              CommissionAmount: Number(ele?.CommissionAmount)?.toFixed(2),
              CommissionPer: Number(ele?.CommissionPer)?.toFixed(2),
              isChecked: false,
              RateTypeID: payload?.RateTypeID,
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

  const post = () => {
    const data = TableData?.filter((ele) => ele.isChecked === true);
    const valid = Match(data);
    if (valid) {
      toast.error("Commission Amount Cannot be Greater then Rate");
    } else {
      setLoad(true);
      const sanitized = data.map((ele) => ({
        ...ele,
        CommissionAmount: ele.CommissionAmount === "" ? null : ele.CommissionAmount,
        CommissionPer: ele.CommissionPer === "" ? null : ele.CommissionPer,
      }));
      axiosInstance
        .post("RateTypeCommission/RateTypeCommissionCreate", {
          RateTypeID: payload?.RateTypeID,
          DepartmentID: payload?.DepartmentID,
          Data: sanitized,
        })
        .then((res) => {
          if (res.data?.isSuccess || res.data?.message) {
            setLoad(false);
            toast.success(res.data.message);
            getRateTypeCommission();
          } else {
            toast.error("Something went wrong");
          }
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || "Something went wrong");
          setLoad(false);
        });
    }
  };

  const DeleteData = () => {
    const data = TableData?.filter((ele) => ele.isChecked === true);
    axiosInstance
      .post("RateTypeCommission/RateTypeCommissionDelete", {
        RateTypeID: payload?.RateTypeID,
        DepartmentID: payload?.DepartmentID,
        Data: data,
      })
      .then((res) => {
        if (res.data?.isSuccess || res.data?.message) {
          toast.success(res.data.message);
          getRateTypeCommission();
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
      if (name === "CommissionAmount") {
        data[index]["CommissionPer"] = "";
      }
      if (name === "CommissionPer") {
        data[index]["CommissionAmount"] = "";
      }
      data[index][name] =
        type === "checkbox"
          ? checked
          : name === "CommissionPer"
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
              CommissionAmount: name === "CommissionPer" ? "" : value,
              CommissionPer: name === "CommissionPer" ? "" : value,
              [name]: checked,
            };
          });
          setTableData(data);
          document.getElementById("CommissionAmount").value = "";
          document.getElementById("CommissionPer").value = "";
        }
      } else {
        const data = TableData.map((ele) => {
          return {
            ...ele,
            CommissionAmount: name === "CommissionPer" ? "" : value,
            CommissionPer:
              name === "CommissionAmount" ? "" : parseInt(value) > 100 ? "" : value,
          };
        });
        setTableData(data);
        if (name === "CommissionPer") {
          document.getElementById("CommissionAmount").value = "";
          let data = document.getElementById("CommissionPer").value;
          if (parseInt(data) > 100) {
            document.getElementById("CommissionPer").value = "";
          }
        }

        if (name === "CommissionAmount") {
          document.getElementById("CommissionPer").value = "";
        }
      }
    }
  };

  const Match = (TableData) => {
    let match = false;
    for (var i = 0; i < TableData.length; i++) {
      if (
        parseFloat(TableData[i].CommissionAmount) > parseFloat(TableData[i].Rate) ||
        (TableData[i].CommissionAmount === "" && TableData[i].CommissionPer === "")
      ) {
        match = true;
        break;
      }
      if (
        parseFloat(TableData[i].CommissionPer) > parseFloat(TableData[i].Rate) ||
        (TableData[i].CommissionAmount === "" && TableData[i].CommissionPer === "")
      ) {
        match = true;
        break;
      }
    }
    return match;
  };

  const getLog = (row) => {
    axiosInstance
      .post("RateTypeCommission/GetRateTypeCommissionLog", {
        investigationID: row?.InvestigationID,
        rateTypeID: payload?.RateTypeID,
      })
      .then((res) => {
        if ((res.data.isSuccess || res.data.success) && Array.isArray(res?.data?.message)) {
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

  return (
    <>
      {show && (
        <RateTypeDefaultCommissionModal
          show={show}
          handleClose={handleClose}
          RateTypeID={payload?.RateTypeID}
        />
      )}
      <Accordion
        name={t("Rate Type Commission Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
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
            <ReactSelect
              dynamicOptions={Department}
              name="DepartmentID"
              lable={t("Department")}
              id="Department"
              removeIsClearable={true}
              placeholderName={t("Department")}
              value={payload?.DepartmentID}
              onChange={handleSelect}
              isDisabled={Department.length === 0}
            />
          </div>
          <CustomButton text="Search" icon="search" onClick={getRateTypeCommission} className="mx-2" />
          <CustomButton text="Import / Export" icon="excel" className="mx-2" onClick={handleOpenTemplate} />
          <CustomButton text="Default Commission" icon="share" className="mx-2" onClick={handleShow} />
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
                            placeholder={t("Commission Amount")}
                            name="CommissionAmount"
                            onChange={handleChange}
                            onInput={(e) => number(e, 8)}
                            onFocus={(e) => e.target.select()}
                            numberMin={0}
                            id="CommissionAmount"
                            disabled={
                              TableData?.length > 0
                                ? isChecked("isChecked", TableData, true).includes(false)
                                  ? true
                                  : false
                                : false
                            }
                          />
                        </th>
                        <th>
                          <Input
                            type="number"
                            placeholder={t("Commission Percentage")}
                            name="CommissionPer"
                            onChange={handleChange}
                            onInput={(e) => number(e, 3)}
                            onFocus={(e) => e.target.select()}
                            id="CommissionPer"
                            disabled={
                              TableData?.length > 0
                                ? isChecked("isChecked", TableData, true).includes(false)
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
                                ? isChecked("isChecked", TableData, true).includes(false)
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
                          <td data-title={t("CommissionAmount")}>
                            <Input
                              value={data?.CommissionAmount}
                              type="number"
                              onChange={(e) => handleChange(e, i)}
                              onInput={(e) => number(e, 8)}
                            onFocus={(e) => e.target.select()}
                              name="CommissionAmount"
                              disabled={data?.isChecked ? false : true}
                            />
                          </td>
                          <td data-title={t("CommissionPer")}>
                            <Input
                              value={data?.CommissionPer}
                              onChange={(e) => handleChange(e, i)}
                              onInput={(e) => number(e, 3)}
                            onFocus={(e) => e.target.select()}
                              name="CommissionPer"
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
      <ImportExcelCommissionModal
        open={openTemplate}
        onClose={handleCloseTemplate}
        RateTypeData={RateTypeData}
        RateTypeID={payload?.RateTypeID}
        setTemplateData={setTemplateData}
        templateData={templateData}
      />
      <RateTypeCopyCommissionModal
        show={openCopy}
        handleClose={() => setOpenCopy(false)}
        RateTypeData={RateTypeData}
        FromRateTypeID={payload?.RateTypeID}
      />
      {showLog && (
        <Modal
          visible={showLog}
          setVisible={setShowLog}
          Header={t("RateTypeCommission Log")}
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
                    <th>{t("Old Commission Amount")}</th>
                    <th>{t("New Commission Amount")}</th>
                    <th>{t("Old Commission %")}</th>
                    <th>{t("New Commission %")}</th>
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
                        <td>{log?.OldCommissionAmount}</td>
                        <td>{log?.NewCommissionAmount}</td>
                        <td>{log?.OldCommissionPer}</td>
                        <td>{log?.NewCommissionPer}</td>
                        <td>{log?.OlddtEntry || "-"}</td>
                        <td>{log?.OldCreatedByName || "-"}</td>
                        <td>{log?.NewdtEntry || "-"}</td>
                        <td>{log?.NewCreatedByName || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="text-center">
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

export default RateTypeCommissionMaster;
