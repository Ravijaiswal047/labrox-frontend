import React, { useState, useEffect } from "react";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton } from "../../components/UI/CustomButton";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import moment from "moment";
import * as XLSX from "xlsx";
import { getReportDownloadName, downloadReportBlob, saveAndPreviewPdf } from "./reportDownload";

const DateWiseCollectionReport = () => {
    const { t } = useTranslation();
    const [Dropdown, setDropdown] = useState({
        testCentre: [],
        centreData: [],
    });

    const [loadingExcel, setLoadingExcel] = useState(false);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [formData, setFormData] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        CentreId: [],
    });

    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get("Centre/GetAllAccessCentres?IsActive=1");
            if (res.data?.success && Array.isArray(res.data.message)) {
                const option = res.data.message.map((c) => ({
                    value: c.CentreID,
                    label: c.Centre,
                }));
                setDropdown((prev) => ({ ...prev, centreData: option }));
            }
        } catch (err) {
            console.error("Error fetching centres", err);
        }
    };

    const getTestCentres = async () => {
        try {
            const res = await axiosInstance.get("centre/getCentreType");
            if (res.data?.message) {
                const option = res.data.message.map((d) => ({
                    value: d.id,
                    label: d.Centretype,
                }));
                setDropdown((prev) => ({ ...prev, testCentreData: option }));
            }
        } catch (err) {
            console.error("Error fetching test centres", err);
        }
    };

    useEffect(() => {
        getAccessCentres();
        getTestCentres();
    }, []);

    const dateSelect = (date, name) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
    };

    const handleMultiChange = (name, selected) => {
        setFormData((prev) => ({ ...prev, [name]: selected || [] }));
    };

    const buildPayload = (format) => ({
        fromDate: moment(formData.FromDate).format("YYYY-MM-DD"),
        toDate: moment(formData.ToDate).format("YYYY-MM-DD"),
        reportFormat: format,
        centerID: formData.CentreId.map((c) => c.value ?? c),
    });

    const fetchReportBlob = async (format) => {
        const res = await axiosReport.post(
            "CollectionReport/DateWiseCollectionReport/DateWiseCollectionReport",
            buildPayload(format),
            { responseType: "blob" }
        );

        const blob = new Blob([res.data]);
        const contentType = res.headers["content-type"] || "";
        if (
            contentType.includes("application/json") ||
            contentType.includes("text/plain")
        ) {
            const text = await blob.text();
            try {
                const json = JSON.parse(text);
                if (!json?.success) {
                    toast.warning(json?.message || "No records found");
                    return { hasData: false, blob: null };
                }
            } catch {
                toast.warning("No records found");
                return { hasData: false, blob: null };
            }
        }

        if (blob.size === 0) {
            toast.warning("No records found");
            return { hasData: false, blob: null };
        }

        return { hasData: true, blob, res };
    };
    const downloadExcel = async () => {
         if(formData.CentreId.length === 0){
            toast.warning("Please select at least one centre");
            return;
        }
        setLoadingExcel(true);
        try {
            const { hasData, blob, res } = await fetchReportBlob("Excel");
            if (hasData && blob) {
                const fileName = getReportDownloadName(res, "DateWiseCollectionReport.xlsx");
                downloadReportBlob(blob, fileName);
                toast.success("Excel downloaded successfully");
            }
        } catch (err) {
            if (err?.response?.data instanceof Blob) {
                const text = await err.response.data.text();
                try {
                    const json = JSON.parse(text);
                    toast.error(json?.message || "Something went wrong");
                } catch {
                    toast.error("Something went wrong");
                }
            } else {
                toast.error(err?.response?.data?.message || "Something went wrong");
            }
        } finally {
            setLoadingExcel(false);
        }
    };
    const viewPdf = async () => {

        if(formData.CentreId.length === 0){
            toast.warning("Please select at least one centre");
            return;
        }
        setLoadingPdf(true);
        try {
            const { hasData, blob, res } = await fetchReportBlob("Pdf");
            if (!hasData) return;

            const fileName = getReportDownloadName(res, "DateWiseCollectionReport.pdf");
            saveAndPreviewPdf(blob, fileName);
            toast.success("Pdf opened successfully");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoadingPdf(false);
        }
    };

    return (
        <>
            <Accordion title={t("Date Wise Collection Report")} defaultValue={true}>
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
                            options={Dropdown?.centreData}
                            value={formData.CentreId}
                            name="CentreId"
                            onChange={handleMultiChange}
                            label={t("Centre")}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="col-12 col-sm-6 col-md-2 my-1 d-flex gap-2">
                        <CustomButton
                            text={t("Pdf")}
                            onClick={viewPdf}
                            loading={loadingPdf}
                            icon={"pdf"}
                            className="mr-2"
                        />

                        <CustomButton
                            text={t("Excel")}
                            onClick={downloadExcel}
                            loading={loadingExcel}
                            icon={"excel"}
                            className="mr-2"
                        />
                    </div>
                </div>
            </Accordion>
        </>
    );
};

export default DateWiseCollectionReport;