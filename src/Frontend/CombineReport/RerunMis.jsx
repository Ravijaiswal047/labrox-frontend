import React, { useState, useEffect } from "react";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton } from "../../components/UI/CustomButton";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { formatStandardDate } from "../../utils/helpers";
import { toast } from "react-toastify";

const RerunMis = () => {
    const { t } = useTranslation();
    const [DepartmentData, setDepartmentData] = useState([]);
    const [testCentreData, setTestCentreData] = useState([]);
    const [loadingFormat, setLoadingFormat] = useState(null);

    const [formData, setFormData] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        TestCentreID: [],
        DepartmentID: [],
    });

    const getTestCentres = async () => {
        try {
            const res = await axiosInstance.get("CommonController/BindTestCentreList");
            if (res.data?.message) {
                setTestCentreData(
                    res.data.message.map((e) => ({
                        value: e.CentreID,
                        label: e.Centre,
                    }))
                );
            }
        } catch (err) {
            console.error("Error fetching test centres", err);
        }
    };

    const getDepartmentReports = async () => {
        try {
            const res = await axiosInstance.get("Department/getDepartment");
            const data = res.data.message;
            setDepartmentData(
                data?.map((ele) => ({
                    value: ele.DepartmentID,
                    label: ele.Department,
                })) || []
            );
        } catch (err) {
            console.error("Error fetching departments", err);
        }
    };

    useEffect(() => {
        getTestCentres();
        getDepartmentReports();
    }, []);

    const dateSelect = (date, name) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
    };

    const handleMultiChange = (name, selected) => {
        setFormData((prev) => ({ ...prev, [name]: selected || [] }));
    };

    const handleReport = async (format) => {
        setLoadingFormat(format);
        const payload = {
            fromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
            reportFormat: format,
            centreID: formData.TestCentreID.map((tc) => tc.value ?? tc),
            departmentID: formData.DepartmentID.map((d) => d.value ?? d),
        };

        try {
            const res = await axiosReport.post(
                "CombineLabReport/GetSampleRerunReport/GetSampleRerunReport",
                payload,
                { responseType: "blob" }
            );

            const blob = res.data;
            const contentType = res.headers?.["content-type"] || "";

            const isJsonOrText =
                contentType.includes("application/json") ||
                contentType.includes("text/");

            if (isJsonOrText || blob.size === 0 || blob.size < 100) {
                toast.error(t("No records found for selected filters"));
                return;
            }

            if (format === "Pdf") {
                const pdfBlob = new Blob([blob], { type: "application/pdf" });
                const url = window.URL.createObjectURL(pdfBlob);
                const newTab = window.open(url, "_blank");
                if (!newTab) {
                    toast.warning(t("Popup blocked! Please allow popups and try again."));
                } else {
                    toast.success(t("PDF opened successfully"));
                }
                setTimeout(() => window.URL.revokeObjectURL(url), 5000);
            } else {
                const excelBlob = new Blob([blob], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                const url = window.URL.createObjectURL(excelBlob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute(
                    "download",
                    `RerunMIS_${new Date().toISOString().slice(0, 10)}.xlsx`
                );
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success(t("Excel downloaded successfully"));
                setTimeout(() => window.URL.revokeObjectURL(url), 5000);
            }
        } catch (err) {
            if (err?.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const json = JSON.parse(text);
                    toast.error(json?.message || t(`Error generating ${format} report`));
                } catch {
                    toast.error(t(`Error generating ${format} report`));
                }
            } else {
                toast.error(err?.response?.data?.message || err?.message || t(`Error generating ${format} report`));
            }
        } finally {
            setLoadingFormat(null);
        }
    };

    return (
        <>
            <Accordion title={t("Re-Run MIS Collection Report")} defaultValue={true}>
                <div className="row px-2 mt-2 p-1">
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

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            options={testCentreData}
                            value={formData.TestCentreID}
                            name="TestCentreID"
                            onChange={handleMultiChange}
                            label={t("Test Centre")}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            placeholder={t("Select Department")}
                            options={DepartmentData}
                            value={formData.DepartmentID}
                            name="DepartmentID"
                            onChange={handleMultiChange}
                            lable={t("Department")}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <CustomButton
                            className="mr-2"
                            text={t("Pdf")}
                            onClick={() => handleReport("Pdf")}
                            loading={loadingFormat === "Pdf"}
                            icon={"pdf"}
                        />
                        <CustomButton
                            text={t("Excel")}
                            onClick={() => handleReport("Excel")}
                            loading={loadingFormat === "Excel"}
                            icon={"excel"}
                        />
                    </div>
                </div>
            </Accordion>
        </>
    );
};

export default RerunMis;