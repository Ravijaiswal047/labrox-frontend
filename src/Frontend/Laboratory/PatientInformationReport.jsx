import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { ExportToExcel, formatStandardDate } from "../../utils/helpers";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { CustomButton } from "../../components/UI/CustomButton";
import RadioInput from "../../components/formComponent/RadioInput";
import { Form } from "react-bootstrap";

const PatientInformationReport = () => {
    const [options, setOptions] = useState([]);
    const [DepartmentData, setDepartmentData] = useState([]);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [payload, setPayload] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        Centre: "",
        Department: "",
        ReportType: "ListWithDept",
        OnlyDuePatient : 0,
        OnlyDiscountPatient: 0,
        isUrgent : 0
    })

    console.log("payload", payload);

    const handleChangeMap = (selectedOptions, name) => {
        const values = selectedOptions.map((opt) => opt.value);
        setPayload((prev) => ({
            ...prev,
            [name]: values,
        }));
    };

    const handleReportChange = (value) => {
        console.log("e.target.value", value);
        setPayload((prev) => ({...prev,ReportType : value}));
    };

    const dateSelect = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChanges = (e) => {
        const { name, value, checked, type } = e.target;
        console.log(name, value, checked, type);
        
          setPayload((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
          }));
      };

    const formatKeys = (data) => {
        return data.map((item, index) => {
            const newItem = {
                "Sr.No": index + 1
            };

            Object.keys(item).forEach((key) => {
                // Convert key → First Letter Capital
                const formattedKey =
                    key.charAt(0).toUpperCase() + key.slice(1);

                newItem[formattedKey] = item[key];
            });

            return newItem;
        });
    };

    const getPatientInfoReport = async () => {
    
            const apiPayload = {
                fromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
                toDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
                deptList: payload?.Department?.length > 0 ? payload?.Department?.join(",") : "",
                centreIds: payload?.Centre?.length > 0 ? payload?.Centre?.join(",") : "",
                onlyDue: payload?.OnlyDuePatient?.toString() || 0,
                onlyDiscount : payload?.OnlyDiscountPatient?.toString() || 0,
                 isUrgent : payload?.isUrgent || 0,
                ReportFormat: "pdf",
            }
            console.log("apiPayload", apiPayload);
    
            const url = 
                payload?.ReportType === "ListWithTest" ? "NPLReport/PatientListWithTest" :
                payload?.ReportType==="CentreSummeryReport2"? "NPLReport/CentreSummeryReport2":
                payload?.ReportType === "ListWithOutTest" ? "NPLReport/PatientListWithOutTest" :
                payload?.ReportType === "AverageCentreSummeryReport" ? "NPLReport/AverageCentreSummeryReport" :
                payload?.ReportType === "ListWithDept" ? "NPLReport/PatientListDeptTest" :
                payload?.ReportType === "CentreSummaryReport" ? "NPLReport/CentreSummeryReport" :
                "NPLReport/PatientListDeptTest";
                
            dispatch(setLoading(true));
               
           

            await axiosReport
                .post(`${url}`, apiPayload, { responseType: "blob" })
                .then(async (res) => {
                    const contentType = res.headers?.["content-type"] || "";
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
                    const pdfBlob = new Blob([res.data], {
                        type: "application/pdf",
                    });
                    const pdfUrl = window.URL.createObjectURL(pdfBlob);
                    window.open(pdfUrl, "_blank");
                })
                .catch(async (err) => {
                    if (err?.response?.data instanceof Blob) {
                        const text = await err.response.data.text();
                        try {
                            const json = JSON.parse(text);
                            toast.error(json?.message || "Error fetching report");
                        } catch (e) {
                            toast.error("Error fetching report");
                        }
                    } else {
                        toast.error(err?.response?.data?.message || "Error fetching report");
                    }
                }).finally(() => {
                    dispatch(setLoading(false));
                })
    
        };


    const handleExcelReport = async () => {
        const apiPayload = {
            fromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
            deptList: payload?.Department?.length > 0 ? payload?.Department?.join(",") : "",
            centreIds: payload?.Centre?.length > 0 ? payload?.Centre?.join(",") : "",
            onlyDue: payload?.OnlyDuePatient?.toString() || 0,
            onlyDiscount: payload?.OnlyDiscountPatient?.toString() || 0,
            isUrgent : payload?.isUrgent || 0,
            reportFormat: "Excel",
        };

        const url =
            payload?.ReportType === "ListWithTest"
                ? "NPLReport/PatientListWithTest"
                : payload?.ReportType==="CentreSummeryReport2"
                ? "NPLReport/CentreSummeryReport2"
                  : payload?.ReportType==="AverageCentreSummeryReport"
                ? "NPLReport/AverageCentreSummeryReport"
                : payload?.ReportType === "ListWithOutTest"
                ? "NPLReport/PatientListWithOutTest"
                : payload?.ReportType === "ListWithDept"
                ? "NPLReport/PatientListDeptTest"
                : payload?.ReportType === "CentreSummaryReport"
                ? "NPLReport/CentreSummeryReport"
                : "NPLReport/PatientListDeptTest";

        dispatch(setLoading(true));
        await axiosReport
            .post(`${url}`, apiPayload, { responseType: "blob" })
            .then(async (res) => {
                const contentType = res.headers?.["content-type"] || "";
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
                if (res?.data) {
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", `${payload?.ReportType}.xlsx`);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                    toast.success("Excel File Downloaded");
                } else {
                    toast.error("No data found");
                }
            })
            .catch((err) => {
                toast.error(
                    err?.data?.message || "Save failed! Please try again."
                );
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
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
    
            setDepartmentData(DeptDataValue);
          })
          .catch((err) => console.log(err));
      };

    useEffect(() => {
        getAllCentre();
        getDepartment();
    }, []);

    console.log("payload", payload);

    return (
        <>
            <Accordion
                name="Patient Information Report"
                isBreadcrumb={true}
                defaultValue={true}
            >
                <div className="row px-2 mt-2 mb-2">
                    
                    <div className="col-6 col-md-3 col-lg-2 my-1">
                        <SelectBoxWithCheckbox
                            options={options}
                            name="Centre"
                            value={payload?.Centre}
                            placeholder={t("Centre")}
                            onChange={(e) => {
                                handleChangeMap(e, "Centre");
                            }}
                            lable={t("Centre")}
                        ></SelectBoxWithCheckbox>
                    </div>
                    <div className="col-6 col-md-3 col-lg-2 my-1">
                        <SelectBoxWithCheckbox
                            options={DepartmentData}
                            name="Department"
                            value={payload?.Department}
                            placeholder={t("Department")}
                            onChange={(e) => {
                                handleChangeMap(e, "Department");
                            }}
                            lable={t("Department")}
                        ></SelectBoxWithCheckbox>
                    </div>
                    <div className="col-6 col-md-3 col-lg-2 my-1">
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
                    <div className="col-6 col-md-3 col-lg-2 my-1">
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

                    <div className="col-12 my-1 d-flex flex-wrap align-items-center" style={{ gap: "8px" }}>
                        <div className="d-flex flex-wrap align-items-center px-2" style={{ gap: "8px" }}>
                            <Form.Check
                                type="switch"
                                id="OnlyDuePatient"
                                name="OnlyDuePatient"
                                label={t("Only Due Patient")}
                                checked={payload?.OnlyDuePatient}
                                onChange={(e) => handleChanges(e)}
                                className="m-0 mr-2"
                            />
                            <Form.Check
                                type="switch"
                                id="OnlyDiscountPatient"
                                name="OnlyDiscountPatient"
                                label={t("Only Discount Patient")}
                                checked={payload?.OnlyDiscountPatient}
                                onChange={(e) => handleChanges(e)}
                                className="m-0 mr-2"
                            />

                             <Form.Check
                                type="switch"
                                id="isUrgent"
                                name="isUrgent"
                                label={t("Is Urgent")}
                                checked={payload?.isUrgent}
                                onChange={(e) => handleChanges(e)}
                                className="m-0 mr-2"
                            />


                        </div>
                    </div>

                    <div className="col-12 my-1 px-2">
                        <div className="d-flex flex-wrap align-items-center" style={{ gap: "8px" }}>
                            <label className="font-weight-bold mb-0">Report Type :</label>
                            <RadioInput
                                label="Patient List With Dept"
                                name="reportType"
                                type="radio"
                                checked={payload?.ReportType === "ListWithDept"}
                                onChange={() => handleReportChange("ListWithDept")}
                                className="d-flex align-items-center"
                            />
                            <RadioInput
                                label="Patient List With Test"
                                name="reportType"
                                type="radio"
                                checked={payload?.ReportType === "ListWithTest"}
                                onChange={() => handleReportChange("ListWithTest")}
                                className="d-flex align-items-center"
                            />
                            <RadioInput
                                label="Patient List Without Test"
                                name="reportType"
                                type="radio"
                                checked={payload?.ReportType === "ListWithOutTest"}
                                onChange={() => handleReportChange("ListWithOutTest")}
                                className="d-flex align-items-center"
                            />
                            <RadioInput
                                label="Centre Summary Report"
                                name="reportType"
                                type="radio"
                                checked={payload?.ReportType === "CentreSummaryReport"}
                                onChange={() => handleReportChange("CentreSummaryReport")}
                                className="d-flex align-items-center"
                            />
                            <RadioInput
                                label="Patient count summary"
                                name="reportType"
                                type="radio"
                                checked={payload?.ReportType === "CentreSummeryReport2"}
                                onChange={() => handleReportChange("CentreSummeryReport2")}
                                className="d-flex align-items-center"
                            />
                            <RadioInput
                                label="Average Patient Summary"
                                name="reportType"
                                type="radio"
                                checked={payload?.ReportType === "AverageCentreSummeryReport"}
                                onChange={() => handleReportChange("AverageCentreSummeryReport")}
                                className="d-flex align-items-center"
                            />
                        </div>
                    </div>
                    {/* <div className="d-flex flex-wrap align-items-center gap-3 ">
                        <div className="d-flex flex-wrap align-items-center g-2 px-2 mb-1 justify-content-end">
                            <Form.Check
                                type="switch"
                                id="OnlyDuePatient"
                                name="OnlyDuePatient"
                                label={t("Only Due Patient")}
                                checked={payload?.OnlyDuePatient}
                                onChange={(e) => handleChanges(e)}
                                className="m-0 mr-2"
                            />
                            <Form.Check
                                type="switch"
                                id="OnlyDiscountPatient"
                                name="OnlyDiscountPatient"
                                label={t("Only Discount Patient")}
                                checked={payload?.OnlyDiscountPatient}
                                onChange={(e) => handleChanges(e)}
                                className="m-0 mr-2"
                            />

                             <Form.Check
                                type="switch"
                                id="isUrgent"
                                name="isUrgent"
                                label={t("Is Urgent")}
                                checked={payload?.isUrgent}
                                onChange={(e) => handleChanges(e)}
                                className="m-0 mr-2"
                            />


                        </div>
                    </div> */}
                    {/* <div className="col-sm-3 col-md-3 col-lg-2">
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
                    </div> */}

                    {/* <div className="col-sm-3 col-md-3 col-lg-2">
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
                    </div>        */}
                    <div className="col-12 my-1 d-flex flex-wrap align-items-center" style={{ gap: "8px" }}>
                        <CustomButton text="Get Report" icon="pdf" onClick={getPatientInfoReport} />
                        <CustomButton text="Excel Export" icon="excel" onClick={handleExcelReport} />
                    </div>
                </div>
            </Accordion>
        </>
    );
};

export default PatientInformationReport;
