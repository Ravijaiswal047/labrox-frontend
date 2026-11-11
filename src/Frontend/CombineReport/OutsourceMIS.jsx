import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import { getAccessCentresReports } from "../../utils/NetworkApi/commonApi";

const DATE_TYPE_OPTIONS = [
    { label: "Visit Date", value: "Visit Date" },
    { label: "Outsource Date", value: "Outsource Date" },
];

function OutsourceMIS() {
    const { t } = useTranslation();

    const [load, setLoad] = useState(false);
    const [loadingExcel, setLoadingExcel] = useState(false);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [CentreData, setCentreData] = useState([]);
    const [testCentreData, setTestCentreData] = useState([]);
    const [outsourceLabData, setOutsourceLabData] = useState([]);
    const [Department, setDepartment] = useState([]);

    const [formData, setFormData] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        Centre: [],
        TestCentre: [],
        OutSourceLab: "",
        DateType: "Visit Date",
        Department: [],
    });

    useEffect(() => {
        getAccessCentresReports(setCentreData);
        getDepartmentReports(setDepartment);
        getTestCentreData();
        getOutsourceLabData();
    }, []);

    useEffect(() => {
        if (CentreData?.length === 1) {
            setFormData((prev) => ({ ...prev, Centre: [CentreData[0].value] }));
        }
    }, [CentreData]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getDepartmentReports = (state) => {
        axiosInstance
            .get("Department/getDepartment")
            .then((res) => {
                if (!Array.isArray(res.data.message)) { state([]); return; }
                state(res.data.message.map((ele) => ({
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

    const getOutsourceLabData = () => {
        axiosInstance
            .get("OutSourceLabMaster/getOutSourceLabData")
            .then((res) => {
                if (!Array.isArray(res.data.message)) return;
                setOutsourceLabData(res.data.message.map((ele) => ({
                    value: ele.OutSourceLabID,
                    label: ele.LabName,
                })));
            })
            .catch(() => {});
    };

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleDateChange = (value, name) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectMultiChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, selectedOption) => {
        setFormData((prev) => ({ ...prev, [name]: selectedOption?.value ?? "" }));
    };

    // ── API Call ──────────────────────────────────────────────────────────────
    const getReport = (documentType) => {
        if (formData.Centre?.length === 0) {
            return toast.error("Please select booking centre");
        }

        if (documentType === 1) setLoadingExcel(true);
        if (documentType === 2) setLoadingPdf(true);

        const payload = {
            centre: formData.Centre?.length > 0 ? formData.Centre : [],
            // rateType: [0],
            testIDs: [],
            testCentreID: formData.TestCentre?.length > 0 ? formData.TestCentre : [],
            documentType: String(documentType),
            department: formData.Department?.length > 0 ? formData.Department : [],
            fromDate: moment(formData.FromDate).format("YYYY-MM-DD") + " 00:00:00",
            toDate: moment(formData.ToDate).format("YYYY-MM-DD") + " 23:59:59",
            dateType: formData.DateType || "Visit Date",
            // billingCentreId: formData.Centre?.length > 0 ? formData.Centre[0] : 0,
            outSourceLab: formData.OutSourceLab || 0,
        };

        axiosReport
            .post("OutSource/OutsourceLabReport", payload, { responseType: "blob" })
            .then(async (res) => {
                const contentType = res.headers?.["content-type"] || "";
                if (contentType.includes("application/json")) {
                    const text = await res.data.text();
                    try {
                        const json = JSON.parse(text);
                        toast.error(json?.message || "Record Not Found.");
                    } catch {
                        toast.error("Record Not Found.");
                    }
                    setLoadingExcel(false);
                    setLoadingPdf(false);
                    return;
                }

                if (res.data?.size === 0) {
                    toast.error("Record Not Found.");
                    setLoadingExcel(false);
                    setLoadingPdf(false);
                    return;
                }

                if (documentType === 1) {
                    setLoadingExcel(false);
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "OutsourceMIS.xlsx");
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                }

                if (documentType === 2) {
                    setLoadingPdf(false);
                    const url = window.URL.createObjectURL(
                        new Blob([res.data], { type: "application/pdf" }),
                    );
                    window.open(url, "_blank");
                }
            })
            .catch(async (err) => {
                setLoadingExcel(false);
                setLoadingPdf(false);
                try {
                    if (err?.response?.data instanceof Blob) {
                        const text = await err.response.data.text();
                        try {
                            const json = JSON.parse(text);
                            toast.error(json?.message || "Record Not Found.");
                        } catch {
                            toast.error("Record Not Found.");
                        }
                    } else {
                        toast.error(
                            err?.response?.data?.message ||
                            err?.message ||
                            "Record Not Found.",
                        );
                    }
                } catch {
                    toast.error("Something went wrong while fetching the report.");
                }
            });
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {load ? (
                <Loading />
            ) : (
                <Accordion
                    name={t("Outsource Lab Report")}
                    defaultValue={true}
                    isBreadcrumb={true}
                >
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
                                onChange={handleDateChange}
                                id="OutsourceFromDate"
                                lable={t("From Date")}
                                maxDate={new Date()}
                                className={"custom-calendar"}
                            />
                        </div>

                        {/* To Date */}
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <DatePicker
                                name="ToDate"
                                value={formData.ToDate}
                                onChange={handleDateChange}
                                id="OutsourceToDate"
                                lable={t("To Date")}
                                maxDate={new Date()}
                                className={"custom-calendar"}
                            />
                        </div>

                        {/* Booking Centre */}
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <MultiSelectComp
                                label="All Centre"
                                options={CentreData}
                                value={formData.Centre}
                                name="Centre"
                                onChange={handleSelectMultiChange}
                                lable={t("Booking Centre")}
                            />
                        </div>

                        {/* Test Centre */}
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <MultiSelectComp
                                label="All Test Centre"
                                options={testCentreData}
                                value={formData.TestCentre}
                                name="TestCentre"
                                onChange={handleSelectMultiChange}
                                lable={t("Test Centre")}
                            />
                        </div>

                        {/* Outsource Lab */}
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <ReactSelect
                                id="outSourceLab"
                                name="OutSourceLab"
                                placeholderName="Outsource Lab"
                                value={formData.OutSourceLab}
                                dynamicOptions={outsourceLabData}
                                onChange={handleSelectChange}
                                respclass="col-12"
                            />
                        </div>

                        {/* Department */}
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <MultiSelectComp
                                label="All Department"
                                options={Department}
                                value={formData.Department}
                                name="Department"
                                onChange={handleSelectMultiChange}
                                lable={t("Select Department")}
                            />
                        </div>

                        {/* Actions */}
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            {loadingPdf ? (
                                <Loading />
                            ) : (
                                <CustomButton
                                    text={"PDF"}
                                    icon={"pdf"}
                                    onClick={() => getReport(2)}
                                />
                            )}
                            {loadingExcel ? (
                                <Loading />
                            ) : (
                                <CustomButton
                                    text={"Excel"}
                                    icon={"excel"}
                                    onClick={() => getReport(1)}
                                    className="ml-2"
                                />
                            )}
                        </div>
                    </div>
                </Accordion>
            )}
        </>
    );
}

export default OutsourceMIS;
