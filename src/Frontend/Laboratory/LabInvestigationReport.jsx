import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import Loading from "../../components/loader/Loading";
import { getAccessCentresReports, getAccessDataRateReport, getDepartmentReports } from "../../utils/NetworkApi/commonApi";
import { Form } from "react-bootstrap";

const dateTypeOptions = [
    { label: "Registration Date", value: "plo.Date" },
    { label: "Department Receive Date", value: "plo.SampleReceiveDate" },
    { label: "Sample Collection Date", value: "plo.SampleCollectionDate" },
    { label: "Approval Date", value: "plo.ApprovedDate" },
];

const testCenterOptions = [
    { label: "Booking Center", value: "BookingCenter" },
    { label: "Test Center", value: "TestCenter" },
];

const labOrPackageOptions = [
    { label: "Lab", value: "Lab" },
    { label: "Package", value: "Package" },
];

const reportTypeOptions = [
    { label: "Summary", value: "Lab_Summary", category: "Lab" },
    { label: "Detail Report", value: "Lab_Detail", category: "Lab" },
    { label: "Monthly Test Count Report", value: "Monthly_Test_Count_Report", category: "Lab" },
    { label: "Monthly Amount Report", value: "Monthly_Amount_Report", category: "Lab" },
    { label: "Summary", value: "Package_Summary", category: "Package" },
    { label: "Detail Report", value: "Package_Detailed", category: "Package" },
];

const defaultFormData = {
    Centre: [],
    RateType:[],
    DepartmentID: [],
    TestID: [],
    labOrPackage: labOrPackageOptions[0].value,
    reportType: reportTypeOptions[0].value,
    dateType: dateTypeOptions[0].value,
    TestCentreID: testCenterOptions[0].value,
    FromDate: new Date(),
    ToDate: new Date(),
    TopRecordsEnabled: false,
    TopRecords: "",
};

const LabInvestigationReport = () => {
    const { t } = useTranslation();

    const [Department, setDepartment] = useState([]);
    const [ItemList, setItemList] = useState([]);
    const [CentreData, setCentreData] = useState([]);
    const [rateType, setRateType] = useState([]);
    const [formData, setFormData] = useState(defaultFormData);
    const [loadingSearch, setLoadingSearch] = useState(false);
     

    const getRateItemList = (departmentId = 0) => {
        const id = Array.isArray(departmentId) ? (departmentId[0] || 0) : departmentId;
        axiosInstance
            .post("RateList/getItemList", {
                DepartmentID: Number(id) || 0,
                BillingCategory: 0,
            })
            .then((res) => {
                const val = res.data.message.map((ele) => ({
                    value: ele?.InvestigationID,
                    label: ele?.TestName,
                }));
                setItemList(val);
            })
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        getDepartmentReports((data) => {
            setDepartment(data);
        });
        getAccessCentresReports(setCentreData);
    }, []);

    // Department change hone par items reload + TestID reset
    useEffect(() => {
        getRateItemList(formData.DepartmentID);
        setFormData((prev) => ({ ...prev, TestID: [] }));
    }, [formData.DepartmentID]);

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleReactSelectChange = (name, e) => {
        setFormData((prev) => ({ ...prev, [name]: e?.value ?? "" }));
    };

    const handleSelectMultiChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

     useEffect(() => {
            getAccessDataRateReport(setRateType, formData.Centre);
        }, [formData.Centre]);

    const dateSelect = (date, name) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
    };

    // ─── Payload builder ─────────────────────────────────────────────────────

    const buildPayload = (reportFormat) => {
        const fmt = (d) =>
            d instanceof Date
                ? `${d.getDate().toString().padStart(2, "0")}-${d
                    .toLocaleString("en-GB", { month: "short" })
                    .toUpperCase()}-${d.getFullYear()}`
                : d;

        const base = {
            fromDate: fmt(formData.FromDate),
            toDate: fmt(formData.ToDate),
            reportFormat: reportFormat,
            labOrPackage: formData.labOrPackage === "Lab" ? "0" : "1",
            reportType: formData.reportType || "",
            TestCentreID: formData.TestCentreID === "BookingCenter" ? "0" : "1",
            dateType: formData.dateType || "",
            centreType: "1",
            centres: Array.isArray(formData.Centre) ? formData.Centre.map(Number) : [],
            investigationIds: Array.isArray(formData.TestID) ? formData.TestID.map(Number) : [],
            departmentID: Array.isArray(formData.DepartmentID) ? formData.DepartmentID.map(Number) : [],
            RateType: formData.RateType,
        };

        if (formData.TopRecordsEnabled) {
            return {
                ...base,
                reportType: "Top_High_Volume",
                topRecordCount: Number(formData.TopRecords) || 0,
            };
        }

        return base;
    };

    const getEndpoint = () =>
        formData.TopRecordsEnabled
            ? "CombineLabReport/TopHighVolumeTestReport/TopHighVolumeTestReport"
            : "CombineLabReport/InvestigationAnalysisReport/InvestigationAnalysisReport";

    const handlePDF = async () => {
        setLoadingSearch(true);
        try {
            const res = await axiosReport.post(
                getEndpoint(),
                buildPayload("Pdf"),
                { responseType: "blob" }
            );

            const contentType = res.headers?.["content-type"] || "";
            if (res.data.size === 0 || contentType.includes("application/json")) {
                const text = await res.data.text();
                const json = JSON.parse(text);
                toast.info(json?.message || "No Record Found");
                return;
            }

            const file = new Blob([res.data], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(file);
            const newWindow = window.open(fileURL, "_blank");
            if (!newWindow) {
                toast.error("Please allow popups for this website");
            }
        } catch (err) {
            console.error(err);
            if (err?.response?.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const json = JSON.parse(reader.result);
                        toast.error(json?.message || "Error fetching PDF report");
                    } catch (e) {
                        toast.error("Error fetching PDF report");
                    }
                };
                reader.readAsText(err.response.data);
            } else {
                toast.error(err?.response?.data?.message || err?.message || "Error fetching PDF report");
            }
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleExcel = async () => {
        setLoadingSearch(true);
        try {
            const res = await axiosReport.post(
                getEndpoint(),
                buildPayload("Excel"),
                { responseType: "blob" }
            );

            const contentType = res.headers?.["content-type"] || "";
            if (res.data.size === 0 || contentType.includes("application/json")) {
                const text = await res.data.text();
                const json = JSON.parse(text);
                toast.info(json?.message || "No Record Found");
                return;
            }

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "InvestigationAnalysisReport.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(err);
            if (err?.response?.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const json = JSON.parse(reader.result);
                        toast.error(json?.message || "Error fetching Excel report");
                    } catch (e) {
                        toast.error("Error fetching Excel report");
                    }
                };
                reader.readAsText(err.response.data);
            } else {
                toast.error(err?.response?.data?.message || err?.message || "Error fetching Excel report");
            }
        } finally {
            setLoadingSearch(false);
        }
    };


    return (
        <Accordion name={t("Lab Investigation Report")} defaultValue={true} isBreadcrumb={true}>
            <div className="row pt-2 px-2 mb-2">
                <div className="col-12 col-sm-auto my-1 d-flex align-items-center" style={{ gap: "8px" }}>
                    {testCenterOptions.map((opt) => (
                        <Form.Check
                            key={opt.value}
                            type="switch"
                            id={`TestCentreID-${opt.value}`}
                            label={t(opt.label)}
                            checked={formData.TestCentreID === opt.value}
                            onChange={() => setFormData({ ...formData, TestCentreID: opt.value })}
                            className="m-0"
                        />
                    ))}
                </div>

                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        label="All Centre"
                        options={CentreData}
                        value={formData.Centre}
                        name="Centre"
                        onChange={handleSelectMultiChange}
                        lable={t("Select Centre")}
                    />
                </div>

                 <div className="col-sm-3">
                    <MultiSelectComp
                        label="Rate Type"
                        options={rateType}
                        name="RateType"
                        value={formData.RateType}
                        onChange={handleSelectMultiChange}
                        lable={t("Select Rate")}
                        removeIsClearable={false}
                    />
                </div>






                {/* Department (items filter only, not in payload) */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        options={Department}
                        id="DepartmentID"
                        label="Department"
                        name="DepartmentID"
                        value={formData.DepartmentID}
                        onChange={handleSelectMultiChange}
                        searchable={true}
                    />
                </div>

                <div className="col-12 col-sm-6 col-md-3 my-1">
                    <MultiSelectComp
                        label="All Tests"
                        options={ItemList}
                        name="TestID"
                        value={formData.TestID}
                        onChange={handleSelectMultiChange}
                        lable={t("Select Test")}
                        removeIsClearable={false}
                    />
                </div>

                














                {/* From Date → payload: fromDate */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        className="custom-calendar"
                        name="FromDate"
                        value={formData.FromDate}
                        onChange={dateSelect}
                        maxDate={new Date()}
                        lable={t("From Date")}
                    />
                </div>

                {/* To Date → payload: toDate */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        className="custom-calendar"
                        name="ToDate"
                        value={formData.ToDate}
                        onChange={dateSelect}
                        maxDate={new Date()}
                        minDate={new Date(formData.FromDate)}
                        lable={t("To Date")}
                    />
                </div>


                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={dateTypeOptions}
                        name="dateType"
                        id="dateType"
                        removeIsClearable={true}
                        placeholderName={t("Date Type")}
                        value={formData?.dateType}
                        onChange={handleReactSelectChange}
                        className="required-fields"
                    />
                </div>
                <div className="col-12 col-sm-auto my-1 d-flex align-items-center" style={{ gap: "8px" }}>
                    <label className="mb-0"><strong>{t("Report Category")}:</strong></label>
                    {labOrPackageOptions.map((opt) => (
                        <Form.Check
                            key={opt.value}
                            type="switch"
                            id={`labOrPackage-${opt.value}`}
                            label={t(opt.label)}
                            checked={formData.labOrPackage === opt.value}
                            onChange={() => {
                                const firstType = reportTypeOptions.find(r => r.category === opt.value);
                                setFormData({
                                    ...formData,
                                    labOrPackage: opt.value,
                                    reportType: firstType ? firstType.value : ""
                                });
                            }}
                            className="m-0"
                        />
                    ))}
                </div>
                <div className="col-12 col-sm-auto my-1 d-flex flex-wrap align-items-center" style={{ gap: "8px" }}>
                    <label className="mb-0"><strong>{t("Report Type")}:</strong></label>
                    {reportTypeOptions
                        .filter(opt => opt.category === formData.labOrPackage)
                        .map((opt) => (
                        <Form.Check
                            key={opt.value}
                            type="switch"
                            id={`reportType-${opt.value}`}
                            label={t(opt.label)}
                            checked={formData.reportType === opt.value}
                            onChange={() => setFormData({ ...formData, reportType: opt.value })}
                            className="m-0"
                        />
                    ))}
                    <Form.Check
                        type="switch"
                        id="topHighVolume"
                        label={t("Top High Volume")}
                        checked={formData.TopRecordsEnabled}
                        onChange={() => {
                            const enabling = !formData.TopRecordsEnabled;
                            setFormData({
                                ...formData,
                                TopRecordsEnabled: enabling,
                                TopRecords: "",
                                reportType: enabling ? "" : "Lab_Summary",
                                ...(!enabling && { labOrPackage: "Lab" }),
                            });
                        }}
                        className="m-0"
                    />
                    {formData.TopRecordsEnabled && (
                        <input
                            type="number"
                            min={1}
                            max={1000}
                            value={formData.TopRecords}
                            onChange={(e) => setFormData({ ...formData, TopRecords: e.target.value })}
                            className="form-control"
                            style={{ width: "85px" }}
                            placeholder="1 - 1000"
                        />
                    )}
                    {loadingSearch ? (
                        <Loading />
                    ) : (
                        <>
                            <CustomButton text={"PDF"} icon={"pdf"} onClick={handlePDF} />
                            <CustomButton text={"Excel"} icon={"excel"} onClick={handleExcel} />
                        </>
                    )}
                </div>

            </div>
        </Accordion>
    );
};

export default LabInvestigationReport;