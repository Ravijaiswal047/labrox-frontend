import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { apiUrls } from "../../utils/apiUrls";
import RadioInput from "../../components/formComponent/RadioInput";
import { BindEmployeeReports } from "../../utils/NetworkApi/commonApi";
import { CustomButton } from "../../components/UI/CustomButton";
import { ExportToExcel, formatStandardDate } from "../../utils/helpers";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";


const CollectionReportUser = () => {
    const [options, setOptions] = useState([]);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [user, setUser] = useState([]);
    const [reportType, setReportType] = useState("Summary");
    const [employee, setEmployee] = useState([]);

    const [payload, setPayload] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        Centre: [],
        User: [],
    })

    const handleChangeMap = (selectedOptions, name) => {
        const values = selectedOptions.map((opt) => opt.value);
        setPayload((prev) => ({
            ...prev,
            [name]: values,
        }));
    };

    const handleExcelReport = async () => {

        const apiPayload = {
            fromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
            userType: payload?.User || [],
            centreID: payload?.Centre || [],
        }
        await axiosReport
            .post("NepaliReports/UserCollectionReport", apiPayload)
            .then((res) => {
                console.log("CRReport", res);
                const rawData = res?.data?.data || [];
                if (rawData?.length > 0) {
                    const formattedData = rawData.map((item, index) => {
                        const row = {
                            "Sr. No": index + 1,
                            "EmployeeName": item.employeeName,
                            "Card": (item.card).toFixed(2),
                            "Cash": (item.cash).toFixed(2),
                            "ESewa": (item.eSewa).toFixed(2),
                            "Neft": (item.neft).toFixed(2),
                            "Total": (item.total).toFixed(2),
                        };

                        return row;
                    });

                    ExportToExcel(formattedData, "UserCollectionSummary.xlsx");
                    toast?.success(res?.data?.message || "Excel File Downloaded");
                } else {
                    toast.error(res?.data?.message || "No Report Found");
                }
            })
            .catch((err) => {
                toast.error(err?.data?.message || "Save failed! Please try again.");
            }).finally(() => {

            })

    };

    const handleExcelReportPatient = async () => {

        const apiPayload = {
            fromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
            userType: payload?.User || [],
            centreID: payload?.Centre || [],
        }
        await axiosReport
            .post("NepaliReports/CombinedCollectionReport", apiPayload)
            .then((res) => {
                console.log("CRReport", res);
                const rawData = res?.data?.data?.userSummary || [];
                if (rawData?.length > 0) {
                    const formattedData = rawData.map((item, index) => {
                        const row = {
                            "Sr. No": index + 1,
                            "EmployeeName": item.employeeName,
                            "Card": Number(item.card || 0).toFixed(2),
                            "Cash": Number(item.cash || 0).toFixed(2),
                            "ESewa": Number(item.eSewa || 0).toFixed(2),
                            "Neft": Number(item.neft || 0).toFixed(2),
                        };

                        return row;
                    });

                    ExportToExcel(formattedData, "UserCollectionPatientwise.xlsx");
                    toast.success(res?.data?.message || "Excel File Downloaded");
                } else {
                    toast.error(res?.data?.message || "No Report Found");
                }
            })
            .catch((err) => {
                toast.error(err?.data?.message || "Save failed! Please try again.");
            }).finally(() => {

            })

    };

    const getCollectionUserReport = async () => {

        const apiPayload = {
            fromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
            userType: payload?.User || [],
            centreID: payload?.Centre || [],
        }

        const url = reportType === "Summary" ? "NepaliReports/UserCollectionReport" : "NepaliReports/CombinedCollectionReport";
        dispatch(setLoading(true));

        await axiosReport
            .post(`${url}`, apiPayload)
            .then((res) => {
                console.log("summaryreport", res);
                const pdfUrl = res?.data?.url;
                if (pdfUrl) {
                    window.open(pdfUrl, "_blank");
                }else{
                    toast.success(res?.data?.message || "No data Found");
                }

            })
            .catch((err) => {
                toast.error(err?.data?.message || "Save failed! Please try again.");
                dispatch(setLoading(false));
            }).finally(() => {
                dispatch(setLoading(false));
            })

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

            })
            .catch((err) => {
                toast.error(err?.data?.message || "Save failed! Please try again.");
            }).finally(() => {

            })

    };

    const handleReportChange = (value) => {
        console.log("e.target.value", value);
        setReportType(value);
    };

    const dateSelect = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    useEffect(() => {
        getAllCentre();
        BindEmployeeReports(setEmployee);
    }, []);

    console.log("payload", payload);

    return (
        <>
            <Accordion
                name="User Wise Collection Report"
                isBreadcrumb={true}
                defaultValue={true}
            >
                <div className="row px-2 mt-2 mb-2">
                    <div className="col-sm-3 col-md-2 col-lg-2">
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

                    <div className="col-sm-3 col-md-2 col-lg-2">
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

                    <div className="col-sm-3 col-md-2 col-lg-2">

                        <SelectBoxWithCheckbox
                            options={employee}
                            name="User"
                            value={payload?.User}
                            placeholder={t("User")}
                            lable={t("User")}
                            onChange={(e) => {
                                handleChangeMap(e, "User");
                            }}
                        ></SelectBoxWithCheckbox>
                    </div>
                    <div className="col-sm-3 col-md-2 col-lg-2">
                        <SelectBoxWithCheckbox
                            options={options}
                            name="Centre"
                            value={payload?.Centre}
                            placeholder={t("Centre")}
                            lable={t("Centre")}
                            onChange={(e) => {
                                handleChangeMap(e, "Centre");
                            }}
                        ></SelectBoxWithCheckbox>
                    </div>
                    <div className="col-sm-6 col-md-4">
                        <div className="d-flex flex-wrap">
                            <label className="fw-bold mr-3 mb-0">Report Type :</label>

                            <RadioInput
                                label="Summary"
                                name="reportType"
                                type="radio"
                                checked={reportType === "Summary"}
                                onChange={() => handleReportChange("Summary")}

                                className="d-flex align-items-center"
                            />

                            <RadioInput
                                label="PatientWiseReport"
                                name="reportType"
                                type="radio"
                                checked={reportType === "PatientWiseReport"}
                                onChange={() => handleReportChange("PatientWiseReport")}

                                className="d-flex align-items-center"
                            />
                        </div>
                    </div>
                      <CustomButton text="Get Report" icon="pdf"
                        className="mb-1 mx-2"
                        onClick={getCollectionUserReport} 
                        />
                    
                    
                        <CustomButton text="Excel Export" icon="excel"
                        className="mb-1 mx-2"
                        onClick={reportType === "Summary" ? handleExcelReport : handleExcelReportPatient} 
                        />
                </div>
                
                    
                      
                    
                
            </Accordion>
        </>
    );
};

export default CollectionReportUser;
