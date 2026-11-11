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
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { CustomButton } from "../../components/UI/CustomButton";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { getAccessDataRateReport } from "../../utils/NetworkApi/commonApi";
import ReactSelect from "../../components/formComponent/ReactSelect";

const AnnualPanelReport = () => {
    const [options, setOptions] = useState([]);
    const [rateTypes, setRateTypes] = useState([]);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [payload, setPayload] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        Centre: [],
        MultipleRateType: [],
        LedgerMode: ""
    })

    const handleSelectChange = (name, value) => {
    setPayload({ ...payload, [name]: value?.value });
  };

    const dateSelect = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const getPanelReport = async () => {
        const apiPayload = {
            fromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
            toDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
            centreIds: payload.Centre || [],
            rateTypeIds: payload.MultipleRateType || [],
            ReportType: "pdf",
        }
        dispatch(setLoading(true));

        await axiosReport
            .post(apiUrls?.PanelReport, apiPayload)
            .then((res) => {
                console.log("panelreport", res);
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
    const handleExcelReport = async () => {
  const apiPayload = {
    fromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
    toDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
    centreIds: payload.Centre || [],
    rateTypeIds: payload.MultipleRateType || [],
    ReportType: "Excel",
  };

  try {
    dispatch(setLoading(true));
    const res = await axiosReport.post(apiUrls?.PanelReport, apiPayload, {
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
    link.setAttribute("download", "Panel_Report.xlsx");
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


const handleExcelReportAnnual = async () => {
  const apiPayload = {
    fromDate: formatStandardDate(payload.FromDate, "YYYY-MM-DD"),
    toDate: formatStandardDate(payload.ToDate, "YYYY-MM-DD"),
    centreIds: payload.Centre || [],
    rateTypeIds: payload.MultipleRateType || [],
    ReportType: "DetailExcel",
  };

  try {
    dispatch(setLoading(true));
    const res = await axiosReport.post(apiUrls?.PanelReport, apiPayload, {
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
    link.setAttribute("download", "Annual_Panel_Report.xlsx");
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
        toast.error(json?.message || "Something went wrong.");
      } catch {
        toast.error("Something went wrong.");
      }
      return;
    }
    toast.error(err?.response?.data?.message || "Something went wrong.");
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
        if (name === "Centre") {
            setPayload((prev) => ({
                ...prev,
                Centre: value,
                MultipleRateType: [],
            }));
            getAccessDataRateReport(setRateTypes, Array.isArray(value) ? value : []);
        } else {
            setPayload((prev) => ({ ...prev, [name]: value }));
        }
    };

    console.log("payload", payload);

    return (
        <>
            <Accordion
                name="Annual Panel Report"
                isBreadcrumb={true}
                defaultValue={true}
            >
                <div className="row px-2 mt-2 mb-2">
                    {/* <div className="col-sm-3 col-md-3 col-lg-2">
                        <SelectBoxWithCheckbox
                            options={options}
                            name="Centre"
                            value={payload?.Centre}
                            placeholder={t("Centre")}
                            onChange={(e) => {
                                handleChangeMap(e, "Centre");
                            }}
                            lable={t("Centre")}

                        />
                    </div> */}
                     <div className="col-sm-2">
                        <MultiSelectComp
                            label="All Centre"
                            options={options}
                            value={payload?.Centre}
                            name="Centre"
                            onChange={handleSelectMultiChange}
                            lable={t("Select Centre")}
                        />
                    </div>

                
                    <div className="col-sm-2">
                        <MultiSelectComp
                            label="All RateType"
                            options={rateTypes}
                            value={payload?.MultipleRateType}
                            name="MultipleRateType"
                            onChange={handleSelectMultiChange}
                            lable={t("Select RateType")}
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
                            dynamicOptions={[
                                {label: 'Cash', value: 'Cash'},
                                {label: 'Credit', value: 'Credit'},
                                {label: 'Both', value: 'Both'}
                            ]}
                            name="LedgerMode"
                            lable={t("LedgerMode")}
                            id="LedgerMode"
                            removeIsClearable={true}
                            placeholderName={t("LedgerMode")}
                            value={payload?.LedgerMode}
                            onChange={handleSelectChange}
                            />
                    </div>
                    <div className="col-auto">
                        <CustomButton text="Get Report" icon="pdf" onClick={getPanelReport} className="mb-1 mx-2"/>    
                    </div>
                    <div className="col-auto">
                        <CustomButton text="Excel Export" icon="excel" className="mb-1 mx-2" onClick={handleExcelReport}/>
                    </div>
                    <div className="col-auto">
                        <CustomButton text="Detail Report" icon="excel" className="mb-1 mx-2" onClick={handleExcelReportAnnual}/>
                    </div>
                </div>
            </Accordion>
        </>
    );
};

export default AnnualPanelReport;
