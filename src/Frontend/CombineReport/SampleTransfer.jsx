import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosReport } from "../../utils/axiosInstance";
import { getAccessCentresReports } from "../../utils/NetworkApi/commonApi";
import Accordion from "../../components/UI/Accordion";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import { formatStandardDate } from "../../utils/helpers";
import ReactSelect from "../../components/formComponent/ReactSelect";

const SampleTransfer = () => {
    const { t } = useTranslation();
    const [CentreData, setCentreData] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const [formData, setFormData] = useState({
        FromCentre: [],
        ToCentre: 0,
        FromDate: new Date(),
        ToDate: new Date(),
    });

    useEffect(() => {
        getAccessCentresReports(setCentreData);
    }, []);

    const handleSelectMultiChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleReactSelect = (name, value) => {
        setFormData({ ...formData, [name]: value?.value });
    };

    const dateSelect = (date, name) => {
        setFormData({ ...formData, [name]: date });
    };

    const handleExcel = () => {
        setLoadingSearch(true);

        const payload = {
            fromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
            fromTime: "00:00:00",
            toTime: "23:59:59",
            centre: formData.FromCentre.length > 0
                ? formData.FromCentre.map(item => typeof item === "object" ? item.value : item)
                : [0],
            toCentreID: formData.ToCentre || 0,
        };

        axiosReport
            .post("CombineLabReport/GetSampleTransferReportExcel", payload, { responseType: "blob" })
            .then(async (res) => {
                if (res?.data) {
                    const blob = new Blob([res.data]);
                    const isJson = res.headers?.["content-type"]?.includes("application/json") ||
                        res.headers?.["content-type"]?.includes("text/plain");

                    if (isJson || blob.size < 500) {
                        const text = await blob.text();
                        try {
                            const json = JSON.parse(text);
                            if (!json?.success) {
                                toast.error(json?.message || t("No data found"));
                                return;
                            }
                        } catch {
                            if (blob.size === 0) {
                                toast.warning(t("No records found for selected filters"));
                                return;
                            }
                        }
                    }

                    if (blob.size === 0) {
                        toast.warning(t("No records found for selected filters"));
                        return;
                    }

                    const mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    const typedBlob = new Blob([res.data], { type: mimeType });
                    const fileUrl = window.URL.createObjectURL(typedBlob);

                    const link = document.createElement("a");
                    link.href = fileUrl;
                    link.setAttribute("download", `SampleTransferReport_${new Date().getTime()}.xlsx`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success(t("Report generated successfully"));

                    setTimeout(() => window.URL.revokeObjectURL(fileUrl), 5000);
                } else {
                    toast.error(t("No data found"));
                }
            })
            .catch(async (err) => {
                console.error(err);
                if (err?.response?.data instanceof Blob) {
                    try {
                        const text = await err.response.data.text();
                        const json = JSON.parse(text);
                        toast.error(json?.message || t("Error processing request"));
                    } catch {
                        toast.error(t("Error processing request"));
                    }
                } else {
                    toast.error(t("Error processing request"));
                }
            })
            .finally(() => setLoadingSearch(false));
    };

    return (
        <>
            <Accordion title={t("Sample Transfer Report")} defaultValue={true}>
                <div className="row px-2 mt-2 p-1">
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            options={CentreData}
                            value={formData.FromCentre}
                            name="FromCentre"
                            onChange={handleSelectMultiChange}
                            label={t("From Centre")}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <ReactSelect
                            dynamicOptions={CentreData}
                            value={formData.ToCentre}
                            name="ToCentre"
                            removeIsClearable={true}
                            onChange={handleReactSelect}
                            placeholderName={t("To Centre")}
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
                        <CustomButton
                            text={t("Excel")}
                            onClick={handleExcel}
                            loading={loadingSearch}
                            icon={"excel"}
                        />
                    </div>
                </div>
            </Accordion>
        </>
    );
};

export default SampleTransfer;