import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { apiUrls } from "../../utils/apiUrls";
import { downloadExcelBlob, ExportToExcel, formatStandardDate, openPdfBlob } from "../../utils/helpers";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { CustomButton } from "../../components/UI/CustomButton";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { getAccessDataRateReport } from "../../utils/NetworkApi/commonApi";
import ReactSelect from "../../components/formComponent/ReactSelect";

const NepaliReport = () => {
    const [options, setOptions] = useState([]);
    const [rateTypes, setRateTypes] = useState([]);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [payload, setPayload] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        Centre: [],
        ProcessingCentre: [],
        MultipleRateType: [],
        LedgerMode: "Both",
        ReportType: 1,
    })

    const reportTypes = [
        { label: 'Cash & Panel Sale Report', value: 1 },
        { label: 'RateType Summary Excel', value: 2 },
        { label: 'Patient Wise Detail Report', value: 3 },
        { label: 'Detailed Test Wise', value: 4 },
        { label: 'Monthly Cash & Panel Sale Report', value: 5 },
        { label: 'Processing Centre Lab', value: 6 },
        { label: 'Centre Wise PDF', value: 61 },
        { label: 'Month Vs Centre Wise', value: 7 }
    ]

    const handleSelectChange = (name, value) => {
        setPayload({ ...payload, [name]: value?.value });
    };

    const dateSelect = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const getPanelReport = async () => {
        if (payload.Centre.length === 0 && payload.ProcessingCentre.length === 0) {
            toast.error("Billing Centre or Processing centre is required.");
            return;
        }

        const isPdf = payload.ReportType === 61;
        const ReportTypeName = reportTypes.find((item) => item.value === payload.ReportType)?.label;

        const apiPayload = {
            fromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
            centreIds: payload.Centre || [],
            ProcessingCentre: payload.ProcessingCentre || [],
            rateTypeIds: payload.MultipleRateType || [],
            ReportType: payload.ReportType,
            ReportTypeName: ReportTypeName,
            ledgerMode: payload.LedgerMode,
            reportFormat: isPdf ? "PDF" : "Excel",
        };

        dispatch(setLoading(true));
        try {
            const res = await axiosReport.post(
                "CombineReportNew/CombineNepalReport",
                apiPayload,
                { responseType: "blob" }
            );

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
                downloadExcelBlob(res.data, "Nepali_Report");
                toast.success("Excel File Downloaded");
            }
        } catch (err) {
            if (err?.response?.data instanceof Blob) {
                const text = await err.response.data.text();
                try {
                    const json = JSON.parse(text);
                    toast.error(json?.message || "Error while fetching report.");
                } catch {
                    toast.error("Error while fetching report.");
                }
                return;
            }
            toast.error(err?.response?.data?.message || "Error while fetching report.");
        } finally {
            dispatch(setLoading(false));
        }
    };

    const getAllCentre = async () => {

        await axiosInstance
            .get("centre/getGlobalCentres")
            .then((res) => {
                const resList = res?.data?.message?.map((item) => ({
                    ...item,
                    label: item?.Centre,
                    value: item?.CentreID,
                }));
                setOptions(resList);
                if (resList.length === 1) {
                    setPayload((prev) => ({
                        ...prev,
                        Centre: [resList[0].value],
                    }));
                }
            })
            .catch((err) => {
                toast.error(err?.data?.message || "Save failed! Please try again.");
            }).finally(() => {

            })

    };

    useEffect(() => {
        getAllCentre();
    }, []);

    const handleSelectMultiChange = (name, value) => {
        if (name === "Centre") {
            setPayload((prev) => ({
                ...prev,
                Centre: value,
                MultipleRateType: [],
            }));
            getAccessDataRateReport(setRateTypes, Array.isArray(value) ? value : []);
        } else {
            setPayload((prev) => ({ ...prev, [name]: value }));
        }
    };

    return (
        <>
            <Accordion
                name="Nepali Report"
                isBreadcrumb={true}
                defaultValue={true}
            >
                <div className="row px-2 mt-2 mb-2">

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            label="Centre"
                            options={options}
                            value={payload?.Centre}
                            name="Centre"
                            onChange={handleSelectMultiChange}
                            lable={t("Billing Centre")}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            label="Processing Centre"
                            options={options}
                            value={payload?.ProcessingCentre}
                            name="ProcessingCentre"
                            onChange={handleSelectMultiChange}
                            lable={t("Processing Centre")}
                        />
                    </div>


                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            label="RateType"
                            options={rateTypes}
                            value={payload?.MultipleRateType}
                            name="MultipleRateType"
                            onChange={handleSelectMultiChange}
                            lable={t("RateType")}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            className="custom-calendar"
                            name="FromDate"
                            value={payload?.FromDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="FromDate"
                            lable={t("FromDate")}
                            maxDate={new Date()}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            className="custom-calendar"
                            name="ToDate"
                            value={payload?.ToDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="ToDate"
                            lable={t("ToDate")}
                            maxDate={new Date()}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <ReactSelect
                            dynamicOptions={[
                                { label: 'Cash', value: 'Cash' },
                                { label: 'Credit', value: 'Credit' },
                                { label: 'Both', value: 'Both' }
                            ]}
                            name="LedgerMode"
                            lable={t("LedgerMode")}
                            id="LedgerMode"
                            removeIsClearable={true}
                            placeholderName={t("LedgerMode")}
                            value={payload?.LedgerMode}
                            onChange={handleSelectChange}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <ReactSelect
                            dynamicOptions={reportTypes}
                            name="ReportType"
                            lable={t("ReportType")}
                            id="ReportType"
                            removeIsClearable={true}
                            placeholderName={t("ReportType")}
                            value={payload?.ReportType}
                            onChange={handleSelectChange}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <CustomButton text="Get Report" icon="pdf" onClick={getPanelReport} className="mb-1 mx-2" />
                    </div>
                </div>
            </Accordion>
        </>
    );
};

export default NepaliReport;
