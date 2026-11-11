import moment from "moment";
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import {
  getAccessCentres,
  getDepartment,
} from "../../utils/NetworkApi/commonApi";
import { getAccessRateType, getBillingCategory } from "../util/Commonservices";
import Accordion from "@app/components/UI/Accordion";
import { toast } from "react-toastify";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { useTranslation } from "react-i18next";
import { ExportToExcel, isChecked, number } from "../../utils/helpers";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Heading from "../../components/UI/Heading";
import Modal from "../../components/formComponent/Modal";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { Form } from "react-bootstrap";

const DoctorMisReportPage = () => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const [tabledata, setTableData] = useState([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientData, setPatientData] = useState([]);
  const [patientLoading, setPatientLoading] = useState(-1);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testData, setTestData] = useState([]);
  const [testLoading, setTestLoading] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [tabledata1, setTableData1] = useState([]);
  const [tabledata2, setTableData2] = useState([]);
  const [Category, setCategory] = useState([]);
  const [DoctorData, setDoctorData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(-1);
  const [loading2, setLoading2] = useState(-1);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [RateType, setRateType] = useState([]);
  const [Speclization, setSpeclization] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [payload, setPayload] = useState({
    CentreID: [],
    PanelID: [],
    DtFrom: moment(new Date()).format("YYYY-MM-DD"),
    DtTo: moment(new Date()).format("YYYY-MM-DD"),
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    ProID: [],
    DoctorID: [],
    CategoryID: [],
    HeadDepartmentID: "",
    DepartmentID: [],
    Parm1: "",
    Val1: "",
    Parm2: "",
    Val2: "",
    ShareAmount1: "",
    ShareAmount2: "",
    Speclization: [],
    IsReff: "BOTH",
    DoctorMobile: "",
    LabNo: "",
    downLoadData: "1",
    reportType: 1,
  });

  const patientCountOptions = [
    { value: "", label: "Select" },
    { value: "=", label: "=" },
    { value: ">=", label: ">=" },
    { value: "<=", label: "<=" },
    { value: ">", label: ">" },
    { value: "<", label: "<" },
    { value: "between", label: "between" },
  ];

  const dateSelect = (date, name) => {
    const dates = moment(date).format("YYYY-MM-DD");
    setPayload((prev) => ({
      ...prev,
      [name]: dates,
    }));
  };

  const handleTime = (time, secondName) => {
    let TimeStamp = "";
    TimeStamp = time?.Hour + ":" + time?.Minute + ":" + time?.second;

    setPayload({ ...payload, [secondName]: TimeStamp });
  };

  const handleChanges = (select, name) => {
    let val = select.map((ele) => ele?.value);

    console.log(val);
    setPayload({ ...payload, [name]: val });
  };

  const handleSelectChange = (name, value) => {
    // const data =select.map((ele)=>ele?.value);
    setPayload({ ...payload, [name]: value });
  };

  // const handleSelectChange = (select, name) => {
  //   let val = "";
  //   for (let i = 0; i < select.length; i++) {
  //     val = val === "" ? `${select[i].value}` : `${val},${select[i].value}`;
  //   }
  //   setPayload({ ...payload, [name]: val });
  // };

  const handleShow = (e) => {
    const { name, checked } = e.target;
    setPayload({ ...payload, [name]: checked });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const hideSelectBox = () => {
    const val = tabledata?.filter((item) => item?.isSelect === true);
    return val.length === tabledata.length ? false : true;
  };

  const handlePatientCount = () => {
    let count = 0;
    for (let i = 0; i < tabledata?.length; i++) {
      count = count + tabledata[i]["Total"];
    }

    return count;
  };

  const handlePatientShareAmount = () => {
    let count = 0;
    for (let i = 0; i < tabledata?.length; i++) {
      count = count + tabledata[i]["SharedAmount"];
    }

    return count.toFixed(2);
  };

  const handleChangeNew = (e, index) => {
    const { name, checked } = e.target;
    if (index >= 0) {
      const updateData = [...tabledata];
      updateData[index][name] = checked;
      setTableData(updateData);
    } else {
      const updateData = tabledata.map((item) => {
        return {
          ...item,
          isSelect: checked,
        };
      });
      setTableData(updateData);
    }
  };

  const handleRef = (e, id, name) => {
    console.log(id);
    const { checked } = e.target;
    setLoading(true);
    axiosInstance
      .post(`/DoctorMis/${name}`, {
        IsCheck: checked ? "1" : "0",
        DoctorID: id,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        handleSave();
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err?.data?.message ? err?.data?.message : "Error Occured");
      });
  };

  const DoctorSelectedHandle = (e, index) => {
    const { name, checked } = e.target;
    const data = [...tabledata];
    data[index][name] = checked;
    setTableData(data);
  };

  const table1data = (index, id) => {
    setLoading1(index);

    const payLoadData = { ...payload };
    payLoadData.DoctorID = id;
    axiosInstance
      .post("DoctorMis/showPatientData", payLoadData)
      .then((res) => {
        if (res?.data?.message.length > 0) {
          setTableData1(res?.data?.message);
        } else {
          toast.error("No Data Found");
          setTableData1([]);
        }

        setLoading1(-1);
      })
      .catch(() => {
        toast.error("error occured");
        setLoading1(-1);
      });
  };

  const handleSearchTest = (e, data) => {
    const { checked } = e.target;

    axiosInstance
      .post("DoctorMis/updateDocshare", {
        IsCheck: checked ? "1" : "0",
        LedgerTransactionNo: data?.LedgerTransactionNo,
        ItemId: data?.ItemId,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        table2data(data?.LedgerTransactionNo);
      })
      .catch((err) => {
        toast.error(err?.data?.message ? err?.data?.message : "Error occured");
      });
  };

  const getDropDownData = (name) => {
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        let data = res.data.message;
        console.log(data);
        let value = data.map((ele) => {
          return {
            value: ele.FieldID,
            label: ele.FieldDisplay,
          };
        });

        switch (name) {
          case "Specialization":
            setSpeclization(value);
            break;
          case "IsReff":
            // setIsRef(value);
            break;
          default:
            break;
        }
      })
      .catch((err) => console.log(err));
  };

  const handleSave = () => {
    setLoading(true);
    axiosInstance
      .post("DoctorMis/SearchDoctorSummary", {
        ...payload,
        DtFrom: moment(payload?.DtFrom).format("DD-MMM-YYYY"),
        DtTo: moment(payload?.DtTo).format("DD-MMM-YYYY"),
      })
      .then((res) => {
        const data = res?.data?.message;
        if (data.length > 0) {
          const val = data.map((ele) => {
            return {
              ...ele,
              isSelect: false,
            };
          });
          setTableData(val);
        } else {
          toast.error("No Data Found");
          setTableData([]);
        }
        setTableData1([]);
        setTableData2([]);

        setLoading(false);
      })
      .catch(() => {
        toast.error("error occured");
        setLoading(false);
      });
  };

  const table2data = (id) => {
    setLoading2(id);
    axiosInstance
      .post("DoctorMis/showTestData", {
        LabNo: id,
      })
      .then((res) => {
        const data = res?.data?.message?.map((ele) => {
          return {
            ...ele,
          };
        });
        setTableData2(data);
        setLoading2(-1);
      })
      .catch(() => {
        toast.error("Error Occured");
        setLoading2(-1);
      });
  };

  const fetchPatientDetails = async (doctorID) => {
    setPatientLoading(doctorID);
    try {
      const res = await axiosInstance.post("DoctorReferal/GetPatientDetailByDoctorID", {
        doctorID: doctorID,
      });
      if (res.data.success) {
        setPatientData(res.data.message);
        setShowPatientModal(true);
      } else {
        setPatientData([]);
        toast.error(res.data.message || "No patient found");
      }
    } catch (error) {
      toast.error("Error fetching patient details");
    } finally {
      setPatientLoading(-1);
    }
  };

  const fetchTestDataByVisitNo = async (visitNo) => {
    setTestLoading(visitNo);
    try {
      const res = await axiosInstance.post("DocShareMaster/GetTestDataByVisitNo", {
        visitNo: visitNo,
      });
      if (res.data.success) {
        setTestData(res.data.message || []);
        setShowTestModal(true);
      } else {
        toast.error(res.data.message || "No test data found");
      }
    } catch (error) {
      toast.error("Error fetching test data");
    } finally {
      setTestLoading("");
    }
  };

  const getDoctorSuggestion = () => {
    axiosInstance
      .post("DoctorReferal/getDoctorDataBind")
      .then((res) => {
        const data = res?.data?.message;

        const val = data?.map((ele) => {
          return {
            label: ele?.DoctorName,
            value: ele?.DoctorID,
          };
        });
        setDoctorData(val);
      })
      .catch((err) => console.log(err));
  };
  // const handleDownLoadExcel = (id) => {
  //   debugger
  //   const payLoadData = { ...payload };
  //   payLoadData.DoctorID = id;
  //   axiosReport
  //     .post("commonReports/ReportDoctorSummary", payLoadData)
  //     .then((res) => {
  //       toast.success(res?.data?.message);
  //       window.open(res?.data?.url, "_blank");
  //     })
  //     .catch((err) => {
  //       toast.error(
  //         err?.response?.data?.message
  //           ? err?.response?.data?.message
  //           : "Something Went Wrong",
  //       );
  //     });
  // };

  const handleDownLoadExcel = (id) => {
    setDownloadLoading(true);
    const payLoadData = { ...payload, };
    //payLoadData.DoctorID = id;
    axiosReport
      .post("commonReports/ReportDoctorSummary", payLoadData, {
        responseType: "blob",
      })
      .then((res) => {
        const fileType = res.headers["content-type"];
        const blob = new Blob([res.data], { type: fileType });
        if (fileType.includes("pdf")) {
          const url = window.URL.createObjectURL(blob);
          window.open(url, "_blank");
        }
        else {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${"DoctorAccountReport"}.xlsx`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
        toast.success("File downloaded successfully");
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Something went wrong"
        );
      })
      .finally(() => {
        setDownloadLoading(false);
      });
  };
  useEffect(() => {
    getAccessCentres(setCentreData);
    getBillingCategory(setCategory);
    getDepartment(setDepartmentData);
    getAccessRateType(setRateType);
    getDoctorSuggestion();
    getDropDownData("Specialization");
    getDropDownData("Doctor");
    getDropDownData("IsRef");
  }, []);
  return (
    <>
      <Accordion
        title={t("Doctor MIS Report")}
        defaultValue={true}
      >
      <div className="row pt-2 pl-2 pr-2 mt-1">
        <div className="col-sm-2">
          <DatePicker
            className="custom-calendar"
            name="DtFrom"
            value={new Date(payload?.DtFrom)}
            onChange={dateSelect}
            maxDate={new Date()}
            lable="From Date"
          />
        </div>
        <div className="col-sm-2">
          <DatePicker
            className="custom-calendar"
            name="DtTo"
            value={new Date(payload?.DtTo)}
            onChange={dateSelect}
            maxDate={new Date()}
            lable="To Date"
          />
        </div>
        <div className="col-sm-2">
          <MultiSelectComp
            options={CentreData}
            value={payload?.CentreID}
            name="CentreID"
            id="CentreID"
            placeholder=""
            onChange={handleSelectChange}
            label="Centre"
          />
        </div>
        <div className="col-sm-2">
          <MultiSelectComp
            options={RateType}
            value={payload.PanelID}
            name="PanelID"
            id="PanelID"
            placeholder=""
            onChange={handleSelectChange}
            label="RateType"
          />
        </div>
        <div className="col-sm-2">
          <MultiSelectComp
            options={Category}
            name={"CategoryID"}
            id="CategoryID"
            placeholder=""
            value={payload?.CategoryID}
            onChange={handleSelectChange}
            label="Category"
          />
        </div>
        <div className="col-sm-2">
          <MultiSelectComp
            onChange={handleSelectChange}
            name={"DepartmentID"}
            id="DepartmentID"
            placeholder=""
            value={payload?.DepartmentID}
            options={DepartmentData}
            label="Department"
          />
        </div>
      </div>
      <div className="row pt-1 pl-2 pr-2">
        <div className="col-sm-2">
          <MultiSelectComp
            onChange={handleSelectChange}
            name={"DoctorID"}
            id="DoctorID"
            placeholder=""
            value={payload?.DoctorID}
            options={[{ label: "Self", value: 1 }, ...DoctorData]}
            label="Doctor"
          />
        </div>
        <div className="col-sm-2 mt-1 d-flex mb-2">
          <div className="mt-1">
            <Form.Check
              type="switch"
              name="isChecked"
              id="isChecked"
              label="Show More"
              checked={payload?.isChecked}
              onChange={handleShow}
            />
          </div>
        </div>
      </div>
      <div className="row pt-1 pl-2 pr-2 mb-2">
        {payload.isChecked ? (
          <>
            <div className="col-sm-2">
              <div className="d-flex align-items-center">
                <div style={{ width: "40%" }}>
                  <SelectBox
                    className="form-control "
                    options={patientCountOptions}
                    style={{ width: "50%" }}
                    name="Parm1"
                    value={payload?.Parm1}
                    onChange={handleChange}
                    lable="PatientCount"
                    placeholder=""
                  />
                </div>{" "}
                <div style={{ width: "60%" }}>
                  <Input
                    className="form-control ml-2"
                    style={{ width: "50%" }}
                    type="number"
                    name="Val1"
                    value={payload?.Val1}
                    onChange={handleChange}
                    placeholder=""
                    lable="Value"
                  />
                </div>
              </div>
            </div>
            <div className="col-sm-2">
              <div className="d-flex align-items-center">
                <div style={{ width: "40%" }}>
                  <SelectBox
                    className="select_control"
                    options={patientCountOptions}
                    style={{ width: "50%" }}
                    name="Parm1"
                    value={payload?.Parm1}
                    onChange={handleChange}
                    lable="Ref Amount"
                    placeholder=""
                  />
                </div>
                <div style={{ width: "60%" }}>
                  <Input
                    className="select-input-box form-control input-sm"
                    style={{ width: "50%" }}
                    type="number"
                    name="ShareAmount2"
                    id="ShareAmount2"
                    value={payload?.ShareAmount2}
                    onChange={handleChange}
                    placeholder=""
                    lable="Value"
                  />
                </div>
              </div>
            </div>
            <div className="col-sm-1">
              <Input
                type="number"
                name="DoctorMobile"
                id="DoctorMobile"
                placeholder=""
                onInput={(e) => number(e, 10)}
                value={payload?.DoctorMobile}
                onChange={handleChange}
                lable="Mobile No"
              />
            </div>
            <div className="col-sm-2">
              <MultiSelectComp
                onChange={handleSelectChange}
                options={Speclization}
                name="Speclization"
                id="Speclization"
                placeholder=""
                value={payload?.Speclization}
                label="Doctor Spl"
              />
            </div>
            <div className="col-sm-2">
              <SelectBox
                options={[
                  { value: "IsRef", label: "IsRef" },
                  { value: "both", label: "BOTH" },
                  { value: "Y", label: "Y" },
                  { value: "N", label: "N" },
                ]}
                className="select_control"
                name="IsReff"
                id="IsReff"
                placeholder=""
                value={payload?.IsReff}
                onChange={handleChange}
                lable="IsReff"
              />
            </div>
          </>
        ) : (
          " "
        )}
      </div>
      <div className="row pt-1 pl-2 pr-2 pb-2">
        {loading ? (
          <Loading />
        ) : (
          <div className="col-sm-1">
            <SearchButton
              text={t("Search")}
              onClick={handleSave}
            />
          </div>
        )}
      </div>
      </Accordion>
      {/* </Accordion> */}
      <Accordion defaultValue={true}>
        <div className="row pt-2 pl-2 pr-2 pb-2 mt-1 align-items-center">
          <div className="col-auto mt-1 d-flex align-items-center" style={{ gap: "5px" }}>
            <input
              type="radio"
              value={1}
              checked={payload.reportType === 1}
              onChange={() => setPayload((prev) => ({ ...prev, reportType: 1 }))}
              name="reportType"
              id="reportTypePatient"
            />
            <label className="mb-0" htmlFor="reportTypePatient">{t("Patient Wise")}</label>
          </div>
          <div className="col-auto mt-1 d-flex align-items-center" style={{ gap: "5px" }}>
            <input
              type="radio"
              value={2}
              checked={payload.reportType === 2}
              onChange={() => setPayload((prev) => ({ ...prev, reportType: 2 }))}
              name="reportType"
              id="reportTypeTest"
            />
            <label className="mb-0" htmlFor="reportTypeTest">{t("Test Wise")}</label>
          </div>
          <div className="col-auto mt-1 d-flex align-items-center" style={{ gap: "5px" }}>
            <input
              type="radio"
              value={0}
              checked={payload.reportType === 0}
              onChange={() => setPayload((prev) => ({ ...prev, reportType: 0 }))}
              name="reportType"
              id="reportTypeSummary"
            />
            <label className="mb-0" htmlFor="reportTypeSummary">{t("Summary")}</label>
          </div>
          <div className="col-auto mt-1 d-flex align-items-center px-2 text-muted">|</div>
          <div className="col-auto mt-1 d-flex align-items-center" style={{ gap: "5px" }}>
            <input
              type="radio"
              value="0"
              checked={payload.downLoadData === "0"}
              onChange={handleChange}
              name="downLoadData"
              id="downLoadChoice1"
            />
            <label className="mb-0" htmlFor="downLoadChoice1">{t("PDF")}</label>
          </div>
          <div className="col-auto mt-1 d-flex align-items-center" style={{ gap: "5px" }}>
            <input
              type="radio"
              value="1"
              checked={payload.downLoadData === "1"}
              onChange={handleChange}
              name="downLoadData"
              id="downLoadChoice2"
            />
            <label className="mb-0" htmlFor="downLoadChoice2">{t("Excel")}</label>
          </div>
          <div className="col-auto mt-1">
            {payload.downLoadData === "1" ? (
              <CustomButton
                icon="excel"
                text={t("Download Excel")}
                onClick={handleDownLoadExcel}
                loading={downloadLoading}
              />
            ) : (
              <CustomButton
                icon="pdf"
                text={t("Download PDF")}
                onClick={handleDownLoadExcel}
                loading={downloadLoading}
              />
            )}
          </div>
        </div>
      </Accordion>{" "}
      <Accordion 
        title={t("Search Data")} 
        defaultValue={true}
        linkTo={"#"}
        linkTitle={
            <div
              className="link-title-container mt-2 d-none d-md-flex align-items-center"
              id="pr_id_11"
              style={{ flexWrap: "nowrap", overflow: "hidden", fontSize: "12px" }}
            >
              <label
                style={{
                  whiteSpace: "nowrap",
                  marginBottom: 0,
                }}
              >
                {t("Total Doctor Count")} :{" "}
                <span style={{ marginLeft: "6px" }}>
                  {tabledata?.length}
                </span>
              </label>
              |
              <label
                style={{
                  whiteSpace: "nowrap",
                  marginBottom: 0,
                }}
              >
                {t("Total Patient Count")} :{" "}
                <span style={{ marginLeft: "6px" }}>
                  {handlePatientCount()}
                </span>
              </label>
              |
              <label
                style={{
                  whiteSpace: "nowrap",
                  marginBottom: 0,
                }}
              >
                {t("Total Shared Amount")} :{" "}
                <span style={{ marginLeft: "6px" }}>
                  {handlePatientShareAmount()}
                </span>
              </label>
            </div>
        }
        >
        {tabledata.length > 0 && (
          <>
            <div className="d-flex my-2">
              {/* {hideSelectBox() && (
              <div className="col-md-2">
                <select className="select_control" name="">
                  <option hidden> Select </option>
                  {tabledata?.map(
                    (ele, index) =>
                      ele?.isSelect && (
                        <option key={index} value={ele?.Doctor}>
                          {ele?.Doctor}
                        </option>
                      )
                  )}
                </select>
              </div>
            )} */}
              {/* <div className={hideSelectBox() ? "col-md-10" : "col-md-12"}> */}
            </div>
            <div className="row px-2 ">
              <div className="col-12">
                <Tables>
                  <thead className="cf">
                    <tr>
                      <th>S.No</th>
                      <th>Ref</th>
                      <th>Count</th>
                      <th>Doc Name</th>
                      <th>Master Share</th>
                      <th>Phone</th>
                      <th>Mobile</th>
                      <th>Share Amount</th>
                      <th>Added On</th>
                      <th>View Patient</th>
                      {/* <th>Show</th> */}
                      <th>
                        {/* Select */}
                        <div>
                          <input
                            type="checkbox"
                            name="isSelect"
                            checked={
                              tabledata.length > 0
                                ? isChecked(
                                  "isSelect",
                                  tabledata,
                                  true,
                                ).includes(false)
                                  ? false
                                  : true
                                : false
                            }
                            onChange={(e, index) => {
                              handleChangeNew(e, index);
                            }}
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  {tabledata?.map((item, index) => (
                    <tbody>
                      <tr key={index}>
                        <td data-title={"S.No"}>{index + 1}</td>
                        <td data-title={"Ref"}>
                          <input
                            type="checkbox"
                            checked={
                              item?.Referal.toLowerCase() === "y" ? true : false
                            }
                            onChange={(e) =>
                              handleRef(e, item?.DoctorID, "DoctorRefferal")
                            }
                          />
                        </td>
                        <td data-title={"Count"}>{item.Total}</td>
                        <td data-title={"Count"}>{item?.Doctor}</td>
                        <td data-title={"Master Share"}>
                          <input
                            type="checkbox"
                            checked={
                              item?.MasterShare.toLowerCase() === "y"
                                ? true
                                : false
                            }
                            onChange={(e) =>
                              handleRef(e, item?.DoctorID, "ShareMasterUpdate")
                            }
                          />
                        </td>
                        <td data-title={"Phone"}>{item?.Phone}</td>
                        <td data-title={"Mobile"}>{item?.Mobile}</td>
                        <td data-title={"Share Amount"}>
                          {item?.SharedAmount}
                        </td>
                        <td data-title={"Added On"}>{item.AddedDate}</td>
                        <td data-title={"View Patient"}>
                          {patientLoading === item?.DoctorID ? (
                            <span
                              className="spinner-border spinner-border-sm text-info"
                              style={{ width: "1.3rem", height: "1.3rem" }}
                              role="status"
                            />
                          ) : (
                            <i
                              className="bi bi-people-fill text-info mb-0"
                              style={{ cursor: "pointer" }}
                              onClick={() => fetchPatientDetails(item?.DoctorID)}
                              title="View Patients"
                            ></i>
                          )}
                        </td>
                        {/* <td
                          data-title={"Show"}
                          onClick={() => table1data(index, item?.DoctorID)}
                        >
                          {loading1 === index ? (
                            <Loading />
                          ) : (
                            <i className="fa fa-search" />
                          )}
                        </td> */}
                        <td data-title={"#"}>
                          <input
                            type="checkbox"
                            checked={item?.isSelect}
                            name="isSelect"
                            onChange={(e) => DoctorSelectedHandle(e, index)}
                            disabled={item?.isChecked ? true : false}
                          />
                        </td>
                      </tr>
                    </tbody>
                  ))}
                </Tables>
              </div>
            </div>
          </>
        )}
      </Accordion>

        <Modal
          visible={showPatientModal}
          setVisible={setShowPatientModal}
          Header={t("Patient Details")}
          modalWidth="90vw"
        >
        <div className="p-2">
          {patientLoading !== -1 ? (
            <Loading />
          ) : patientData.length > 0 ? (
            <Tables>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Visit No</th>
                  <th>Patient Name</th>
                  <th>Age/Gender</th>
                  <th>Visit Date</th>
                  <th>Gross</th>
                  <th>Disc</th>
                  <th>Net</th>
                  <th>Due</th>
                  <th>Centre</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {patientData.map((patient, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{patient.VisitNo}</td>
                    <td>{patient.PName}</td>
                    <td>{`${patient.Age}/${patient.Gender}`}</td>
                    <td>{patient.VisitDate}</td>
                    <td>{patient.GrossAmount}</td>
                    <td>{patient.DiscountOnTotal}</td>
                    <td>{patient.NetAmount}</td>
                    <td>{patient.DueAmount}</td>
                    <td>{patient.CentreName}</td>
                    <td>
                      {testLoading === patient.VisitNo ? (
                        <span
                          className="spinner-border spinner-border-sm text-primary"
                          role="status"
                        />
                      ) : (
                        <i
                          className="bi bi-search text-primary"
                          style={{ cursor: "pointer" }}
                          title="View Tests"
                          onClick={() => fetchTestDataByVisitNo(patient.VisitNo)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          ) : (
            <div className="text-center p-3">{t("No Patients Found")}</div>
          )}
        </div>
      </Modal>

      <Modal
        visible={showTestModal}
        setVisible={setShowTestModal}
        Header={t("Test Details")}
        modalWidth="80vw"
      >
        <div className="p-2">
          {testData.length > 0 ? (
            <Tables>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Visit No</th>
                  <th>Patient Name</th>
                  <th>Item Name</th>
                  <th>Rate</th>
                  <th>Qty</th>
                  <th>Discount</th>
                  <th>Disc By Lab</th>
                  <th>Doctor Share</th>
                </tr>
              </thead>
              <tbody>
                {testData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{row.LedgerTransactionNo}</td>
                    <td>{row.PatientName}</td>
                    <td>{row.ItemName}</td>
                    <td>{row.Rate}</td>
                    <td>{row.Quantity}</td>
                    <td>{row.DiscountAmt}</td>
                    <td>{row.DiscountByLab}</td>
                    <td>{row.DoctorShare}</td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          ) : (
            <div className="text-center p-3">{t("No Test Data Found")}</div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default DoctorMisReportPage;
