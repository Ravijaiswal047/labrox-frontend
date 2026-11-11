import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import {
    getAccessCentresReports,
    DepartmentWiseItemList,
} from "../../utils/NetworkApi/commonApi";
import Accordion from "../../components/UI/Accordion";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import Input from "../../components/formComponent/Input";
import AutoComplete from "../../components/formComponent/AutoComplete";
import { CustomButton } from "../../components/UI/CustomButton";
import { autocompleteOnBlur, formatStandardDate } from "../../utils/helpers";

const DATE_TYPE_OPTIONS = [
    { label: "Visit Date", value: "Visit Date" },
    { label: "Sample SNR Date", value: "SNR Date" },
];

const SNRReport = () => {
    const { t } = useTranslation();
    const [CentreData, setCentreData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [testCentreData, setTestCentreData] = useState([]);
    const [testSuggestion, setTestSuggestion] = useState([]);
    const [selects, setSelects] = useState(false);
    const [indexMatch, setIndexMatch] = useState(0);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const [formData, setFormData] = useState({
        DateType: "Visit Date",
        Centre: [],
        TestCentre: [],
        Department: [],
        TestName: "",
        InvestigationID: 0,
        FromDate: new Date(),
        ToDate: new Date(),
    });

    useEffect(() => {
        getAccessCentresReports(setCentreData);
        getDepartmentData();
        getTestCentreData();
    }, []);

    // Trigger server-side search when TestName changes (same as ResultEntry)
    useEffect(() => {
        if (formData.TestName?.length > 2) {
            DepartmentWiseItemList(
                formData.Department,
                formData.TestName,
                setTestSuggestion,
                true,
                "Investigation",
                { useDepartmentIDs: true }
            );
            setSelects(true);
        } else {
            setTestSuggestion([]);
            setSelects(false);
        }
    }, [formData.TestName, formData.Department]);

    const getDepartmentData = () => {
        axiosInstance
            .get("Department/getDepartment")
            .then((res) => {
                if (!Array.isArray(res.data.message)) return;
                setDepartmentData(res.data.message.map((ele) => ({
                    value: ele.DepartmentID,
                    label: ele.Department,
                })));
            })
            .catch(() => {});
    };

    const getTestCentreData = () => {
        axiosInstance
            .get("Centre/CentreProcessingLab")
            .then((res) => {
                if (!Array.isArray(res.data.message)) return;
                setTestCentreData(res.data.message.map((ele) => ({
                    value: ele.ProcessingLabID,
                    label: ele.ProcessingLab,
                })));
            })
            .catch(() => {});
    };

    const handleSelectMultiChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, selectedOption) => {
        setFormData((prev) => ({ ...prev, [name]: selectedOption?.value ?? "" }));
    };

    const dateSelect = (date, name) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
    };

    const handleTestNameChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({ ...prev, TestName: value, InvestigationID: 0 }));
        if (!value) {
            setSelects(false);
            setTestSuggestion([]);
            setIndexMatch(0);
        }
    };

    const handleTestNameKeyDown = (e, name) => {
        if (name !== "TestName" || testSuggestion.length === 0) return;
        if (e.which === 38) {
            setIndexMatch((prev) => (prev > 0 ? prev - 1 : testSuggestion.length - 1));
        } else if (e.which === 40) {
            setIndexMatch((prev) => (prev < testSuggestion.length - 1 ? prev + 1 : 0));
        } else if (e.which === 13 && testSuggestion[indexMatch]) {
            handleTestSelect(testSuggestion[indexMatch]);
        }
    };

    const handleTestSelect = (data) => {
        setFormData((prev) => ({
            ...prev,
            TestName: data?.TestName || "",
            InvestigationID: data?.InvestigationID || 0,
        }));
        setSelects(false);
        setTestSuggestion([]);
        setIndexMatch(0);
    };

    const handleExcel = async () => {
        setLoadingSearch(true);

        const payload = {
            fromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
            fromTime: "00:00:00",
            toTime: "23:59:59",
            centre: formData.Centre.length > 0
                ? formData.Centre.map((item) => (typeof item === "object" ? item.value : item))
                : [0],
            departmentId: formData.Department.length > 0 ? formData.Department : [0],
            testCentre: formData.TestCentre.length > 0 ? formData.TestCentre : [0],
            investigationId: formData.InvestigationID || 0,
            dateType: formData.DateType || "Visit Date",
            // rateType: [0],
        };

        try {
            const res = await axiosReport.post(
                "CombineLabReport/GetSNRReportExcel",
                payload,
                { responseType: "blob" }
            );

            const contentType = res.headers["content-type"] || "";

            if (
                contentType.includes("application/json") ||
                contentType.includes("text/html") ||
                contentType.includes("text/plain")
            ) {
                toast.info(t("No Record Found"));
                return;
            }

            const fileUrl = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = fileUrl;
            link.setAttribute("download", `SNRReport_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(fileUrl);
            toast.success(t("Report generated successfully"));

        } catch (err) {
            if (err?.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const json = JSON.parse(text);
                    toast.error(json?.message || t("Error processing request"));
                } catch {
                    toast.error(t("Error processing request"));
                }
            } else {
                toast.error(err?.response?.data?.message || err?.message || t("Error processing request"));
            }
        } finally {
            setLoadingSearch(false);
        }
    };

    return (
        <>
            <Accordion title={t("SNR Report")} defaultValue={true}>
                <div className="row px-2 mt-2 p-1">

                    {/* Date Type */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <ReactSelect
                            id="dateType"
                            name="DateType"
                            placeholderName="Date Type"
                            value={formData.DateType}
                            dynamicOptions={DATE_TYPE_OPTIONS}
                            onChange={handleSelectChange}
                            respclass="col-12"
                            removeIsClearable={true}
                        />
                    </div>

                    {/* From Date */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            name="FromDate"
                            value={formData.FromDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            lable={t("From Date")}
                            className="custom-calendar"
                        />
                    </div>

                    {/* To Date */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            name="ToDate"
                            value={formData.ToDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            minDate={formData.FromDate}
                            lable={t("To Date")}
                            className="custom-calendar"
                        />
                    </div>

                    {/* Booking Centre */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            options={CentreData}
                            value={formData.Centre}
                            name="Centre"
                            onChange={handleSelectMultiChange}
                            label={t("Booking Centre")}
                        />
                    </div>

                    {/* Test Centre */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            options={testCentreData}
                            value={formData.TestCentre}
                            name="TestCentre"
                            onChange={handleSelectMultiChange}
                            label={t("Test Centre")}
                        />
                    </div>

                    {/* Department */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            options={departmentData}
                            value={formData.Department}
                            name="Department"
                            onChange={handleSelectMultiChange}
                            label={t("Department")}
                        />
                    </div>

                    {/* Search by Test Name */}
                    <div className="col-12 col-sm-6 col-md-2 my-1" style={{ position: "relative" }}>
                        <Input
                            type="text"
                            name="TestName"
                            id="TestName"
                            lable={t("Search By Test Name")}
                            placeholder=" "
                            value={formData.TestName}
                            onChange={handleTestNameChange}
                            onKeyDown={(e) => handleTestNameKeyDown(e, "TestName")}
                            onBlur={() => autocompleteOnBlur(setTestSuggestion)}
                        />
                        {selects && testSuggestion.length > 0 && (
                            <AutoComplete
                                selects={selects}
                                test={testSuggestion}
                                handleListSearch={(data) => handleTestSelect(data)}
                                indexMatch={indexMatch}
                            />
                        )}
                    </div>

                    {/* Excel Button */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <CustomButton
                            text={t("Excel")}
                            onClick={handleExcel}
                            loading={loadingSearch}
                            icon={"excel"}
                        />
                    </div>
                </div>
            </Accordion>
        </>
    );
};

export default SNRReport;
