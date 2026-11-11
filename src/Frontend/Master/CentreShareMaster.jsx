import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { isChecked } from "../util/Commonservices";
import { number } from "../../utils/helpers";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";
import Modal from "../../components/formComponent/Modal";
import CentreShareDefaultModal from "../utils/CentreShareDefaultModal";
import ImportExcelCentreShareModal from "../utils/ImportExcelCentreShareModal";
import CentreShareCopyModal from "../utils/CentreShareCopyModal";

const CentreShareMaster = () => {
  const { t } = useTranslation();

  const [show, setShow] = useState(false);
  const [Disable, setDisable] = useState(true);
  const [CentreData, setCentreData] = useState([]);
  const [Department, setDepartment] = useState([]);
  const [load, setLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [TableData, setTableData] = useState([]);
  const [openTemplate, setOpenTemplate] = useState(false);
  const [templateData, setTemplateData] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [logData, setLogData] = useState([]);
  const [openCopy, setOpenCopy] = useState(false);

  const [payload, setPayload] = useState({
    CentreID: "",
    DepartmentID: "",
  });

  const handleSelect = (name, value) => {
    setPayload({ ...payload, [name]: value.value });
  };

  const getDepartment = (centreID) => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        const data = res.data.message;
        const depts = data.map((ele) => ({
          value: ele.DepartmentID,
          label: ele.Department,
        }));
        setPayload((prev) => ({
          ...prev,
          CentreID: centreID,
          DepartmentID: depts[0]?.value,
        }));
        setDepartment(depts);
      })
      .catch((err) => console.log(err));
  };

  const getCentreList = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        const data = res.data.message || [];
        const centres = data.map((ele) => ({
          value: ele.CentreID,
          label: ele.Centre,
        }));
        setCentreData(centres);
        getDepartment(centres[0]?.value);
      })
      .catch((err) => console.log(err));
  };

  const getCentreShare = () => {
    setLoading(true);
    axiosInstance
      .post("CentreShare/GetCentreShare", payload)
      .then((res) => {
        if (res.data?.isSuccess || res.status === 200) {
          const val = (res.data.message || []).map((ele) => ({
            ...ele,
            ShareAmount: Number(ele.ShareAmount).toFixed(2),
            SharePer: Number(ele.SharePer).toFixed(2),
            isChecked: false,
            CentreID: payload.CentreID,
            DepartmentID: payload.DepartmentID,
          }));
          setTableData(val);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const post = () => {
    const data = TableData.filter((ele) => ele.isChecked === true);
    const valid = Match(data);
    if (valid) {
      toast.error("Share Amount Cannot be Greater than Rate");
    } else {
      setLoad(true);
      const sanitized = data.map((ele) => ({
        ...ele,
        ShareAmount: ele.ShareAmount === "" ? null : ele.ShareAmount,
        SharePer: ele.SharePer === "" ? null : ele.SharePer,
      }));
      axiosInstance
        .post("CentreShare/CentreShareCreate", {
          CentreID: payload.CentreID,
          DepartmentID: payload.DepartmentID,
          Data: sanitized,
        })
        .then((res) => {
          if (res.data?.isSuccess || res.data?.message) {
            setLoad(false);
            toast.success(res.data.message);
            getCentreShare();
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
    const data = TableData.filter((ele) => ele.isChecked === true);
    axiosInstance
      .post("CentreShare/CentreShareDelete", {
        CentreID: payload.CentreID,
        DepartmentID: payload.DepartmentID,
        Data: data,
      })
      .then((res) => {
        if (res.data?.isSuccess || res.data?.message) {
          toast.success(res.data.message);
          getCentreShare();
        } else {
          toast.error("Something went wrong");
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Something went wrong"));
  };

  const handleChange = (e, index) => {
    const { name, value, type, checked } = e.target;

    if (index >= 0) {
      const data = [...TableData];
      if (name === "ShareAmount") data[index]["SharePer"] = "";
      if (name === "SharePer") data[index]["ShareAmount"] = "";
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
          setTableData(TableData.map((ele) => ({ ...ele, [name]: checked })));
        } else {
          setTableData(
            TableData.map((ele) => ({
              ...ele,
              ShareAmount: name === "SharePer" ? "" : value,
              SharePer: name === "SharePer" ? "" : value,
              [name]: checked,
            }))
          );
          document.getElementById("ShareAmount").value = "";
          document.getElementById("SharePer").value = "";
        }
      } else {
        setTableData(
          TableData.map((ele) => ({
            ...ele,
            ShareAmount: name === "SharePer" ? "" : value,
            SharePer: name === "ShareAmount" ? "" : parseInt(value) > 100 ? "" : value,
          }))
        );
        if (name === "SharePer") {
          document.getElementById("ShareAmount").value = "";
          const el = document.getElementById("SharePer");
          if (el && parseInt(el.value) > 100) el.value = "";
        }
        if (name === "ShareAmount") {
          document.getElementById("SharePer").value = "";
        }
      }
    }
  };

  const Match = (data) => {
    for (let i = 0; i < data.length; i++) {
      if (
        parseFloat(data[i].ShareAmount) > parseFloat(data[i].Rate) ||
        (data[i].ShareAmount === "" && data[i].SharePer === "")
      ) {
        return true;
      }
      if (
        parseFloat(data[i].SharePer) > parseFloat(data[i].Rate) ||
        (data[i].ShareAmount === "" && data[i].SharePer === "")
      ) {
        return true;
      }
    }
    return false;
  };

  const getLog = (row) => {
    axiosInstance
      .post("CentreShare/GetCentreShareLog", {
        investigationID: row.InvestigationID,
        centreID: payload.CentreID,
      })
      .then((res) => {
        if ((res.data.isSuccess || res.data.success) && Array.isArray(res.data.message)) {
          setLogData(res.data.message || []);
          setShowLog(true);
        } else {
          toast.error(res.data.message || "No Record Found");
          setLogData([]);
          setShowLog(false);
        }
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || "Something Went Wrong")
      );
  };

  useEffect(() => {
    if (TableData.length > 0) {
      const flag = !TableData.some((ele) => ele.isChecked === true);
      setDisable(flag);
    }
  }, [TableData]);

  useEffect(() => {
    getCentreList();
  }, []);

  return (
    <>
      {show && (
        <CentreShareDefaultModal
          show={show}
          handleClose={() => setShow(false)}
          CentreID={payload.CentreID}
        />
      )}

      <Accordion
        name={t("Centre Share Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={CentreData}
              name="CentreID"
              lable={t("Centre")}
              id="Centre"
              removeIsClearable={true}
              placeholderName={t("Centre")}
              value={payload.CentreID}
              onChange={handleSelect}
              isDisabled={CentreData.length === 0}
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
              value={payload.DepartmentID}
              onChange={handleSelect}
              isDisabled={Department.length === 0}
            />
          </div>
          <CustomButton
            text="Search"
            icon="search"
            onClick={getCentreShare}
            className="mx-2"
          />
          <CustomButton
            text="Import / Export"
            icon="excel"
            className="mx-2"
            onClick={() => setOpenTemplate(true)}
          />
          <CustomButton
            text="Default Share"
            icon="share"
            className="mx-2"
            onClick={() => setShow(true)}
          />
          <div className="col-sm-auto">
            <CustomButton
              text={t("Transfer")}
              icon="send"
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
                            onFocus={(e) => e.target.select()}
                            numberMin={0}
                            id="ShareAmount"
                            disabled={
                              TableData.length > 0
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
                            placeholder={t("Share Percentage")}
                            name="SharePer"
                            onChange={handleChange}
                            onInput={(e) => number(e, 3)}
                            onFocus={(e) => e.target.select()}
                            id="SharePer"
                            disabled={
                              TableData.length > 0
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
                              TableData.length > 0
                                ? !isChecked("isChecked", TableData, true).includes(false)
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
                          <td data-title={t("Investigation")}>{data.TestName}&nbsp;</td>
                          <td data-title={t("Rate")}>{data.Rate}&nbsp;</td>
                          <td data-title={t("ShareAmount")}>
                            <Input
                              value={data.ShareAmount}
                              type="number"
                              onChange={(e) => handleChange(e, i)}
                              onInput={(e) => number(e, 8)}
                              onFocus={(e) => e.target.select()}
                              name="ShareAmount"
                              disabled={!data.isChecked}
                            />
                          </td>
                          <td data-title={t("SharePer")}>
                            <Input
                              value={data.SharePer}
                              onChange={(e) => handleChange(e, i)}
                              onInput={(e) => number(e, 3)}
                              onFocus={(e) => e.target.select()}
                              name="SharePer"
                              type="number"
                              disabled={!data.isChecked}
                            />
                          </td>
                          <td data-title={t("Status")}>
                            <input
                              type="checkbox"
                              name="isChecked"
                              checked={data.isChecked}
                              onChange={(e) => handleChange(e, i)}
                            />
                          </td>
                          <td data-title={t("Log")}>
                            <i
                              className="fa fa-search text-primary"
                              style={{ cursor: "pointer" }}
                              onClick={() => getLog(data)}
                            />
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

      <ImportExcelCentreShareModal
        open={openTemplate}
        onClose={() => {
          setOpenTemplate(false);
          setTemplateData([]);
        }}
        CentreData={CentreData}
        CentreID={payload.CentreID}
        setTemplateData={setTemplateData}
        templateData={templateData}
      />

      <CentreShareCopyModal
        show={openCopy}
        handleClose={() => setOpenCopy(false)}
        CentreData={CentreData}
        FromCentreID={payload.CentreID}
      />

      {showLog && (
        <Modal
          visible={showLog}
          setVisible={setShowLog}
          Header={t("Centre Share Log")}
          modalWidth="90vw"
        >
          <div className="row p-2">
            <div className="col-12">
              <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Centre Name")}</th>
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
                        <td>{log.CentreName}</td>
                        <td>{log.TestName}</td>
                        <td>{log.TestCode}</td>
                        <td>{log.OldShareAmount}</td>
                        <td>{log.NewShareAmount}</td>
                        <td>{log.OldSharePer}</td>
                        <td>{log.NewSharePer}</td>
                        <td>{log.OlddtEntry || "-"}</td>
                        <td>{log.OldCreatedByName || "-"}</td>
                        <td>{log.NewdtEntry || "-"}</td>
                        <td>{log.NewCreatedByName || "-"}</td>
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

export default CentreShareMaster;
