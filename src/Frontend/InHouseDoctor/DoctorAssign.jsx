import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getAccessCentresReports } from "../../utils/NetworkApi/commonApi";
import Accordion from "@app/components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import { axiosInstance } from "../../utils/axiosInstance";
import moment from "moment";
import { Button, Tab } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import DoctorAssignSummaryTable from "./DoctorAssignTables/DoctorAssignSummaryTable";
import DoctorAssignDeparmentTable from "./DoctorAssignTables/DoctorAssignDeparmentTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { notify } from "../../utils/utils";

const DoctorAssign = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [formData, setFormData] = useState({
    Status: "",
    LabNo: "",
    BarcodeNo: "",
    PName: "",
    Mobile: "",
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    DoctorID: "",
    CaseAssignedTo: "",
    Department: "",
  });

  const [doctor, setDoctor] = useState([]);
  const [deparment, setDeparment] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [TableData, setTableData] = useState([]);

  const [viewMode, setViewMode] = useState("PATIENT");

  const [DeparmentData, setDeparmentData] = useState([]);
  const [SummaryTable, setSummaryTable] = useState([]);

  const handleReactChange = (name, e) => {
    setFormData((prev) => ({ ...prev, [name]: e?.value }));
  };

  const dateSelect = (date, name) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const handleDoctorChange = (selectedOption, rowIndex) => {
    setTableData((prev) =>
      prev.map((row, i) =>
        i === rowIndex
          ? {
            ...row,
            CaseAssignedTo: selectedOption
              ? String(selectedOption.value)
              : "",
            _dirty: true,
          }
          : row
      )
    );
  };

  const getDepartmentById = async () => {
    try {
      setLoad(true);
      const [doctorRes, departmentRes] = await Promise.all([
        axiosInstance.post("CommonController/Fetchprocedure", {
          typeName: "inHouse_Doctorsanddepartment",
          params: ["Doctor", "0"],
        }),
        axiosInstance.post("CommonController/Fetchprocedure", {
          typeName: "inHouse_Doctorsanddepartment",
          params: ["Department", "0"],
        }),
      ]);

      const doctorListRes =
        doctorRes?.data?.data?.map((item) => ({
          label: item?.EmployeeName,
          value: item?.EmployeeID,
        })) || [];

      const departmentListRes =
        departmentRes?.data?.data?.map((item) => ({
          label: item?.Department,
          value: item?.DepartmentID,
        })) || [];

      setDoctor(doctorListRes);
      setDeparment(departmentListRes);
    } catch (error) {
      setLoad(false);
      console.error("Error fetching doctors/departments:", error);
    } finally {
      setLoad(false);
    }
  };

  const searchPayload = {
    LabNo: formData.LabNo,
    BarcodeNo: formData.BarcodeNo,
    PName: formData?.PName,
    Mobile: formData.Mobile,
    FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
    ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
    CentreID: formData.CentreID,
    DoctorID: String(formData.DoctorID),
    CaseAssignedTo: formData?.CaseAssignedTo,
    Department: String(formData?.Department),
  };

  const getSearchData = async (Status) => {
    const payload = {
      ...searchPayload,
      Status,
    };

    try {
      setLoad(true);
      const res = await axiosInstance.post("InHouseDoctor/SearchData", payload);
      const formattedData = res?.data?.message.map((row) => ({
        ...row,
        CaseAssignedTo: row.CaseAssignedTo ? String(row.CaseAssignedTo) : "",
        _dirty: false,
      }));

      setTableData(formattedData);
    } catch (err) {
      console.error("Search Data Error:", err);
      setTableData([]);
    } finally {
      setLoad(false);
    }
  };

  const getSearchSummary = async () => {
    try {
      setLoad(true);

      const res = await axiosInstance.post(
        "InHouseDoctor/SearchSummary",
        searchPayload
      );

      setSummaryTable(res?.data?.message || []);
    } catch (err) {
      console.error("Search Summary API Error:", err);
      setSummaryTable([]);
    } finally {
      setLoad(false);
    }
  };
  const getSearchDepartment = async () => {
    try {
      setLoad(true);

      const res = await axiosInstance.post(
        "InHouseDoctor/DoctorWiseCaseAssignedSummary",
        searchPayload
      );

      setDeparmentData(res?.data?.message || []);
    } catch (err) {
      console.error("Search Summary API Error:", err);
      setDeparmentData([]);
    } finally {
      setLoad(false);
    }
  };

  const handleSave = async () => {
    const payload = TableData.filter((row) => row._dirty).map((row) => ({
      TestID: String(row.TestID),
      RecommondedId: row.CaseAssignedTo || null,
    }));

    if (!payload.length) {
      notify("No row updated", "warn");
      return;
    }

    try {
      setLoad(true);
      const res = await axiosInstance.post("InHouseDoctor/SaveCaseAssignment", {
        data: payload,
      });
      notify(res?.data?.message, "success");
      getSearchData();
    } catch (error) {
      console.log(error);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    getDepartmentById();
    getAccessCentresReports(setCentreData);
  }, []);

  return (
    <>
      <Accordion
        name={t("Patient Case Assignment")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <Input
              type="text"
              placeholder=" "
              lable="LabNo"
              id="LabNo"
              name="LabNo"
              value={formData?.LabNo}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              placeholder=" "
              lable="BarcodeNo"
              id="BarcodeNo"
              name="BarcodeNo"
              value={formData?.BarcodeNo}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              placeholder=" "
              lable="PName"
              id="PName"
              name="PName"
              value={formData?.PName}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              placeholder=" "
              lable="Mobile"
              id="Mobile"
              name="Mobile"
              value={formData?.Mobile}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-3 col-md-2 mb-2">
            <DatePicker
              name="FromDate"
              id="FromDate"
              value={formData?.FromDate}
              onChange={dateSelect}
              maxDate={new Date()}
              placeholder=""
              lable={t("From Date")}
              className={"w-100"}
            />
          </div>
          <div className="col-sm-3 col-md-2 mb-2">
            <DatePicker
              name="ToDate"
              id="ToDate"
              value={formData?.ToDate}
              onChange={dateSelect}
              maxDate={new Date()}
              placeholder=""
              lable={t("To Date")}
              className={"w-100"}
            />
          </div>
          <div className="col-sm-3 col-md-2 mb-2">
            <ReactSelect
              dynamicOptions={[{ label: "All", value: "0" }, ...CentreData]}
              isShowBorder={true}
              name="CentreID"
              lable={t("Centre")}
              id="CentreID"
              placeholderName={t("Centre")}
              value={formData?.CentreID}
              onChange={handleReactChange}
            />
          </div>
          <div className="col-sm-3 col-md-2 mb-2">
            <ReactSelect
              dynamicOptions={[{ label: "Select", value: "" }, ...doctor]}
              isShowBorder={true}
              name="DoctorID"
              lable={t("Doctor")}
              id="DoctorID"
              placeholderName={t("Doctor")}
              value={formData?.DoctorID}
              onChange={handleReactChange}
            />
          </div>
          <div className="col-sm-3 col-md-2 mb-2">
            <ReactSelect
              dynamicOptions={[{ label: "Select", value: "" }, ...deparment]}
              isShowBorder={true}
              name="Department"
              lable={t("Department")}
              id="Department"
              placeholderName={t("Department")}
              value={formData?.Department}
              onChange={handleReactChange}
            />
          </div>
          <div
            style={{ gap: "6px" }}
            className="d-flex px-2  d-flex justify-content-start"
          >
            <Button
              className="rounded"
              onClick={() => {
                setViewMode("PATIENT");
                getSearchData();
              }}
            >
              Search
            </Button>
          </div>
          <div
            style={{ gap: "6px" }}
            className="d-flex px-2  d-flex justify-content-start"
          >
            <Button
              className="rounded"
              onClick={() => {
                setViewMode("SUMMARY");
                getSearchSummary();
              }}
            >
              Summary
            </Button>
          </div>
          <div
            style={{ gap: "6px" }}
            className="d-flex px-2  d-flex justify-content-start"
          >
            <Button
              className="rounded"
              onClick={() => {
                setViewMode("DEPARTMENT");
                getSearchDepartment();
              }}
            >
              DoctorWiseSummary
            </Button>
          </div>
          <div
            onClick={() => {
              getSearchData("0");
              setViewMode("PATIENT");
            }}
            className="col-md-1 d-flex"
          >
            <button
              className="statusConfirmed"
              style={{ backgroundColor: "White" }}
            ></button>
            <label className="reprintLable" style={{ cursor: "pointer" }}>
              {t("Pending")}
            </label>
          </div>
          <div
            onClick={() => {
              getSearchData("1");
              setViewMode("PATIENT");
            }}
            className="col-md-1 d-flex"
          >
            <button
              className="statusConfirmed"
              style={{ backgroundColor: "#32cd8f" }}
            ></button>
            <label className="reprintLable" style={{ cursor: "pointer" }}>
              {t("Assigned")}
            </label>
          </div>
          <div
            onClick={() => {
              getSearchData("2");
              setViewMode("PATIENT");
            }}
            className="col-md-1 d-flex"
          >
            <button
              className="statusConfirmed"
              style={{ backgroundColor: "#caad0d" }}
            ></button>
            <label className="reprintLable" style={{ cursor: "pointer" }}>
              {t("Re-Assigned")}
            </label>
          </div>
        </div>
        {viewMode === "PATIENT" && (
          <Accordion title={t("Patient Details Found")} defaultValue={true}>
            <>
              <div className="col-12">
                <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <thead style={{ position: "sticky", top: 0, }}>
                    <tr>
                      <th>{t("Sr.No.")}</th>
                      <th>{t("Centre")}</th>
                      <th>{t("Reg Date/Time")}</th>
                      <th>{t("Lab No")}</th>
                      <th>{t("PName")}</th>
                      <th>{t("Age/Sex")}</th>
                      <th>{t("Mobile")}</th>
                      <th>{t("Doctor")}</th>
                      <th>{t("Dept")}</th>
                      <th>{t("Investigation")}</th>
                      <th>{t("AllowCase")}</th>
                      <th style={{ width: "15%" }}>{t("Assigned By")}</th>
                      <th>{t("Amount")}</th>
                      <th>{t("ShareAmount")}</th>
                    </tr>
                  </thead>
                  {TableData.length > 0 ? (
                    TableData.map((ele, index) => (
                      <tbody key={index}>
                        <tr
                          style={{
                            backgroundColor: ele?.rowColor || "transparent",
                          }}
                        >
                          <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                          <td data-title={t("Centre")}>{ele?.Centre}</td>
                          <td data-title={t("RegDate")}>{ele?.RegDate}</td>
                          <td data-title={t("LabNo")}>{ele?.LabNo}</td>
                          <td data-title={t("PName")}>{ele?.PName}</td>
                          <td data-title={t("AgeGender")}>{ele?.AgeGender}</td>
                          <td data-title={t("Mobile")}>{ele?.Mobile}</td>
                          <td data-title={t("DocName")}>{ele?.DocName}</td>
                          <td data-title={t("Department")}>
                            {ele?.Department}
                          </td>
                          <td data-title={t("Investigation")}>
                            {ele?.Investigation}
                          </td>
                          <td data-title={t("AllowCase")}>{ele?.AllowCase}</td>
                          <td data-title={t("CaseAssignedTo")}>
                            <ReactSelect
                              dynamicOptions={doctor}
                              isShowBorder={true}
                              placeholderName="Select"
                              name="DoctorID"
                              value={ele.CaseAssignedTo}
                              onChange={(_, selected) =>
                                handleDoctorChange(selected, index)
                              }
                            />
                          </td>
                          <td data-title={t("Amount")}>{ele?.Amount}</td>
                          <td data-title={t("shareAmount")}>
                            {ele?.DoctorShare || ""}
                          </td>
                        </tr>
                      </tbody>
                    ))
                  ) : (
                    <tbody>
                      <tr>
                        <td colSpan={17} className="text-center">
                          <NoRecordFound />
                        </td>
                      </tr>
                    </tbody>
                  )}
                </Tables>
              </div>
            </>
            <div className="col-sm-1 mt-2">
              {load ? (
                <Loading />
              ) : (
                <button
                  className="btn btn-block btn-success btn-sm"
                  onClick={handleSave}
                >
                  {t("Save")}
                </button>
              )}
            </div>
          </Accordion>
        )}

        {viewMode === "SUMMARY" && (
          <Accordion title={t("Patient Details Found")} defaultValue={true}>
            <DoctorAssignSummaryTable tableData={SummaryTable} />
          </Accordion>
        )}

        {viewMode === "DEPARTMENT" && (
          <Accordion title={t("Patient Details Found")} defaultValue={true}>
            <DoctorAssignDeparmentTable tableData={DeparmentData} />{" "}
          </Accordion>
        )}
      </Accordion>
    </>
  );
};

export default DoctorAssign;
