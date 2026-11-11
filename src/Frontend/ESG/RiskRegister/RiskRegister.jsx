import React, { useEffect, useState } from "react";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../../components/formComponent/Input";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import DatePicker from "../../../components/formComponent/DatePicker";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import Heading from "../../../components/UI/Heading";
import { CancelButton, CustomButton, SaveButton, SearchButton } from "../../../components/UI/CustomButton";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../utils/axiosInstance";
import moment from "moment";
import { validateRequiredFields } from "../../../utils/helpers";
import Tables from "../../../components/UI/customTable";
import NoRecordFound from "../../../components/formComponent/NoRecordFound";
import { Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import './RiskRegsiter.css';
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";

/* ══════════════════════════════════════════════
   RISK REGISTER
══════════════════════════════════════════════ */
const RiskRegister = () => {
  const { t } = useTranslation();

  // ─── View toggle: "ENTRY" | "RECORDS" ───────────────────────────────────────
  const [viewMode, setViewMode] = useState("ENTRY");

  // ─── Shared centre options (used in both Entry & Records) ────────────────────
  const [centreOptions, setCentreOptions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const statusOptions = [
    { label: "In Progress", value: "InProgress" },
    { label: "Open",        value: "Open"        },
    { label: "Closed",      value: "Closed"      },
  ];

  const riskLevelOptions = [
    { label: "Extreme Risk (20-24)", value: "Extreme" },
    { label: "High Risk (12-19)",    value: "High"    },
    { label: "Medium Risk (6-11)",   value: "Medium"  },
    { label: "Low Risk (1-5)",       value: "Low"     },
  ];

  const colorCodingData = [
     {
    id: "ALL",
    labelKey: "All",
    color: "#d9d9d9",
  },
  {
    id: "InProgress",
    labelKey: "In Progress",
    color: "#87CEEB",
  },
  {
    id: "Open",
    labelKey: "Open",
    color: "#ffe58f",
  },
  {
    id: "Closed",
    labelKey: "Closed",
    color: "#75f975",
  },
];

  // ══════════════════════════════════════════════
  // ENTRY FORM STATE
  // ══════════════════════════════════════════════
  const [errors, setErrors]         = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  const initialPayload = {
    id:                   null,
    riskTitle:            "",
    actionPlan:           "",
    centreId:             "",
    status:               "",
    riskLevel:            "",
    riskRegistrationDate: null,
  };
  const [payload, setPayload] = useState(initialPayload);

  // ─── Form handlers ───────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleReactChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value ?? "" }));
  };

  const handleDateChange = (value, name) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setPayload(initialPayload);
    setErrors({});
    setIsEditMode(false);
    setSelectedStatus("ALL");
     if (viewMode === "RECORDS") {
      setFilteredData(tableData);
    }
  };

  // ─── Edit: load row into form & switch to Entry ──────────────────────────────
  const handleEdit = (risk) => {
    setPayload({
      id:                   risk?.id,
      riskTitle:            risk?.riskTitle,
      actionPlan:           risk?.actionPlan,
      centreId:             risk?.centreId,
      status:               risk?.status,
      riskLevel:            risk?.riskLevel ?? "",
      riskRegistrationDate: risk?.riskRegistrationDate && risk.riskRegistrationDate !== ""
        ? new Date(risk.riskRegistrationDate)
        : null,
    });
    setIsEditMode(true);
    setViewMode("ENTRY");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Validation ──────────────────────────────────────────────────────────────
  const requiredFields = ["riskTitle", "actionPlan", "centreId", "status", "riskLevel", "riskRegistrationDate"];

  // ─── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const validationErrors = validateRequiredFields(payload, requiredFields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    axiosInstance
      .post("ESG/AddOrUpdateRisk", {
        centreId:             payload.centreId,
        riskTitle:            payload.riskTitle,
        actionPlan:           payload.actionPlan,
        status:               payload.status,
        riskLevel:            payload.riskLevel,
        RegistrationDate: payload.riskRegistrationDate
          ? moment(payload.riskRegistrationDate).format("YYYY-MM-DDTHH:mm:ss")
          : null,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          handleReset();
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  // ─── Update ──────────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    const validationErrors = validateRequiredFields(payload, requiredFields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    axiosInstance
      .post("ESG/AddOrUpdateRisk", {
        id:                   payload.id,
        centreId:             payload.centreId,
        riskTitle:            payload.riskTitle,
        actionPlan:           payload.actionPlan,
        status:               payload.status,
        riskLevel:            payload.riskLevel,
        RegistrationDate: payload.riskRegistrationDate
          ? moment(payload.riskRegistrationDate).format("YYYY-MM-DDTHH:mm:ss")
          : null,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          handleReset();
          setIsEditMode(false);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  // ══════════════════════════════════════════════
  // RECORDS / SEARCH STATE
  // ══════════════════════════════════════════════
  const initialSearch = {
    CentreId: [],
    FromDate: new Date(),
    ToDate:   new Date(),
    status:   "",
  };
  const [searchPayload, setSearchPayload] = useState(initialSearch);
  const [tableData,     setTableData]     = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // ─── Search field handlers (mirrors WasteManagementSearch) ───────────────────
  const handleSearchDateChange = (value, name) => {
    setSearchPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (name, value) => {
    setSearchPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchReactChange = (name, e) => {
    setSearchPayload((prev) => ({ ...prev, [name]: e?.value ?? "" }));
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);

    if (status === "ALL") {
      setFilteredData(tableData);
      return;
    }

    const filtered = tableData.filter(
      (item) => item?.status === status
    );

    setFilteredData(filtered);
  };

  // ─── Search API ──────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    setSearchLoading(true);
    const apiPayload = {
      fromDate: searchPayload.FromDate,
      toDate:   searchPayload.ToDate,
      centreId: searchPayload.CentreId,       // array of values from MultiSelect
      status:   searchPayload.status || null,
    };

    try {
      const res = await axiosInstance.post("ESG/GetRiskList", apiPayload);
      const data = res?.data;
      if (data?.success) {
        const mapped = (data?.message || []).map((item) => ({
          id:                   item?.Id,
          riskTitle:            item?.RiskTitle,
          actionPlan:           item?.ActionPlan,
          centreId:             item?.CentreId,
          centreName:           item?.CentreName || "",
          status:               item?.Status,
          riskLevel:            item?.RiskLevel || "",
          riskRegistrationDate: item?.RegistrationDate?.value
            ? moment(item.RegistrationDate.value).format("DD-MMM-YYYY")
            : "",
          createdBy:            item?.CreatedByName,
          createdOn:            item?.dtEntry,
          updatedBy:            item?.UpdatedByName,
          updatedOn:            item?.dtUpdate,
        }));
        setTableData(mapped);
        setFilteredData(mapped);
        setSelectedStatus("ALL");
        if (mapped.length === 0) toast.info("No records found!");
      } else {
        setTableData([]);
        setFilteredData([]);
        setSelectedStatus("ALL");
        toast.error(data?.message || "No records found!");
      }
    } catch (err) {
      console.error("Error fetching risk list", err);
      toast.error("Error Occurred");
    } finally {
      setSearchLoading(false);
    }
  };

  // ══════════════════════════════════════════════
  // SHARED: fetch centres on mount
  // ══════════════════════════════════════════════
  const getCentreOptions = async () => {
    try {
      const res = await axiosInstance.get("Centre/getAccessCentres");
      if (res?.data?.success) {
        const options = (res?.data?.message || []).map((item) => ({
          value: item.CentreID,
          label: item.Centre,
        }));
        setCentreOptions(options);
      }
    } catch (err) {
      toast.error("Error loading centres");
    }
  };

  useEffect(() => {
    getCentreOptions();
  }, []);

  useEffect(() => {
    if (selectedStatus === "ALL") {
      setFilteredData(tableData);
    } else {
      setFilteredData(
        tableData.filter(
          (item) => item?.status === selectedStatus
        )
      );
    }
  }, [tableData, selectedStatus]);

  // ─── View toggle ─────────────────────────────────────────────────────────────
  const handleViewToggle = (mode) => {
    setViewMode(mode);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Heading: "Risk Register" left | Entry / Records right ── */}
      <Heading
        title={t("Risk Register")}
        secondTitle={
          <div className="d-flex flex-nowrap" style={{ gap: "5px" }}>
            <CustomButton
              text={t("Entry")}
              icon="save"
              onClick={() => handleViewToggle("ENTRY")}
              disabled={viewMode === "ENTRY"}
            />
            <CustomButton
              text={t("Records")}
              icon="back"
              onClick={() => handleViewToggle("RECORDS")}
              disabled={viewMode === "RECORDS"}
            />
          </div>
        }
      />

      <div className="row pt-2 m-0">
        <div className="col-12">

          {/* ══ ENTRY VIEW ══════════════════════════════════════════════════════ */}
          {viewMode === "ENTRY" && (
            // <Accordion
            //   name={t("Risk Register")}
            //   defaultValue={true}
            //   isBreadcrumb={true}
            // >
              <div className="row pb-2">

                {/* Identified Risk */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                  <Input
                    type="text"
                    placeholder=""
                    lable={t("Identified Risk")}
                    id="riskTitle"
                    name="riskTitle"
                    value={payload?.riskTitle}
                    onChange={handleChange}
                  />
                  {payload?.riskTitle === "" && (
                    <span className="error-message">{errors?.riskTitle}</span>
                  )}
                </div>

                {/* Centre */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                  <ReactSelect
                    name="centreId"
                    id="centreId"
                    removeIsClearable={true}
                    dynamicOptions={centreOptions}
                    placeholderName={t("Centre")}
                    value={payload?.centreId}
                    onChange={handleReactChange}
                  />
                  {payload?.centreId === "" && (
                    <span className="error-message">{errors?.centreId}</span>
                  )}
                </div>

                {/* Risk Level */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                  <ReactSelect
                    name="riskLevel"
                    id="riskLevel"
                    removeIsClearable={true}
                    dynamicOptions={riskLevelOptions}
                    placeholderName={t("Risk Level")}
                    value={payload?.riskLevel}
                    onChange={handleReactChange}
                  />
                  {payload?.riskLevel === "" && (
                    <span className="error-message">{errors?.riskLevel}</span>
                  )}
                </div>

                {/* Risk Registration Date */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                  <DatePicker
                    name="riskRegistrationDate"
                    id="riskRegistrationDate"
                    className="custom-calendar"
                    lable={t("Registration Date")}
                    value={payload?.riskRegistrationDate}
                    onChange={handleDateChange}
                  />
                  {!payload?.riskRegistrationDate && (
                    <span className="error-message">{errors?.riskRegistrationDate}</span>
                  )}
                </div>

                {/* Status */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                  <ReactSelect
                    name="status"
                    id="status"
                    removeIsClearable={true}
                    dynamicOptions={statusOptions}
                    placeholderName={t("Status")}
                    value={payload?.status}
                    onChange={handleReactChange}
                  />
                  {payload?.status === "" && (
                    <span className="error-message">{errors?.status}</span>
                  )}
                </div>

                {/* Action Plan */}
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <div className="form-floating">
                  <textarea
                    className="form-control"
                    id="actionPlan"
                    name="actionPlan"
                    placeholder={t("Action Plan")}
                    value={payload?.actionPlan}
                    onChange={handleChange}
                    style={{ height: "80px !important" }}
                  />
                   {/* <label htmlFor="actionPlan">{t("Action Plan")}</label> */}
                </div>
                {payload?.actionPlan === "" && (
                  <span className="error-message">{errors?.actionPlan}</span>
                )}
              </div>
              {/* </div> */}

                {/* Save / Update / Reset */}
           <div className="col-12 col-sm-6 col-md-2 my-1">
              <SaveButton
                  text={isEditMode ? "Update" : "Save"}
                  onClick={isEditMode ? handleUpdate : handleSave}
                  className="mx-2"
                />
                <CancelButton
                  text="Reset"
                  onClick={handleReset}
                  className="mx-2"
                />
             
           </div>
              

              </div>
            // </Accordion>
          )}

          {/* ══ RECORDS VIEW ════════════════════════════════════════════════════ */}
          {viewMode === "RECORDS" && (
            <>
              {/* ── Search filters row (mirrors WasteManagementSearch) ── */}
              <div className="row">

                {/* Multi-select Centres */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                  <MultiSelectComp
                    label="All Centre"
                    options={centreOptions}
                    value={searchPayload.CentreId}
                    name="CentreId"
                    id="CentreId"
                    onChange={handleMultiSelectChange}
                    lable={t("Select Centre")}
                  />
                </div>

                {/* Status */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                  <ReactSelect
                    name="status"
                    id="searchStatus"
                    dynamicOptions={statusOptions}
                    removeIsClearable={false}
                    placeholderName={t("Select Status")}
                    lable={t("Status")}
                    value={searchPayload.status}
                    onChange={handleSearchReactChange}
                  />
                </div>

                {/* From Date */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                  <DatePicker
                    name="FromDate"
                    id="FromDate"
                    className="custom-calendar"
                    lable={t("From Date")}
                    value={searchPayload.FromDate}
                    onChange={handleSearchDateChange}
                  />
                </div>

                {/* To Date */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                  <DatePicker
                    name="ToDate"
                    id="ToDate"
                    className="custom-calendar"
                    lable={t("To Date")}
                    value={searchPayload.ToDate}
                    onChange={handleSearchDateChange}
                    minDate={searchPayload.FromDate}
                  />
                </div>

                {/* Search Button */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                  <SearchButton
                    text={t("Search")}
                    onClick={handleSearch}
                    disabled={searchLoading}
                  />
                </div>

              </div>

              {/* ── Results table ── */}
              <Heading title={t("Risk Records")} 
              defaultValue={true}
              secondTitle={
                <div className="d-flex justify-content-end">
                  {colorCodingData?.map(({ color, labelKey, id }) => (
                                 <ColorCodingSearch
                                   key={id}
                                   color={color}
                                   label={t(labelKey)}
                                   onClick={() => handleStatusFilter(id)}
                                   cursor="pointer"
                                 />
                               ))}
                </div>
              }
              />
                {filteredData.length > 0 ? (
                  <div className="row">
                    <div className="col-12">
                      <Tables>
                        <thead className="cf">
                          <tr>
                            <th>{t("Sr. No")}</th>
                            <th>{t("Centre")}</th>
                            <th>{t("Identified Risk")}</th>
                            <th>{t("Action Plan")}</th>
                            
                            <th>{t("Risk Level")}</th>
                            <th>{t("Registration Date")}</th> 
                            {/* <th>{t("Status")}</th> */}
                            <th>{t("Created By")}</th>
                            <th>{t("Created On")}</th>
                            <th>{t("Updated By")}</th>
                            <th>{t("Updated On")}</th>
                            <th>{t("Edit")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((item, i) => {

                            let rowColor = "";

                            switch (item?.status) {
                              case "InProgress":
                                rowColor = "#87CEEB"; // Blue
                                break;

                              case "Open":
                                rowColor = "#ffe58f"; // Yellow
                                break;

                              case "Closed":
                                rowColor = "#75f975"; // Green
                                break;

                              default:
                                rowColor = "white";
                            }

                            return (
                              <tr
                                key={i}
                                className={`risk-row ${item?.status?.toLowerCase()}`}
                                style={{
                                  backgroundColor: rowColor,
                                  backgroundImage: "none",
                                  color: "black",
                                }}
                              >
                                <td data-title={t("Sr. No")}>{i + 1}</td>
                                <td data-title={t("Centre")}>{item?.centreName}</td>
                                <td data-title={t("Risk Title")}>{item?.riskTitle}</td>
                                <td data-title={t("Action Plan")}>{item?.actionPlan}</td>
                                
                                <td data-title={t("Risk Level")}>{item?.riskLevel}</td>
                                <td data-title={t("Registration Date")}>{item?.riskRegistrationDate}</td>
                                {/* <td data-title={t("Status")}>{item?.status}</td> */}
                                <td data-title={t("Created By")}>{item?.createdBy}</td>
                                <td data-title={t("Created On")}>{item?.createdOn}</td>
                                <td data-title={t("Updated By")}>{item?.updatedBy}</td>
                                <td data-title={t("Updated On")}>{item?.updatedOn}</td>
                                <td data-title={t("Edit")}>
                                  <button
                                    className="btn btn-xs btn-primary"
                                    title={t("Edit")}
                                    onClick={() => handleEdit(item)}
                                  >
                                    <i className="fa fa-edit"></i>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Tables>
                    </div>
                  </div>
                ) : (
                  <NoRecordFound />
                )}
              {/* </Accordion> */}
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default RiskRegister;
