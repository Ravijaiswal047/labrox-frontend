import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import UltraFastSelect from "../../components/UltraFastSelect/UltraFastSelect";
import { CustomButton } from "../../components/UI/CustomButton";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import { downloadExcelBlob, openPdfBlob } from "../../utils/helpers";
import {
    getAccessCentresReports,
    getAccessDataRateReport,
} from "../../utils/NetworkApi/commonApi";

const reportUrlMap = {
    "PatientListWithTest":             "B2BBusinessReport/PatientListWithTest",
    "PatientListWithDept":             "B2BBusinessReport/PatientListWithDept",
    "PatientListWithoutTest":          "B2BBusinessReport/PatientListWithoutTest",
    "CenterSummaryReport":             "B2BBusinessReport/CenterSummaryReport",
    "DailySalesReport":                "B2BBusinessReport/DailySalesReport",
    "TestCodeReport":                  "B2BBusinessReport/TestCodeReport",
    "SingleLineCentreSummaryReport":   "B2BBusinessReport/SingleLineCentreSummaryReport",
};

const B2BClientwiseBusinessReport = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [centreData, setCentreData] = useState([]);
    const [rateTypeData, setRateTypeData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);

    const [formData, setFormData] = useState({
        Centre: [],
        RateType: "",
        Department: [],
        FromDate: new Date(),
        FromTime: "00:00:00",
        ToDate: new Date(),
        ToTime: "23:59:59",
        GroupingType: "CentreWise",
        ReportType: "PatientListWithTest",
        OnlyDue: 0,
    });

    const [groupingTypes] = useState([
        { label: "Centre Wise", value: "CentreWise" },
        { label: "User Wise", value: "UserWise" },
    ]);

    const [reportTypes] = useState([
        { label: "PatientListWithTest", value: "PatientListWithTest" },
        { label: "PatientListWithDept", value: "PatientListWithDept" },
        { label: "PatientListWithoutTest", value: "PatientListWithoutTest" },
        { label: "CenterSummaryReport", value: "CenterSummaryReport" },
        { label: "DailySalesReport", value: "DailySalesReport" },
        { label: "TestCodeReport", value: "TestCodeReport" },
        { label: "SingleLineCentreSummaryReport", value: "SingleLineCentreSummaryReport" },
    ]);

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === "Centre") {
            fetchRateTypes(value);
        }
    };

    const handleToggle = () => {
        setFormData((prev) => ({
            ...prev,
            OnlyDue: prev.OnlyDue === 1 ? 0 : 1,
        }));
    };

    const handleUltraFastChange = (name, selected) => {
        setFormData((prev) => ({ ...prev, [name]: selected?.value || "" }));
    };

    const dateSelect = (date, name) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
    };

    const handleTimeChange = (time, name) => {
        setFormData((prev) => ({ ...prev, [name]: time }));
    };

    const fetchRateTypes = (centreIds) => {
        getAccessDataRateReport(setRateTypeData, centreIds);
    };

    const fetchDepartments = () => {
        axiosInstance
            .get("Department/getDepartment")
            .then((res) => {
                const data = res.data.message || [];
                setDepartmentData(
                    data.map((ele) => ({
                        value: ele.DepartmentID,
                        label: ele.Department,
                    }))
                );
            })
            .catch((err) => console.error(err));
    };

    const buildPayload = (docType) => ({
        ...formData,
        FromDate: moment(formData.FromDate).format("DD-MMM-YYYY"),
        ToDate: moment(formData.ToDate).format("DD-MMM-YYYY"),
        Centre: formData.Centre.map(Number),
        RateType: formData.RateType ? [Number(formData.RateType)] : [],
        Department: formData.Department.map(String),
        DocumentType: docType,
    });

    const getReport = async (isPdf) => {
        setLoading(true);
        try {
            const payload = buildPayload(isPdf ? 2 : 1);
            const url = reportUrlMap[payload.ReportType] ?? "B2BBusinessReport/PatientListWithTest";

            const res = await axiosReport.post(url, payload, { responseType: "blob" });

            const contentType = res.headers?.["content-type"] || "";
            if (contentType.includes("application/json")) {
                const text = await res.data.text();
                const json = JSON.parse(text);
                toast.warning(json?.message || "No records found.");
                return;
            }

            if (!res.data || res.data.size === 0) {
                toast.warning("No data available to export.");
                return;
            }

            if (isPdf) {
                openPdfBlob(res.data);
            } else {
                downloadExcelBlob(res.data, formData.ReportType || "B2BClientwiseBusinessReport");
                toast.success("Excel File Downloaded");
            }
        } catch (err) {
            if (err?.response?.data instanceof Blob) {
                const text = await err.response.data.text();
                try {
                    const json = JSON.parse(text);
                    toast.error(json?.message || "Something went wrong while fetching the report");
                } catch {
                    toast.error("Something went wrong while fetching the report");
                }
                return;
            }
            toast.error(err?.response?.data?.message || err?.message || "Something went wrong while fetching the report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAccessCentresReports(setCentreData);
        fetchRateTypes();
        fetchDepartments();
    }, []);

    return (
        <div className="mt-2 px-2">
            <Accordion title={t("B2B Client Wise Business Report")} defaultValue={true}>
                <div className="row p-2">
                    <div className="col-sm-2">
                        <MultiSelectComp
                            options={centreData}
                            name="Centre"
                            label={t("Centre")}
                            value={formData.Centre}
                            onChange={handleMultiSelectChange}
                        />
                    </div>

                    <div className="col-sm-2">
                        <UltraFastSelect
                            options={[{ label: "Select Rate Type", value: "" }, ...rateTypeData]}
                            name="RateType"
                            value={formData.RateType}
                            onChange={(name, value) => handleUltraFastChange("RateType", value)}
                            label={t("Select Rate Type")}
                            searchable={true}
                        />
                    </div>

                    <div className="col-sm-2">
                        <MultiSelectComp
                            options={departmentData}
                            name="Department"
                            label={t("Department")}
                            value={formData.Department}
                            onChange={handleMultiSelectChange}
                        />
                    </div>

                    <div className="col-sm-2">
                        <DatePicker
                            name="FromDate"
                            lable={t("From Date")}
                            value={formData.FromDate}
                            onChange={dateSelect}
                        />
                    </div>

                    <div className="col-sm-1">
                        <CustomTimePicker
                            name="FromTime"
                            lable={t("From Time")}
                            value={formData.FromTime}
                            onChange={handleTimeChange}
                        />
                    </div>

                    <div className="col-sm-2">
                        <DatePicker
                            name="ToDate"
                            lable={t("To Date")}
                            value={formData.ToDate}
                            onChange={dateSelect}
                        />
                    </div>

                    <div className="col-sm-1">
                        <CustomTimePicker
                            name="ToTime"
                            lable={t("To Time")}
                            value={formData.ToTime}
                            onChange={handleTimeChange}
                        />
                    </div>
                </div>

                <div className="row px-2 pb-2">
                    <div className="col-sm-2">
                        <SelectBox
                            name="GroupingType"
                            lable={t("Grouping")}
                            options={groupingTypes}
                            selectedValue={formData.GroupingType}
                            onChange={handleSelectChange}
                        />
                    </div>

                    <div className="col-sm-2">
                        <SelectBox
                            name="ReportType"
                            lable={t("Report Type")}
                            options={reportTypes}
                            selectedValue={formData.ReportType}
                            onChange={handleSelectChange}
                        />
                    </div>

                    <div className="col-sm-auto d-flex align-items-center">
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={formData.OnlyDue === 1}
                                onChange={handleToggle}
                            />
                            <span className="slider"></span>
                        </label>
                        <strong className="ml-2 mb-2">{t("Due Amount")}</strong>
                    </div>
                   
                    <div className="d-flex gap-2 ">
                        {loading ? (
                            <Loading />
                        ) : (
                            <>
                                <CustomButton
                                    text={t("PDF")}
                                    icon={"pdf"}
                                    onClick={() => getReport(true)}
                                />
                                <CustomButton className="ml-3"
                                    text={t("Excel")}
                                    icon={"excel"}
                                    onClick={() => getReport(false)}
                                />
                            </>
                        )}
                    </div>
                </div>
            </Accordion>
        </div>
    );
};

export default B2BClientwiseBusinessReport;
