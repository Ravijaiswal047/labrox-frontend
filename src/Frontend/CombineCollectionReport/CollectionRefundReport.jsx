import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosReport } from "../../utils/axiosInstance";
import { getAccessCentresReports, getAccessDataRateReport } from "../../utils/NetworkApi/commonApi";
import Accordion from "../../components/UI/Accordion";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { formatStandardDate } from "../../utils/helpers";
import { notify } from "../../utils/utils";
import { getReportDownloadName, downloadReportBlob, saveAndPreviewPdf } from "./reportDownload";

const CollectionRefundReport = () => {
    const { t } = useTranslation();
    const [CentreData, setCentreData] = useState([]);
    const [rateTypeData, setRateTypeData] = useState([]);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [loadingExcel, setLoadingExcel] = useState(false);

    const [formData, setFormData] = useState({
        Centre: [],
        RateType: [],
        FromDate: new Date(),
        ToDate: new Date(),
        DateType: "EntryDateTime",
        AmountType: "Amount",
        LedgerMode: "Both",
        AmountRefundPending: 0,
    });

    useEffect(() => {
        getAccessCentresReports(setCentreData);
    }, []);

    const handleSelectMultiChange = (name, value) => {
        if (name === "Centre") {
            setFormData((prev) => ({
                ...prev,
                Centre: value,
                MultipleRateType: [],
            }));
            getAccessDataRateReport(setRateTypeData, Array.isArray(value) ? value : []);
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const dateSelect = (date, name) => {
        setFormData({ ...formData, [name]: date });
    };

    const handleToggleSetMaster = (e) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: checked ? 1 : 0,
        }));
    };


    const buildPayload = (type) => ({
        fromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
        toDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
        dateType: formData.DateType,
        amtStatus: formData.AmountType,
        ReportFormat: type,
        CentreIds:
            formData.Centre.length > 0
                ? formData.Centre.map((item) =>
                    typeof item === "object" ? item.value : item
                )
                : [],
        rateTypeIds:
            formData.RateType.length > 0
                ? formData.RateType.map((item) =>
                    typeof item === "object" ? item.value : item
                )
                : [],
        ledgerMode: formData.LedgerMode,
        AmountRefundPending: formData.AmountRefundPending,
    });

    const handleDownload = (type) => {
        if(formData.Centre.length === 0){
            notify("Please select centre", "error");
            return;
        }
        type === "Pdf" ? setLoadingPdf(true) : setLoadingExcel(true);

        const payload = buildPayload(type);
        const url = "CollectionReport/GetRefundReport/GetRefundReport";
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
                    const fileName = getReportDownloadName(res, `RefundReport_${new Date().getTime()}.pdf`);
                    saveAndPreviewPdf(blob, fileName);
                } else {
                    const fileName = getReportDownloadName(res, `RefundReport_${new Date().getTime()}.xlsx`);
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
            <Accordion title={t("Collection Refund Report")} defaultValue={true}>
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
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            label="Rate Type"
                            options={rateTypeData}
                            value={formData?.RateType}
                            name="RateType"
                            onChange={handleSelectMultiChange}
                            lable={t("Rate Type")}
                        />
                    </div>
                    {/* Date Type */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <SelectBox
                            options={[
                                { label: t("Refund Date"), value: "EntryDateTime" },
                                { label: t("Registration Date"), value: "Date" },
                            ]}
                            name="DateType"
                            lable={t("Date Type")}
                            selectedValue={formData.DateType}
                            onChange={handleSelectChange}
                        />
                    </div>
                    {/* Amount Type */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <SelectBox
                            options={[
                                { label: t("Amount Refund"), value: "Amount" },
                                { label: t("Test Refund"), value: "Test" },
                            ]}
                            name="AmountType"
                            lable={t("Refund Type")}
                            selectedValue={formData.AmountType}
                            onChange={handleSelectChange}
                        />
                    </div>
                    {formData.AmountType === "Test" && (
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <div className="col-sm-auto d-flex align-items-center">
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        name="AmountRefundPending"
                                        checked={formData?.AmountRefundPending}
                                        onChange={handleToggleSetMaster}
                                    />
                                    <span className="slider"></span>
                                </label>
                                <strong className="ml-2 mb-2">{t("AmountRefundPending")}</strong>
                            </div>
                        </div>
                    )}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <SelectBox
                            options={[
                                { label: t("Cash"), value: "Cash" },
                                { label: t("Credit"), value: "Credit" },
                                { label: t("Both"), value: "Both" },
                            ]}
                            name="LedgerMode"
                            lable={t("Ledger Mode")}
                            selectedValue={formData.LedgerMode}
                            onChange={handleSelectChange}
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

export default CollectionRefundReport;