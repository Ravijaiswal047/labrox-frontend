import React, { useState, useEffect } from "react";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { formatStandardDate } from "../../utils/helpers";
import { toast } from "react-toastify";
import { getAccessCentresReports, getAccessRateType } from "../../utils/NetworkApi/commonApi";

const MicroDataReport = () => {
    const { t } = useTranslation();
    const [AntibioticData, setAntibioticData] = useState([]);
    const [loadingAntibiotics, setLoadingAntibiotics] = useState(false);
    const [loading, setLoading] = useState(false);
    const [CentreData, setCentreData] = useState([]);
    const [rateTypeData, setRateTypeData] = useState([]);

    const [formData, setFormData] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        Antibiotics: [],
        Centre: [],
        RateType: [],
        dateType: "ApprovedDate",
    });

    const dateTypeOptions = [
        { label: t("Approval Date"), value: "ApprovedDate" },
        { label: t("Result Entry Date"), value: "ResultEnteredDate" },
    ];

    const getAntibioticData = async () => {
        setLoadingAntibiotics(true);
        try {
            const res = await axiosInstance.post("MicroMaster/getmasterdata", {
                TypeID: "4",
            });
            const data = res.data?.message ?? [];
            const mapped = Array.isArray(data)
                ? data
                    .filter(Boolean)
                    .map((ele) => ({ value: ele.id, label: ele.Name }))
                    .filter((item) => item.value !== null && item.value !== undefined)
                : [];
            setAntibioticData(mapped);
        } catch (err) {
            console.error("Error fetching antibiotics", err);
            toast.error(t("Failed to fetch antibiotic list"));
        } finally {
            setLoadingAntibiotics(false);
        }
    };

    useEffect(() => {
        getAntibioticData();
        getAccessCentresReports(setCentreData);
        getAccessRateType(setRateTypeData);

    }, []);

    const handleMultiSelectChange = (name, value) => {
        const clean = Array.isArray(value) ? value.filter(Boolean) : [];
        setFormData((prev) => ({ ...prev, [name]: clean }));
    };

    const handleReactSelectChange = (name, e) => {
        setFormData((prev) => ({ ...prev, [name]: e?.value ?? null }));
    };

    const dateSelect = (date, name) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
    };

    const buildPayload = () => {
        const antibioticNames = (formData.Antibiotics ?? [])
            .filter(Boolean)
            .map((o) => (typeof o === "object" ? o?.label : o))
            .filter(Boolean);

        return {
            FromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
            ToDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
            DateType: formData.dateType,
            antibioticIDs: antibioticNames,
            CentreIds: formData.Centre ?? [],
            RateTypeIds: formData.RateType ?? [],
            reportFormat: "Excel",
        };
    };

    const handleSearchAndDownload = async () => {
        setLoading(true);
        const payload = buildPayload();

        try {
            const res = await axiosReport.post(
                "CombineLabReport/GetMicroDataReport/GetMicroDataReport",
                payload,
                { responseType: "blob" }
            );

            const blob = res.data;
            const contentType = res.headers?.["content-type"] || "";

            const isJsonOrText =
                contentType.includes("application/json") ||
                contentType.includes("text/");

            if (isJsonOrText || blob.size === 0 || blob.size < 100) {
                toast.warning(t("No records found for selected filters"));
                return;
            }

            const excelBlob = new Blob([blob], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(excelBlob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `MicroDataReport_${new Date().toISOString().slice(0, 10)}.xlsx`
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success(t("Excel downloaded successfully"));
            setTimeout(() => window.URL.revokeObjectURL(url), 5000);
        } catch (err) {
            if (err?.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const json = JSON.parse(text);
                    toast.error(json?.message || t("Error fetching data"));
                } catch {
                    toast.error(t("Error fetching data"));
                }
            } else {
                toast.error(err?.response?.data?.message || err?.message || t("Error fetching data"));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Accordion title={"Micro Data Report"} defaultValue={true}>
            <div className="row px-2 mt-2 p-1">
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        options={CentreData}
                        value={formData.Centre}
                        name="Centre"
                        onChange={handleMultiSelectChange}
                        label={t("Centre")}
                    />
                </div>
                {/* Rate Type */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        label="Rate Type"
                        options={rateTypeData}
                        value={formData?.RateType}
                        name="RateType"
                        onChange={handleMultiSelectChange}
                        lable={t("Rate Type")}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        className="required-fields"
                        dynamicOptions={dateTypeOptions}
                        value={formData.dateType}
                        name="dateType"
                        onChange={handleReactSelectChange}
                        label={t("Search By")}
                        removeIsClearable={true}
                        placeholderName={t("Search By")}
                    />
                </div>

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
                        placeholder={t("Select Antibiotic Name")}
                        options={AntibioticData}
                        value={formData.Antibiotics}
                        name="Antibiotics"
                        onChange={handleMultiSelectChange}
                        lable={t("Antibiotic Name")}
                        isDisabled={loadingAntibiotics}
                    />
                </div>

                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <CustomButton
                        text={t("Excel")}
                        onClick={handleSearchAndDownload}
                        loading={loading}
                        icon={"excel"}
                    />
                </div>
            </div>
        </Accordion>
    );
};

export default MicroDataReport;