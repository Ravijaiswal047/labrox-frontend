import React, { useState, useEffect } from "react";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton } from "../../components/UI/CustomButton";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import moment from "moment";
import { getReportDownloadName, downloadReportBlob, saveAndPreviewPdf } from "./reportDownload";

const ReceiptCancelCollectionReport = () => {
    const { t } = useTranslation();

    const [centreData, setCentreData] = useState([]);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [loadingExcel, setLoadingExcel] = useState(false);

    const [formData, setFormData] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        CentreId: [],
    });

    useEffect(() => {
        const getAccessCentres = async () => {
            try {
                const res = await axiosInstance.get("Centre/GetAllAccessCentres?IsActive=1");
                if (res.data?.success && Array.isArray(res.data.message)) {
                    setCentreData(
                        res.data.message.map((c) => ({ value: c.CentreID, label: c.Centre }))
                    );
                }
            } catch (err) {
                console.error("Error fetching centres", err);
            }
        };
        getAccessCentres();
    }, []);

    const dateSelect = (date, name) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
    };

    const handleMultiChange = (name, selected) => {
        setFormData((prev) => ({ ...prev, [name]: selected || [] }));
    };

    const buildPayload = (reportFormat) => ({
        fromDate: moment(formData.FromDate).format("YYYY-MM-DD"),
        toDate: moment(formData.ToDate).format("YYYY-MM-DD"),
        reportFormat,
        centreId: formData.CentreId.map((c) => c.value ?? c),
    });

    const handleDownload = async (reportFormat) => {
         if(formData.CentreId.length === 0){
                    toast.warning("Please select at least one centre");
                    return;
                }
        const isPdf = reportFormat === "Pdf";
        if (isPdf) setLoadingPdf(true);
        else setLoadingExcel(true);

        try {
            const res = await axiosReport.post(
                "CollectionReport/CancelRecieptReport/CancelRecieptReport",
                buildPayload(reportFormat),
                { responseType: "blob" }
            );

            const blob = res.data;
            const contentType = res.headers["content-type"];

            if (contentType?.includes("application/json")) {
                const text = await blob.text();
                const json = JSON.parse(text);
                toast.warning(json.message || "No records found");
                return;
            }

            if (blob.size === 0) {
                toast.warning("No records found");
                return;
            }

            if (isPdf) {
                const fileName = getReportDownloadName(res, `CancelReceiptReport_${moment().format("YYYYMMDD")}.pdf`);
                saveAndPreviewPdf(blob, fileName);
                toast.success("PDF opened successfully");
            } else {
                const fileName = getReportDownloadName(res, `CancelReceiptReport_${moment().format("YYYYMMDD")}.xlsx`);
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
            if (isPdf) setLoadingPdf(false);
            else setLoadingExcel(false);
        }
    };

    return (
        <Accordion title={t("Receipt Cancel Collection Report")} defaultValue={true}>
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
                        options={centreData}
                        value={formData.CentreId}
                        name="CentreId"
                        onChange={handleMultiChange}
                        label={t("Centre")}
                    />
                </div>

                <div className="col-12 col-sm-6 col-md-2 my-1 d-flex gap-2">
                    <CustomButton
                        text={t("Pdf")}
                        onClick={() => handleDownload("Pdf")}
                        loading={loadingPdf}
                        icon="pdf"
                        className="mr-2"
                    />
                    <CustomButton
                        text={t("Excel")}
                        onClick={() => handleDownload("Excel")}
                        loading={loadingExcel}
                        icon="excel"
                    />
                </div>
            </div>
        </Accordion>
    );
};

export default ReceiptCancelCollectionReport;