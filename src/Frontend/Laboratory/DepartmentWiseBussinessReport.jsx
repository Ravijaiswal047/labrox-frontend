import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { formatStandardDate } from "../../utils/helpers";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { CustomButton } from "../../components/UI/CustomButton";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { getAccessDataRateReport } from "../../utils/NetworkApi/commonApi";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";

const DepartmentWiseBussinessReport = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [centreOptions, setCentreOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [rateType, setRateType] = useState([]);

    const [payload, setPayload] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        Centre: [],
        Department: [],
        RateType: [],
        ReportFormat: "pdf",
        ReportType: "Summary",
    });

    const handleChangeMap = (selectedOptions, name) => {
        const values = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
        setPayload((prev) => ({
            ...prev,
            [name]: values,
        }));
    };

    const handleSelectChange = (name, e) => {
        setPayload((prev) => ({
            ...prev,
            [name]: e?.value,
        }));
    };

    const dateSelect = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

      useEffect(() => {
                getAccessDataRateReport(setRateType, payload.Centre);
            }, [payload.Centre]);

    const getAllCentre = async () => {
        await axiosInstance
            .get("centre/getGlobalCentres")
            .then((res) => {
                const resList = res?.data?.message?.map((item) => ({
                    ...item,
                    label: item?.Centre,
                    value: item?.CentreID,
                }));
                setCentreOptions(resList);
            })
            .catch((err) => {
                toast.error(err?.data?.message || "Failed to fetch centres.");
            });
    };

    const getDepartment = () => {
        axiosInstance
            .get("Department/getDepartment")
            .then((res) => {
                let data = res.data.message;
                let DeptDataValue = data.map((ele) => {
                    return {
                        value: ele.DepartmentID,
                        label: ele.Department,
                    };
                });
                setDepartmentOptions(DeptDataValue);
            })
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        getAllCentre();
        getDepartment();
    }, []);

    const handleDownload = async (format) => {
        const apiPayload = {
            fromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
            deptID: payload?.Department?.length > 0 ? payload?.Department?.join(",") : "",
            rateTypeIds: payload?.RateType?.length > 0 ? payload.RateType.join(",") : "",
            centreIds: payload?.Centre?.length > 0 ? payload?.Centre?.join(",") : "",
            reportFormat: format === "pdf" ? "pdf" : "Excel",
        };

        const url = payload.ReportType === "Detail"
            ? "CombineBussinessReport/DeptWiseBusinessDetail"
            : "CombineBussinessReport/DeptWiseBusinessSummary";

        const isExcel = format === "excel";
        dispatch(setLoading(true));

        try {
            let res;
            try {
                res = await axiosReport.post(url, apiPayload, { responseType: "blob" });
            } catch (err) {
                if (err?.response?.status === 404) {
                    const altUrl = url.replace("CombineBussinessReport", "CombineBusinessReport");
                    res = await axiosReport.post(altUrl, apiPayload, { responseType: "blob" });
                } else {
                    throw err;
                }
            }

            const contentType = res?.headers?.["content-type"] || "";
            if (contentType.includes("application/json")) {
                const text = await res.data.text();
                const json = JSON.parse(text);
                if (json?.url) {
                    window.open(json.url, "_blank");
                } else {
                    toast.warning(json?.message || "No records found.");
                }
                return;
            }

            if (isExcel) {
                if (res?.data) {
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", `DepartmentWiseBusinessReport.xlsx`);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                    toast.success("Excel File Downloaded");
                } else {
                    toast.error("No data found");
                }
            } else {
                const pdfBlob = new Blob([res.data], {
                    type: "application/pdf",
                });
                const pdfUrl = window.URL.createObjectURL(pdfBlob);
                window.open(pdfUrl, "_blank");
            }
        } catch (err) {
            if (err?.response?.data instanceof Blob) {
                const text = await err.response.data.text();
                try {
                    const json = JSON.parse(text);
                    toast.error(json?.message || "Error fetching report");
                } catch (e) {
                    toast.error("Error fetching report");
                }
            } else {
                toast.error(err?.response?.data?.message || err?.message || "Error fetching report");
            }
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <>
            <Accordion
                name={t("Department Wise Business Report")}
                isBreadcrumb={true}
                defaultValue={true}
            >
                <div className="row px-2 mt-2 mb-2 align-items-center">
                    <div className="col-sm-3 col-md-3 col-lg-2">
                        <SelectBoxWithCheckbox
                            options={centreOptions}
                            name="Centre"
                            value={payload?.Centre}
                            placeholder={t("Centre")}
                            onChange={(e) => {
                                handleChangeMap(e, "Centre");
                            }}
                            lable={t("Centre")}
                        />
                    </div>
                     <div className="col-sm-3 mb-1">
                                        <MultiSelectComp
                                            label="Rate Type"
                                            options={rateType}
                                            name="RateType"
                                            value={payload?.RateType}
                                            onChange={(name, values) => setPayload((prev) => ({ ...prev, [name]: values }))}
                                            lable={t("Select Rate")}
                                            removeIsClearable={false}
                                        />
                                    </div>

                    <div className="col-sm-3 col-md-3 col-lg-2">
                        <SelectBoxWithCheckbox
                            options={departmentOptions}
                            name="Department"
                            value={payload?.Department}
                            placeholder={t("Department")}
                            onChange={(e) => {
                                handleChangeMap(e, "Department");
                            }}
                            lable={t("Department")}
                        />
                    </div>
                    <div className="col-sm-3 col-md-3 col-lg-2">
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

                      
                    <div className="col-sm-3 col-md-3 col-lg-2">
                        <DatePicker
                            className="custom-calendar"
                            name="ToDate"
                            value={payload?.ToDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="ToDate"
                            lable={t("ToDate")}
                            maxDate={new Date()}
                            minDate={payload?.FromDate}
                        />
                    </div>
                    <div className="col-sm-3 col-md-3 col-lg-2">
                        <ReactSelect
                            className="required-fields"
                            dynamicOptions={[
                                { label: t("Summary"), value: "Summary" },
                                { label: t("Detail"), value: "Detail" },
                            ]}
                            value={payload?.ReportType}
                            name="ReportType"
                            onChange={handleSelectChange}
                            placeholderName={t("Report Type")}
                            removeIsClearable={true}
                        />
                    </div>
                   <div className="col-sm-2 mb-2">
    <div className="d-flex gap-2">
        <CustomButton
            text={t("PDF")}
            icon="pdf"
            onClick={() => handleDownload("pdf")}
           
            
            className="mr-2"
        />
        <CustomButton
            text={t("Excel")}
            icon="excel"
            onClick={() => handleDownload("excel")}
            
        />
    </div>
</div>
                </div>
            </Accordion>
        </>
    );
};

export default DepartmentWiseBussinessReport;