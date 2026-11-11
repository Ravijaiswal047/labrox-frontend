import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { apiUrls } from "../../utils/apiUrls";
import { ExportToExcel, formatStandardDate } from "../../utils/helpers";
import { CustomButton } from "../../components/UI/CustomButton";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";

const AnnualSalesReport = () => {
   
    const [options, setOptions] = useState([]);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [payload, setPayload] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        Centre: [],
    })

    const handleChangeMap = (selectedOptions, name) => {
        const values = selectedOptions.map((opt) => opt.value);
        setPayload((prev) => ({
            ...prev,
            [name]: values, 
        }));
    };

       const handleMultiSelectChange = (name, value) => {
         setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
       }
    
    const dateSelect = (value, name) => {
                setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleExcelReport = async () => {
        if (!payload?.Centre || payload?.Centre?.length === 0) {
            toast.error("Please select at least one centre");
            return;
        }

        const apiPayload = {
            fromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
            centreIds: payload.Centre || [],
            ReportFormat: "Excel",
        };

        try {
            dispatch(setLoading(true));
            const res = await axiosReport.post(apiUrls?.SalesReport, apiPayload, {
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
            link.setAttribute("download", "Annual_Sales_Report.xlsx");
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
                toast.error(json?.message || "Save failed! Please try again.");
            } catch {
                toast.error("Save failed! Please try again.");
            }
            return;
            }
            toast.error(err?.response?.data?.message || "Save failed! Please try again.");
        } finally {
            dispatch(setLoading(false));
        }
        };

     const getSalesReport = async () => {
        if(!payload?.Centre || payload?.Centre?.length === 0){
            toast.error("Please select at least one centre");
            return;
        }
            const apiPayload = {
                fromDate: formatStandardDate(payload.FromDate,"YYYY-MM-DD"),
                toDate: formatStandardDate(payload.ToDate,"YYYY-MM-DD"),
                centreIds: payload.Centre || [],
                ReportFormat:"PDF"
            }
            dispatch(setLoading(true));
    
            await axiosReport
                .post(apiUrls?.SalesReport,apiPayload)
                .then((res) => {
                    console.log("salesreport", res);
                    const pdfUrl = res?.data?.url;
                    if (pdfUrl) {
                        window.open(pdfUrl, "_blank"); 
                    } else {
                        toast.error(res?.data?.message || "No Report Found");
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

    useEffect(()=>{
        getAllCentre();
    },[]);

    return (
        <>
            <Accordion
                name="Annual Sales Report"
                isBreadcrumb={true}
                defaultValue={true}
            >
                <div className="row px-2 mt-2 mb-2">
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

                        <div className="col-sm-12">
                            <MultiSelectComp
                                label="All Centre"
                                options={options}
                                value={payload?.Centre}
                                name="Centre"
                                onChange={handleMultiSelectChange}
                                lable={t("Select Centre")}
                            />
                        </div>
                    </div>
                    <CustomButton text="Get Report" icon="pdf" onClick={getSalesReport} className="mb-1 mx-2"  />
                    <CustomButton text="Excel Export" icon="excel" onClick={handleExcelReport} className="mb-1 mx-2"/>
                    
                </div>
            </Accordion>
        </>
    );
};

export default AnnualSalesReport;
