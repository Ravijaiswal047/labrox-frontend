import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { getAccessCentresReports } from "../../utils/NetworkApi/commonApi";
import Accordion from "../../components/UI/Accordion";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import { formatStandardDate } from "../../utils/helpers";

const InfectionControlReport = () => {
    const { t } = useTranslation();
    const [centreData, setCentreData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [loadingExcel, setLoadingExcel] = useState(false);

    const [formData, setFormData] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        TestCentre: [],
        Department: [],
    });

    useEffect(() => {
        getAccessCentresReports(setCentreData);
        getDepartmentData();
    }, []);

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

    const handleSelectMultiChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const dateSelect = (date, name) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
    };

    const buildPayload = (reportFormat) => ({
        fromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
        toDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
        testCentreId: formData.TestCentre.length > 0
            ? formData.TestCentre.map((item) => (typeof item === "object" ? item.value : item))
            : [0],
        departmentId: formData.Department.length > 0
            ? formData.Department.map((item) => (typeof item === "object" ? item.value : item))
            : [0],
        reportFormat,
    });

    const handlePdf = async () => {
        setLoadingPdf(true);
        try {
            const res = await axiosReport.post(
                "NepaliReports/InfectionControlReport",
                buildPayload("PDF")
            );
            const url = res?.data?.url;
            if (!url) {
                toast.info(t("No Record Found"));
                return;
            }
            window.open(url, "_blank");
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || t("Error processing request"));
        } finally {
            setLoadingPdf(false);
        }
    };

    const handleExcel = async () => {
        setLoadingExcel(true);
        try {
            const res = await axiosReport.post(
                "NepaliReports/InfectionControlReport",
                buildPayload("Excel"),
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
            link.setAttribute("download", `InfectionControlReport_${new Date().getTime()}.xlsx`);
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
            setLoadingExcel(false);
        }
    };

    return (
        <>
            <Accordion title={t("Infection Control Report")} defaultValue={true}>
                <div className="row px-2 mt-2 p-1">

                    {/* Approved From Date */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            name="FromDate"
                            value={formData.FromDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            lable={t("Approved From Date")}
                            className="custom-calendar"
                        />
                    </div>

                    {/* Approved To Date */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            name="ToDate"
                            value={formData.ToDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            minDate={formData.FromDate}
                            lable={t("Approved To Date")}
                            className="custom-calendar"
                        />
                    </div>

                    {/* Test Centre */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            options={centreData}
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

                    {/* PDF Button */}
                    {/* <div className="col-12 col-sm-6 col-md-2 my-1"> */}
                        <CustomButton
                            text={t("PDF")}
                            onClick={handlePdf}
                            loading={loadingPdf}
                            icon="pdf"
                            className="mx-2"
                        />
                    {/* </div> */}

                    {/* Excel Button */}
                    {/* <div className="col-12 col-sm-6 col-md-2 my-1"> */}
                        <CustomButton
                            text={t("Excel")}
                            onClick={handleExcel}
                            loading={loadingExcel}
                            icon="excel"
                            className="mx-2"
                        />
                    {/* </div> */}

                </div>
            </Accordion>
        </>
    );
};

export default InfectionControlReport;
