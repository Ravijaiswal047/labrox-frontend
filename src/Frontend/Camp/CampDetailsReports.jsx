import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import axios from "axios";
import Accordion from "@app/components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Loading from "../../components/loader/Loading";
import { CustomButton } from "../../components/UI/CustomButton";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { getAccessCentresReports } from "../../utils/NetworkApi/commonApi";
import { useTranslation } from "react-i18next";
import { apiUrls } from "../../utils/apiUrls";

const DocumentType = [
    { label: "Excel", value: 1 },
    { label: "PDF", value: 2 },
];

function CampDetailsReports() {
    const { t } = useTranslation();
    const [load, setLoad] = useState(true);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [centreData, setCentreData] = useState([]);
    const [rateTypeData, setRateTypeData] = useState([]);
    const [formData, setFormData] = useState({
        Centre: "",
        RateType: "",
        FromDate: new Date(),
        FromTime: "00:00:00",
        ToDate: new Date(),
        ToTime: "23:59:59",
        DocumentType: 2,
    });

    const dateSelect = (date, name) => {
        setFormData((prev) => ({
            ...prev,
            [name]: date,
        }));
    };

    const handleTime = (time, name) => {
        setFormData((prev) => ({
            ...prev,
            [name]: time,
        }));
    };

    const bindCampRateType = async (centreID = "") => {
        try {
            const res = await axiosInstance.post(apiUrls.BindRateTypeWorkOrder, {
                centreID: centreID || 0,
                rateTypeID: 0,
                AllowEstimate: 0,
                CentreType: "Camp",
                AllowHomeCollection: 0,
                AllowMembershipCard: 0,
            });

            const data = Array.isArray(res?.data?.message) ? res.data.message : [];
            const list = data
                .filter((ele) => ele?.CentreType == "Camp")
                .map((item) => ({
                    value: item?.RateTypeID,
                    label: item?.RateTypeName?.replace(/\r?\n/g, " ").trim(),
                }));

            setRateTypeData(list);
            if (list.length === 1) {
                setFormData((prev) => ({ ...prev, RateType: list[0].value }));
            }
        } catch (err) {
            setRateTypeData([]);
            toast.error(
                err?.response?.data?.message || "Error fetching camp rate type",
            );
        }
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;

        if (name === "Centre") {
            setFormData((prev) => ({
                ...prev,
                Centre: value,
                RateType: "",
            }));

            setRateTypeData([]); // clear old options

            bindCampRateType(value);
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    // const getCampDetailsReport = async () => {
    //     if (!formData.Centre) {
    //         toast.error("Please select Centre");
    //         return;
    //     }
    //     if (!formData.RateType) {
    //         toast.error("Please select Rate Type");
    //         return;
    //     }

    //     setLoadingSearch(true);

    //     try {
    //         const res = await axiosReport.post(
    //             "commonReports/CampDetailsReport",
    //             {
    //                 Centre: formData.Centre ? [Number(formData.Centre)] : [],
    //                 RateType: formData.RateType ? [Number(formData.RateType)] : [],
    //                 FromDate: moment(formData.FromDate).format("DD-MMM-YYYY"),
    //                 FromTime: formData.FromTime,
    //                 ToDate: moment(formData.ToDate).format("DD-MMM-YYYY"),
    //                 ToTime: formData.ToTime,
    //                 DocumentType: formData.DocumentType,
    //             },
    //             {
    //                 responseType: "blob",
    //             }
    //         );

    //         const contentType = res.headers["content-type"];

    //         if (contentType?.includes("application/json")) {
    //             const text = await res.data.text();
    //             const json = JSON.parse(text);

    //             if (json?.success === false) {
    //                 toast.error(json?.message || "No Record Found.");
    //             } else {
    //                 toast.success(json?.message);
    //             }
    //         } else {
    //             const url = window.URL.createObjectURL(
    //                 new Blob([res.data], {
    //                     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    //                 })
    //             );

    //             const link = document.createElement("a");
    //             link.href = url;
    //             link.setAttribute("download", "CampDetailsReport.xlsx");
    //             document.body.appendChild(link);
    //             link.click();
    //             link.remove();
    //             window.URL.revokeObjectURL(url);
    //         }
    //     } catch (err) {
    //         toast.error(err?.response?.data?.message || "No data available.");
    //     } finally {
    //         setLoadingSearch(false);
    //     }
    // };
    const getCampDetailsReport = async () => {
        if (!formData.Centre) {
            toast.error("Please select Centre");
            return;
        }

        if (!formData.RateType) {
            toast.error("Please select Rate Type");
            return;
        }

        const documentType = Number(formData.DocumentType);
        setLoadingSearch(true);

        try {
            const res = await axiosReport.post(
                "commonReports/CampDetailsReport",
                {
                    Centre: formData.Centre ? [Number(formData.Centre)] : [],
                    RateType: formData.RateType ? [Number(formData.RateType)] : [],
                    FromDate: moment(formData.FromDate).format("DD-MMM-YYYY"),
                    FromTime: formData.FromTime,
                    ToDate: moment(formData.ToDate).format("DD-MMM-YYYY"),
                    ToTime: formData.ToTime,
                    DocumentType: formData.DocumentType,
                },
                {
                    responseType: "blob",
                }
            );

            const contentType = res.headers["content-type"];

            // Handle JSON response (No Record Found, Validation Errors, etc.)
            if (contentType?.includes("application/json")) {
                const text = await res.data.text();
                const json = JSON.parse(text);

                if (json?.success === false) {
                    toast.error(json?.message || "No Record Found.");
                    return;
                }

                if (json?.message) {
                    toast.success(json.message);
                    return;
                }
            }

            // Excel Download
            if (documentType === 1) {
                const url = window.URL.createObjectURL(
                    new Blob([res.data], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    })
                );

                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "CampDetailsReport.xlsx");
                document.body.appendChild(link);
                link.click();
                link.remove();

                window.URL.revokeObjectURL(url);
            }

            // PDF Preview
            else if (documentType === 2) {
                const url = window.URL.createObjectURL(
                    new Blob([res.data], {
                        type: "application/pdf",
                    })
                );

                window.open(url, "_blank");
            }
        } catch (err) {
            if (err?.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const json = JSON.parse(text);

                    toast.error(json?.message || "No data available.");
                } catch {
                    toast.error("No data available.");
                }
            } else {
                toast.error(
                    err?.response?.data?.message || "No data available."
                );
            }
        } finally {
            setLoadingSearch(false);
        }
    };  

    useEffect(() => {
        getAccessCentresReports(setCentreData);
        bindCampRateType();
        setLoad(false);
    }, []);

    useEffect(() => {
        if (centreData.length === 1) {
            const centreID = centreData[0].value;
            setFormData((prev) => ({ ...prev, Centre: centreID }));
            bindCampRateType(centreID);
        }
    }, [centreData]);

    return (
        <>
            {load ? (
                <Loading />
            ) : (
                <Accordion
                    name={t("Get Reports For Camp Details Report")}
                    defaultValue={true}
                    isBreadcrumb={true}
                >
                    <div className="row px-2 mt-2 mb-2">
                        <div className="col-sm-2">
                            <SelectBox
                                className="required-fields"
                                lable={t("Select Centre")}
                                options={[{ label: "Select Centre", value: "" }, ...centreData]}
                                selectedValue={formData.Centre}
                                name="Centre"
                                onChange={handleSelectChange}
                            />
                        </div>

                        <div className="col-sm-2">
                            <SelectBox
                                className="required-fields"
                                lable={t("Select RateType")}
                                options={[
                                    { label: "Select RateType", value: "" },
                                    ...rateTypeData,
                                ]}
                                selectedValue={formData.RateType}
                                name="RateType"
                                onChange={handleSelectChange}
                            />
                        </div>

                        <div className="col-sm-2">
                            <DatePicker
                                name="FromDate"
                                id="FromDate"
                                value={formData.FromDate}
                                onChange={dateSelect}
                                placeholder=""
                                lable={t("From Date")}
                            />
                        </div>

                        {/* <div className="col-sm-1 mt-1">
                            <CustomTimePicker
                                value={formData.FromTime}
                                onChange={handleTime}
                                id="FromTime"
                                lable={t("From Time")}
                                name="FromTime"
                            />
                        </div> */}

                        <div className="col-sm-2">
                            <DatePicker
                                name="ToDate"
                                id="ToDate"
                                value={formData.ToDate}
                                onChange={dateSelect}
                                minDate={new Date(formData.FromDate)}
                                placeholder=""
                                lable={t("To Date")}
                            />
                        </div>

                        {/* <div className="col-sm-1 mt-1">
                            <CustomTimePicker
                                value={formData.ToTime}
                                onChange={handleTime}
                                id="ToTime"
                                lable={t("To Time")}
                                name="ToTime"
                            />
                        </div> */}

                        <div className="col-sm-2">
                            <SelectBox
                                className="required-fields"
                                options={DocumentType}
                                selectedValue={formData.DocumentType}
                                name="DocumentType"
                                onChange={handleSelectChange}
                                lable={t("Select DocumentType")}
                            />
                        </div>
                    </div>

                    <div className="row px-2 mb-2">
                        <div className="col-sm-2">
                            {loadingSearch ? (
                                <Loading />
                            ) : (
                                <CustomButton
                                    text={"Get Report"}
                                    icon={"excel"}
                                    onClick={getCampDetailsReport}
                                />
                            )}
                        </div>
                    </div>
                </Accordion>
            )}
        </>
    );
}

export default CampDetailsReports;
