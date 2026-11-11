import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosReport, axiosInstance } from "../../utils/axiosInstance";
import { getAccessCentresReports } from "../../utils/NetworkApi/commonApi";
import Accordion from "../../components/UI/Accordion";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import { formatStandardDate } from "../../utils/helpers";
import { notify } from "../../utils/utils";
import { getReportDownloadName, downloadReportBlob, saveAndPreviewPdf } from "./reportDownload";

const DepartmentDetailReport = () => {
    const { t } = useTranslation();
    const [CentreData, setCentreData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [loadingExcel, setLoadingExcel] = useState(false);

    const [formData, setFormData] = useState({
        Centre: [],
        Department: [],
        FromDate: new Date(),
        ToDate: new Date(),
    });

    useEffect(() => {
        getAccessCentresReports(setCentreData);
        axiosInstance
            .get("Department/getDepartment")
            .then((res) => {
                const list = (res?.data?.message || []).map((d) => ({
                    value: d.DepartmentID,
                    label: d.Department,
                }));
                setDepartmentData(list);
            })
            .catch((err) => console.log(err));
    }, []);

    const handleSelectMultiChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const dateSelect = (date, name) => {
        setFormData({ ...formData, [name]: date });
    };

    const buildPayload = (type) => ({
        fromDate: `${formatStandardDate(formData.FromDate, "YYYY-MM-DD")}T00:00:00Z`,
        toDate: `${formatStandardDate(formData.ToDate, "YYYY-MM-DD")}T23:59:59Z`,
        reportType: "0",
        reportFormat: type,
        deptIds:
            formData.Department.length > 0
                ? formData.Department.map((item) =>
                    Number(typeof item === "object" ? item.value : item)
                )
                : [],
        centreIds:
            formData.Centre.length > 0
                ? formData.Centre.map((item) =>
                    Number(typeof item === "object" ? item.value : item)
                )
                : [],
    });

    const handleDownload = (type) => {
        if (formData.Centre.length === 0) {
            notify("Please select centre", "error");
            return;
        }
        type === "Pdf" ? setLoadingPdf(true) : setLoadingExcel(true);

        const payload = buildPayload(type);
        const url = "CollectionReport/GetDepartmentDetailReport/GetDepartmentDetailReport";
        const config = { responseType: "blob" };

        axiosReport
            .post(url, payload, config)
            .then(async (res) => {
                const blob = res?.data;

                if (!blob || blob.size === 0) {
                    toast.error(t("No data found"));
                    return;
                }

                const contentType = res.headers?.["content-type"] || "";
                if (contentType.includes("application/json")) {
                    const text = await blob.text();
                    const json = JSON.parse(text);
                    toast.error(json?.message || t("No data found"));
                    return;
                }

                if (type === "Pdf") {
                    const fileName = getReportDownloadName(res, `DepartmentWiseCollectionReport_${new Date().getTime()}.pdf`);
                    saveAndPreviewPdf(blob, fileName);
                } else {
                    const fileName = getReportDownloadName(res, `DepartmentWiseCollectionReport_${new Date().getTime()}.xlsx`);
                    downloadReportBlob(blob, fileName);
                }

                toast.success(t("Report generated successfully"));
            })
            .catch(async (err) => {
                if (err?.response?.data instanceof Blob) {
                    const text = await err.response.data.text();
                    try {
                        const json = JSON.parse(text);
                        toast.error(json?.message || t("Error processing request"));
                    } catch {
                        toast.error(t("Error processing request"));
                    }
                } else {
                    toast.error(err?.response?.data?.message || t("Error processing request"));
                }
            })
            .finally(() => {
                type === "Pdf" ? setLoadingPdf(false) : setLoadingExcel(false);
            });
    };

    return (
        <>
            <Accordion title={t("Department Detail Report")} defaultValue={true}>
                <div className="row px-2 mt-2 p-1">
                    {/* Centre */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            options={CentreData}
                            value={formData.Centre}
                            name="Centre"
                            onChange={handleSelectMultiChange}
                            label={t("Centre")}
                        />
                    </div>
                    {/* Department */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            label="Department"
                            options={departmentData}
                            value={formData?.Department}
                            name="Department"
                            onChange={handleSelectMultiChange}
                            lable={t("Department")}
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

                    {/* Buttons */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <CustomButton
                            text={t("PDF")}
                            onClick={() => handleDownload("Pdf")}
                            loading={loadingPdf}
                            icon={"pdf"}
                            className="mr-4"
                        />
                        <CustomButton
                            text={t("Excel")}
                            onClick={() => handleDownload("Excel")}
                            loading={loadingExcel}
                            icon={"excel"}
                        />
                    </div>

                </div>
            </Accordion>
        </>
    );
};

export default DepartmentDetailReport;
