import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosReport } from "../../utils/axiosInstance";
import { getAccessCentresReports } from "../../utils/NetworkApi/commonApi";
import Accordion from "../../components/UI/Accordion";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { formatStandardDate } from "../../utils/helpers";
import { notify } from "../../utils/utils";
import { getReportDownloadName, downloadReportBlob, saveAndPreviewPdf } from "./reportDownload";

const MobileWalletReport = () => {
    const { t } = useTranslation();
    const [CentreData, setCentreData] = useState([]);
    const [walletData, setWalletData] = useState([
        { label: "Cash", value: 134 },
        { label: "Online Payment", value: 124 },
        { label: "Paytm", value: 123 },
        { label: "Credit Card", value: 135 },
        { label: "Credit", value: 215 },
        { label: "WriteOff", value: 831 },
        { label: "Debit Card", value: 5 },
        { label: "Cheque", value: 145 },
    ]);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [loadingExcel, setLoadingExcel] = useState(false);

    const [formData, setFormData] = useState({
        Centre: [],
        Wallet: "",
        FromDate: new Date(),
        ToDate: new Date(),
        ReportType: "0",
    });

    useEffect(() => {
        getAccessCentresReports(setCentreData);
    }, []);

    const handleSelectMultiChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleReactSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value?.value }));
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const dateSelect = (date, name) => {
        setFormData({ ...formData, [name]: date });
    };

    const buildPayload = (type) => ({
        fromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
        toDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
        centreIDs:
            formData.Centre.length > 0
                ? formData.Centre.map((item) =>
                    Number(typeof item === "object" ? item.value : item)
                )
                : [],
        walletIDs: formData.Wallet ? [Number(formData.Wallet)] : [],
        reportType: formData.ReportType === "0" ? "summary" : "detail",
        reportFormat: type,
    });

    const handleDownload = (type) => {
        if (formData.Centre.length === 0) {
            notify("Please select centre", "error");
            return;
        }
        type === "Pdf" ? setLoadingPdf(true) : setLoadingExcel(true);

        const payload = buildPayload(type);
        const url = "CollectionReport/GetMobileWalletReport/GetMobileWalletReport";
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
                    const fileName = getReportDownloadName(res, `MobileWalletReport_${new Date().getTime()}.pdf`);
                    saveAndPreviewPdf(blob, fileName);
                } else {
                    const fileName = getReportDownloadName(res, `MobileWalletReport_${new Date().getTime()}.xlsx`);
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
            <Accordion title={t("Mobile Wallet Report")} defaultValue={true}>
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
                    {/* Mobile Wallet */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <ReactSelect
                            name="Wallet"
                            placeholderName={t("Mobile Wallet")}
                            dynamicOptions={walletData}
                            value={formData.Wallet}
                            onChange={handleReactSelectChange}
                            lable={t("Mobile Wallet")}
                        />
                    </div>
                    {/* Report Type */}
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <SelectBox
                            options={[
                                { label: t("Summary"), value: "0" },
                                { label: t("Detail"), value: "1" },
                            ]}
                            name="ReportType"
                            lable={t("Report Type")}
                            selectedValue={formData.ReportType}
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
                    <div className="col-12 col-sm-6 col-md-2 my-1 d-flex gap-2">
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

export default MobileWalletReport;
