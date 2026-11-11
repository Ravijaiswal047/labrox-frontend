import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import { formatStandardDate } from "../../utils/helpers";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { CustomButton } from "../../components/UI/CustomButton";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";

const CombineSampleTransferReport = () => {
    const [options, setOptions] = useState([]);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [payload, setPayload] = useState({
        fromDate: new Date(),
        toDate: new Date(),
        fromCentreIDs: [],
        toCentreIDs: [],
        reportFormat: "Excel"
    })

    const dateSelect = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const getSampleTransferReport = async () => {
        if (
            payload.fromCentreIDs.length === 0 &&
            payload.toCentreIDs.length === 0
        ) {
            toast.error("At least one centre is mandatory.");
            return;
        }

        const apiPayload = {
            fromDate: formatStandardDate(payload.fromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(payload.toDate, "YYYY-MM-DD"),
            fromCentreIDs: payload.fromCentreIDs || [],
            toCentreIDs: payload.toCentreIDs || [],
            reportFormat: payload.reportFormat,
        }
        dispatch(setLoading(true));

        try {
            dispatch(setLoading(true));
            const res = await axiosReport.post("SampleTransferReportAccount/SampleTransferReportAccounts", apiPayload, {
                responseType: "blob",
            });

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

            const url = window.URL.createObjectURL(
                new Blob([res.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                })
            );
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Sample_Transfer_Report.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Excel File Downloaded");
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
        setPayload((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <Accordion
                name="Sample Transfer Report"
                isBreadcrumb={true}
                defaultValue={true}
            >
                <div className="row px-2 mt-2 mb-2">

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            label="From Centre"
                            options={options}
                            value={payload?.fromCentreIDs}
                            name="fromCentreIDs"
                            onChange={handleSelectMultiChange}
                            lable={t("From Centre")}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            label="To Centre"
                            options={options}
                            value={payload?.toCentreIDs}
                            name="toCentreIDs"
                            onChange={handleSelectMultiChange}
                            lable={t("To Centre")}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            className="custom-calendar"
                            name="fromDate"
                            value={payload?.fromDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="fromDate"
                            lable={t("From Date")}
                            maxDate={new Date()}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            className="custom-calendar"
                            name="toDate"
                            value={payload?.toDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="toDate"
                            lable={t("To Date")}
                            maxDate={new Date()}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <CustomButton text="Get Report" icon="pdf" onClick={getSampleTransferReport} className="mb-1 mx-2" />
                    </div>
                </div>
            </Accordion>
        </>
    );
};

export default CombineSampleTransferReport;
