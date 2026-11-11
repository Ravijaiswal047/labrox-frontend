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

const ResultReport = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [centreOptions, setCentreOptions] = useState([]);
    const [rateTypeOptions, setRateTypeOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);

    const [payload, setPayload] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        centreIDs: [],
        rateTypeIDs: [],
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
                    getAccessDataRateReport(setRateTypeOptions, [list[0].value]);
                }
            })
            .catch(() => toast.error(t("Error fetching centres")));

        getDepartmentReports(setDepartmentOptions);
    }, []);

    const handleMultiChange = (name, value) => {
        if (name === "centreIDs") {
            setPayload((prev) => ({ ...prev, centreIDs: value, rateTypeIDs: [] }));
            getAccessDataRateReport(setRateTypeOptions, Array.isArray(value) ? value : []);
        } else {
            setPayload((prev) => ({ ...prev, [name]: value }));
        }
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
            rateTypeIDs: payload.rateTypeIDs,
            departmentIDs: payload.departmentIDs,
        };

        dispatch(setLoading(true));
        try {
            const res = await axiosReport.post(
                "PatientResultReport/PatientResultReport",
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
            link.setAttribute("download", "Result_Report.xlsx");
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
        <Accordion
            name="Result Report"
            isBreadcrumb={false}
            defaultValue={true}
            linkTo={"#"}
            linkTitle={
                <div className="link-title-container" id="pr_id_11" style={{ marginRight: "10px" }}>
                    <div style={{
                        fontWeight: "700"
                    }}>
                        ⚠️ This report is applicable only for numeric report types.
                    </div>
                </div>
            }
        >
            <div className="row px-2 mt-2 mb-2">
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={dateTypeOptions}
                        name="dateType"
                        lable={t("Date Type")}
                        id="dateType"
                        removeIsClearable={true}
                        placeholderName={t("Date Type")}
                        value={payload.dateType}
                        onChange={handleSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="FromDate"
                        value={payload.FromDate}
                        onChange={handleDateChange}
                        id="FromDate"
                        lable={t("From Date")}
                        maxDate={new Date()}
                        className="custom-calendar"
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="ToDate"
                        value={payload.ToDate}
                        onChange={handleDateChange}
                        id="ToDate"
                        lable={t("To Date")}
                        maxDate={new Date()}
                        className="custom-calendar"
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        label="Department"
                        options={departmentOptions}
                        value={payload.departmentIDs}
                        name="departmentIDs"
                        onChange={handleMultiChange}
                        lable={t("Department")}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        label="Centre"
                        options={centreOptions}
                        value={payload.centreIDs}
                        name="centreIDs"
                        onChange={handleMultiChange}
                        lable={t("Centre")}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        label="Rate Type"
                        options={rateTypeOptions}
                        value={payload.rateTypeIDs}
                        name="rateTypeIDs"
                        onChange={handleMultiChange}
                        lable={t("Rate Type")}
                    />
                </div>


                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <CustomButton text={t("Get Report")} icon="excel" onClick={getReport} />
                </div>
            </div>
        </Accordion>
    );
};

export default ResultReport;
