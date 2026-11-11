import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { getAccessDataRateReport, getDepartmentReports } from "../../utils/NetworkApi/commonApi";
import { formatStandardDate } from "../../utils/helpers";

const dateTypeOptions = [
    { label: "Reg Date", value: "RegDate" },
    { label: "Sample Collection Date", value: "SampleCollectionDate" },
    { label: "Result Entered Date", value: "ResultEnteredDate" },
    { label: "Approved Date", value: "ApprovedDate" },
];

const ResultAmendmentReport = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [centreOptions, setCentreOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);

    const [payload, setPayload] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        centreIDs: [],
        departmentIDs: [],
        dateType: "RegDate",
    });

    useEffect(() => {
        axiosInstance
            .get("centre/getGlobalCentres")
            .then((res) => {
                const list = res?.data?.message?.map((item) => ({
                    label: item?.Centre,
                    value: item?.CentreID,
                }));
                setCentreOptions(list || []);
                if (list?.length === 1) {
                    setPayload((prev) => ({ ...prev, centreIDs: [list[0].value] }));
                }
            })
            .catch(() => toast.error(t("Error fetching centres")));

        getDepartmentReports(setDepartmentOptions);
    }, []);

    const handleMultiChange = (name, value) => {
      
            setPayload((prev) => ({ ...prev, [name]: value }));
    
    };

    const handleSelectChange = (name, option) => {
        setPayload((prev) => ({ ...prev, [name]: option?.value ?? "" }));
    };

    const handleDateChange = (value, name) => {
        setPayload((prev) => ({ ...prev, [name]: value }));
    };

    const getReport = async () => {
        if (!payload.centreIDs?.length) {
            toast.error(t("Please select at least one centre."));
            return;
        }

        const apiPayload = {
            fromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
            dateType: payload.dateType,
            centreIDs: payload.centreIDs,
            departmentIDs: payload.departmentIDs,
        };

        dispatch(setLoading(true));
        try {
            const res = await axiosReport.post(
                "ResultAmendment/ResultAmendmentReport",
                apiPayload,
                { responseType: "blob" }
            );

            const contentType = res.headers?.["content-type"] || "";
            if (contentType.includes("application/json")) {
                const text = await res.data.text();
                const json = JSON.parse(text);
                toast.warning(json?.message || t("No records found."));
                return;
            }

            if (!res.data || res.data.size === 0) {
                toast.warning(t("No data available to export."));
                return;
            }

            const url = window.URL.createObjectURL(
                new Blob([res.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                })
            );
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Result_Amendment_Report.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success(t("Excel File Downloaded"));
        } catch (err) {
            if (err?.response?.data instanceof Blob) {
                const text = await err.response.data.text();
                try {
                    const json = JSON.parse(text);
                    toast.error(json?.message || t("Error while fetching report."));
                } catch {
                    toast.error(t("Error while fetching report."));
                }
                return;
            }
            toast.error(err?.response?.data?.message || t("Error while fetching report."));
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <>
            <Accordion title={t("Result Amendment Report")} defaultValue={true}>
                <div className="row px-2 mt-2 p-1">
                    <div className="col-sm-2">
                        <MultiSelectComp
                            options={CentreData}
                            value={formData.Centre}
                            name="Centre"
                            onChange={handleSelectMultiChange}
                            label={t("Centre")}
                        />
                    </div>

                    <div className="col-sm-2">
                        <DatePicker
                            name="FromDate"
                            value={formData.FromDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            lable={t("From Date")}
                        />
                    </div>

                    <div className="col-sm-2">
                        <DatePicker
                            name="ToDate"
                            value={formData.ToDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            minDate={formData.FromDate}
                            lable={t("To Date")}
                        />
                    </div>

                    <div className="col-sm-auto">
                        <CustomButton
                            text={t("PDF")}
                            onClick={() => handleDownload("Pdf")}
                            loading={loadingPdf}
                            icon={"pdf"}
                        />

                    </div>
                    <div className="col-sm-auto">
                        <CustomButton
                            text={t("Excel")}
                            onClick={() => handleDownload("Excel")}
                            loading={loadingSearch}
                            icon={"excel"}
                        />
                    </div>
                </div>
            </Accordion>
        </>
    );
};

export default ResultAmendmentReport;

     
