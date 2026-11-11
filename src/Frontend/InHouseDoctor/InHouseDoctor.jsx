import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { isChecked } from "../util/Commonservices";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Modal from "../../components/formComponent/Modal";
import Loading from "../../components/loader/Loading";
import ImportInHouseDoctorModal from "./ImportInHouseDoctorModal";
import InHouseDoctorDefaultShareModal from "./InHouseDoctorDefaultShareModal";
import InHouseDoctorCopyModal from "./InHouseDoctorCopyModal";
import InHouseDoctorDeptCopyModal from "./InHouseDoctorDeptCopyModal";
import "./InHouseDoctor.css";

const shareTypeOptions = [
  { label: "Percentage", value: "Percentage" },
  { label: "Rupees", value: "Amount" },
];
const calculationOptions = [
  { label: "Gross", value: "Gross" },
  { label: "Net", value: "Net" },
];
const discountOnOptions = [
  { label: "Lab", value: "Lab" },
  { label: "Doctor", value: "Doctor" },
  { label: "Both", value: "Both" },
];

const InHouseDoctor = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [Disable, setDisable] = useState(true);
  const [doctorShareData, setDoctorShareData] = useState([]);
  const [auditLogData, setAuditLogData] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showDefaultShare, setShowDefaultShare] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const [headerControls, setHeaderControls] = useState({
    ShareType: "",
    ShareValue: "",
    CalculationBasis: "",
    DiscountOn: "",
  });
  const [doctorList, setDoctorList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [doctor, setDoctor] = useState("");
  const [department, setDepartment] = useState("");

  const handleDepartmentChange = (_, e) => {
    setDepartment(e?.value || "");
    setDoctorShareData([]);
  };

  const handleChange = (e, index) => {
    const { name, type, checked } = e.target;
    if (index >= 0) {
      let data = [...doctorShareData];
      data[index][name] = type === "checkbox" ? checked : e.target.value;
      setDoctorShareData(data);
    } else {
      const data = doctorShareData.map((row) => ({
        ...row,
        [name]: type === "checkbox" ? checked : e.target.value,
      }));
      setDoctorShareData(data);
    }
  };

  const handleShareTypeChange = (index, selected) => {
    const updated = [...doctorShareData];
    updated[index].ShareType = selected ? selected.value : "";
    if (!selected) updated[index].ShareValue = 0;
    setDoctorShareData(updated);
  };

  const handleDiscountOnChange = (index, selected) => {
    const updated = [...doctorShareData];
    updated[index].DiscountOn = selected ? selected.value : "";
    setDoctorShareData(updated);
  };

  const handleCalculationType = (index, selected) => {
    const updated = [...doctorShareData];
    updated[index].CalculationBasis = selected ? selected.value : "";
    setDoctorShareData(updated);
  };

  const handleShareValueChange = (index, val) => {
    const updated = [...doctorShareData];
    if (val === "" || Number(val) >= 0) updated[index].ShareValue = val;
    setDoctorShareData(updated);
  };

  const handleHeaderShareTypeChange = (selected) => {
    const value = selected ? selected.value : "";
    setHeaderControls((prev) => ({ ...prev, ShareType: value }));
    const updated = doctorShareData.map((row) =>
      row.isChecked ? { ...row, ShareType: value, ShareValue: value ? row.ShareValue : 0 } : row
    );
    setDoctorShareData(updated);
  };

  const handleHeaderDiscountOnChange = (selected) => {
    const value = selected ? selected.value : "";
    setHeaderControls((prev) => ({ ...prev, DiscountOn: value }));
    const updated = doctorShareData.map((row) =>
      row.isChecked ? { ...row, DiscountOn: value } : row
    );
    setDoctorShareData(updated);
  };

  const handleHeaderShareValueChange = (val) => {
    if (val !== "" && Number(val) < 0) return;
    setHeaderControls((prev) => ({ ...prev, ShareValue: val }));
    const updated = doctorShareData.map((row) =>
      row.isChecked ? { ...row, ShareValue: val } : row
    );
    setDoctorShareData(updated);
  };

  const handleHeaderCalculationChange = (selected) => {
    const value = selected ? selected.value : "";
    setHeaderControls((prev) => ({ ...prev, CalculationBasis: value }));
    const updated = doctorShareData.map((row) =>
      row.isChecked ? { ...row, CalculationBasis: value } : row
    );
    setDoctorShareData(updated);
  };

  const getDepartmentList = () => {
    axiosInstance
      .post("CommonController/Fetchprocedure", {
        typeName: "inHouse_Doctorsanddepartment",
        params: ["Department", "0"],
      })
      .then((res) => {
        setDepartmentList(
          res?.data?.data?.map((item) => ({
            label: item?.Department,
            value: item?.DepartmentID,
          })) || []
        );
      })
      .catch((err) => console.error(err));
  };

  const getDoctorList = () => {
    axiosInstance
      .get("InHouseDoctor/GetDoctorReferalList")
      .then((res) => {
        setDoctorList(
          res?.data?.data?.map((item) => ({
            label: `${item?.Title} ${item?.Name}`.trim(),
            value: item?.EmployeeID,
          })) || []
        );
      })
      .catch((err) => console.error(err));
  };

  const getDoctorShare = () => {
    if (!doctor) {
      toast.warn("Please select Doctor");
      return;
    }
    setLoading(true);
    axiosInstance
      .post("InHouseDoctor/BindInHouserDoctorData", {
        type: "MainTableDepartment",
        departmentID: Number(department) || 0,
        employeeID: Number(doctor) || 0,
        itemID: 0,
      })
      .then((res) => {
        if (!Array.isArray(res?.data?.data)) {
          toast.info(res?.data?.message || "No records found");
          setDoctorShareData([]);
          setLoading(false);
          return;
        }
        const rows = res?.data?.data?.map((r) => ({ ...r, isChecked: false })) || [];
        setDoctorShareData(rows);
        setHeaderControls({ ShareType: "", ShareValue: "", CalculationBasis: "", DiscountOn: "" });
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
        setLoading(false);
      });
  };

  const getLog = (row) => {
    axiosInstance
      .post("InHouseDoctor/BindInHouserDoctorData", {
        type: "AuditLog",
        departmentID: Number(row?.DepartmentID || 0),
        employeeID: Number(row?.EmployeeID || 0),
        itemID: 0,
      })
      .then((res) => {
        if (Array.isArray(res?.data?.data) && res.data.data.length > 0) {
          setAuditLogData(res.data.data);
          setShowLog(true);
        } else {
          toast.error(res?.data?.message || "No Log Found");
          setAuditLogData([]);
          setShowLog(false);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
      });
  };

  const saveDocShare = () => {
    const savePayload = doctorShareData.filter((r) => r.isChecked);
    if (!savePayload?.length) {
      toast.warn("No row selected");
      return;
    }

    setLoad(true);
    const modifiedPayloadList = savePayload.map((item) => ({
      employeeID: Number(doctor),
      ID: Number(item?.ID || 0),
      departmentID: Number(item?.DepartmentID) || Number(department) || 0,
      itemID: 0,
      shareType: item?.ShareType,
      shareValue: Number(item?.ShareValue),
      calculationBasis: item?.CalculationBasis,
      DiscountOn: item?.DiscountOn,
    }));

    axiosInstance
      .post("InHouseDoctor/SaveEmployeeDocShares", { data: modifiedPayloadList })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.data || res?.data?.message);
          getDoctorShare();
          setHeaderControls({ ShareType: "", ShareValue: "", CalculationBasis: "", DiscountOn: "" });
          setLoad(false);
        } else {
          toast.error(res?.data?.data || res?.data?.message || "Something went wrong");
          setLoad(false);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
        setLoad(false);
      });
  };

  const deleteDocShare = () => {
    const data = doctorShareData.filter((r) => r.isChecked);
    axiosInstance
      .post("InHouseDoctor/DeleteEmployeeDocShares", { data })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.data || res?.data?.message);
          getDoctorShare();
        } else {
          toast.error(res?.data?.data || res?.data?.message || "Something went wrong");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
      });
  };

  useEffect(() => {
    if (doctorShareData.length > 0) {
      let flag = true;
      for (let i = 0; i < doctorShareData.length; i++) {
        if (doctorShareData[i].isChecked === true) {
          flag = false;
          break;
        }
      }
      setDisable(flag);
    } else {
      setDisable(true);
    }
  }, [doctorShareData]);

  useEffect(() => {
    getDepartmentList();
    getDoctorList();
  }, []);

  const anyChecked = doctorShareData.some((r) => r.isChecked);

  return (
    <>
      <Accordion
        name={t("InHouse Doctor Sharing")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2 align-items-start">
          
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              dynamicOptions={doctorList}
              name="doctor"
              lable={t("Doctor")}
              id="doctor"
              removeIsClearable={false}
              placeholderName={t("Doctor")}
              value={doctor}
              onChange={(_, e) => setDoctor(e?.value)}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              dynamicOptions={departmentList}
              name="department"
              lable={t("Department")}
              id="department"
              removeIsClearable={false}
              placeholderName={t("Department")}
              value={department}
              onChange={handleDepartmentChange}
              isDisabled={departmentList.length === 0}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1 d-flex align-items-start">
          <CustomButton text="Search" icon="search" onClick={getDoctorShare} className="mx-2" />
          <CustomButton text="Import / Export" icon="excel" className="mx-2" onClick={() => setShowImport(true)} />
          <CustomButton text="Department Share" icon="share" className="mx-2" onClick={() => setShowDefaultShare(true)} />
          <CustomButton text="Transfer" icon="send" className="mx-2" onClick={() => setShowCopy(true)} />
            </div>
        </div>
      </Accordion>

      <Accordion title={t("Doctor Share Data")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : (
          <>
            {doctorShareData.length > 0 && (
              <div className="row p-2">
                <div className="col-12">
                  <Tables>
                    <thead className="cf">
                      <tr>
                        <th>{t("S.No")}</th>
                        <th>{t("Department")}</th>
                        <th>
                          <div className="d-flex flex-column">
                            <span>{t("Share Type")}</span>
                            <ReactSelect
                              dynamicOptions={shareTypeOptions}
                              value={headerControls.ShareType}
                              onChange={(_, selected) => handleHeaderShareTypeChange(selected)}
                              placeholderName=""
                              isDisabled={!anyChecked}
                            />
                          </div>
                        </th>
                        <th>
                          <div className="d-flex flex-column">
                            <span>{t("Share Value")}</span>
                            <Input
                              type="number"
                              value={headerControls.ShareValue}
                              onChange={(e) => handleHeaderShareValueChange(e.target.value)}
                              placeholder=""
                              disabled={!anyChecked}
                            />
                          </div>
                        </th>
                        <th>
                          <div className="d-flex flex-column">
                            <span>{t("Calculation")}</span>
                            <ReactSelect
                              dynamicOptions={calculationOptions}
                              value={headerControls.CalculationBasis}
                              onChange={(_, selected) => handleHeaderCalculationChange(selected)}
                              placeholderName=""
                              isDisabled={!anyChecked}
                            />
                          </div>
                        </th>
                        <th>
                          <div className="d-flex flex-column">
                            <span>{t("Discount On")}</span>
                            <ReactSelect
                              dynamicOptions={discountOnOptions}
                              value={headerControls.DiscountOn}
                              onChange={(_, selected) => handleHeaderDiscountOnChange(selected)}
                              placeholderName=""
                              isDisabled={!anyChecked}
                            />
                          </div>
                        </th>
                        <th>{t("Last Updated By")}</th>
                        <th>{t("Last Updated On")}</th>
                        <th>
                          <input
                            type="checkbox"
                            name="isChecked"
                            onChange={handleChange}
                            checked={
                              doctorShareData?.length > 0
                                ? isChecked("isChecked", doctorShareData, true).includes(false)
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
                      {doctorShareData.map((row, i) => (
                        <tr key={i}>
                          <td data-title={t("S.No")}>{i + 1}&nbsp;</td>
                          <td data-title={t("Department")}>{row?.Department}&nbsp;</td>
                          <td data-title={t("Share Type")}>
                            <ReactSelect
                              dynamicOptions={shareTypeOptions}
                              value={
                                row.ShareType
                                  ? shareTypeOptions.find((o) => o.value === row.ShareType)?.value
                                  : null
                              }
                              onChange={(_, selected) => handleShareTypeChange(i, selected)}
                              isDisabled={!row.isChecked}
                            />
                          </td>
                          <td data-title={t("Share Value")}>
                            <Input
                              type="number"
                              value={row.ShareValue}
                              onChange={(e) => handleShareValueChange(i, e.target.value)}
                              disabled={!row.isChecked}
                              placeholder={row.ShareType === "Percentage" ? "%" : "₹"}
                            />
                          </td>
                          <td data-title={t("Calculation")}>
                            <ReactSelect
                              dynamicOptions={calculationOptions}
                              value={
                                row.CalculationBasis
                                  ? calculationOptions.find((o) => o.value === row.CalculationBasis)?.value
                                  : null
                              }
                              onChange={(_, selected) => handleCalculationType(i, selected)}
                              isDisabled={!row.isChecked}
                            />
                          </td>
                          <td data-title={t("Discount On")}>
                            <ReactSelect
                              dynamicOptions={discountOnOptions}
                              value={
                                row.DiscountOn
                                  ? discountOnOptions.find((o) => o.value === row.DiscountOn)?.value
                                  : null
                              }
                              onChange={(_, selected) => handleDiscountOnChange(i, selected)}
                              isDisabled={!row.isChecked}
                            />
                          </td>
                          <td data-title={t("Last Updated By")}>{row?.CreatedByName || "-"}&nbsp;</td>
                          <td data-title={t("Last Updated On")}>{row?.dtEntry || "-"}&nbsp;</td>
                          <td data-title={t("Status")}>
                            <input
                              type="checkbox"
                              name="isChecked"
                              checked={row?.isChecked}
                              onChange={(e) => handleChange(e, i)}
                            />
                          </td>
                          <td data-title={t("Log")}>
                            <i
                              className="fa fa-search text-primary"
                              style={{ cursor: "pointer" }}
                              onClick={() => getLog(row)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                </div>
              </div>
            )}

            {doctorShareData.length > 0 && (
              <div className="row">
                <div className="col-sm-2 mb-1">
                  {load ? (
                    <Loading />
                  ) : (
                    <button
                      className="btn btn-block btn-success btn-sm"
                      onClick={saveDocShare}
                      disabled={Disable}
                    >
                      {t("Save")}
                    </button>
                  )}
                </div>
                <div className="col-sm-2 mb-1">
                  <button
                    className="btn btn-block btn-danger btn-sm"
                    onClick={deleteDocShare}
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

      <ImportInHouseDoctorModal
        open={showImport}
        onClose={() => setShowImport(false)}
        DoctorList={doctorList}
        DoctorID={doctor}
      />

      <InHouseDoctorDeptCopyModal
        show={showDefaultShare}
        handleClose={() => setShowDefaultShare(false)}
        DepartmentList={departmentList}
        FromDepartmentID={department}
      />

      <InHouseDoctorCopyModal
        show={showCopy}
        handleClose={() => setShowCopy(false)}
        DoctorList={doctorList}
        FromDoctorID={doctor}
      />

      {showLog && (
        <Modal
          visible={showLog}
          setVisible={setShowLog}
          Header={t("InHouse Doctor Log")}
          modalWidth="90vw"
        >
          <div className="row p-2">
            <div className="col-12">
              <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Doctor Name")}</th>
                    <th>{t("Department")}</th>
                    <th>{t("Old Share Type")}</th>
                    <th>{t("New Share Type")}</th>
                    <th>{t("Old Share Value")}</th>
                    <th>{t("New Share Value")}</th>
                    <th>{t("Old Calculation")}</th>
                    <th>{t("New Calculation")}</th>
                    <th>{t("Old Discount On")}</th>
                    <th>{t("New Discount On")}</th>
                    <th>{t("Old Entry Date")}</th>
                    <th>{t("Old Created By")}</th>
                    <th>{t("New Entry Date")}</th>
                    <th>{t("New Created By")}</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogData.length > 0 ? (
                    auditLogData.map((log, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{log?.EmployeeName || "-"}</td>
                        <td>{log?.DepartmentName || "-"}</td>
                        <td>{log?.OldShareType || "-"}</td>
                        <td>{log?.NewShareType || "-"}</td>
                        <td>{log?.OldShareValue ?? "-"}</td>
                        <td>{log?.NewShareValue ?? "-"}</td>
                        <td>{log?.OldCalculationBasis || "-"}</td>
                        <td>{log?.NewCalculationBasis || "-"}</td>
                        <td>{log?.OldDiscountOn || "-"}</td>
                        <td>{log?.NewDiscountOn || "-"}</td>
                        <td>{log?.OLDdtEntry || "-"}</td>
                        <td>{log?.OLDCreatedByName || "-"}</td>
                        <td>{log?.NewdtEntry || "-"}</td>
                        <td>{log?.NewCreatedByName || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="15" className="text-center">
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

export default InHouseDoctor;
