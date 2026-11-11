import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import Loading from "../../components/loader/Loading";
import { getAccessCentresReports, getDepartmentReports, getDoctorSuggestion, getAccessDataRateReport } from "../../utils/NetworkApi/commonApi";
import { Form } from "react-bootstrap";
import Input from "../../components/formComponent/Input";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { downloadExcelBlob, openPdfBlob } from '../../utils/helpers';
import { Tooltip as ReactTooltip } from "react-tooltip";

const ReportFormatSecond = [
    {
        label: "Summary",
        value: "0",
    },
    {
        label: "Detail",
        value: "1",
    },
    {
        label: "Collection Summary",
        value: "2",
    },
    {
        label: "Doctor List With Test",
        value: "3",
    },
    {
        label: "Doctor List Without Test",
        value: "4",
    },
];

const ledgerOptions = [
    { label: "Both", value: "0" },
    { label: "Cash", value: "1" },
    { label: "Credit", value: "2" },
];






const defaultFormData = {
    Centre: [],
    DepartmentID: [],
    doctorIds: [],
    rateTypeIds: [],
    reportType: ReportFormatSecond[0].value,
    FromDate: new Date(),
    ToDate: new Date(),
    DoctorName: "",
    DoctorID: "",
    ShowLedger:null
};

const DoctorWiseListReport = () => {
    const { t } = useTranslation();

    const [Department, setDepartment] = useState([]);
    const [CentreData, setCentreData] = useState([]);
    const [formData, setFormData] = useState(defaultFormData);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [RateType, setRateType] = useState([]);
    const [doctorSuggestion, setDoctorSuggestion] = useState([]);
    const [selectedDoctors, setSelectedDoctors] = useState([]);
    const [dropFalse, setDropFalse] = useState(false);
    const [indexMatch, setIndexMatch] = useState(-1);
    const userData = useLocalStorage("userData", "get");
    const DefaultCurrencyName = userData?.DefaultCurrencyName;
   

    useEffect(() => {
        getDepartmentReports(setDepartment);
        getAccessCentresReports(setCentreData);
    }, []);

    useEffect(() => {
        getAccessDataRateReport(setRateType, formData.Centre);
    }, [formData.Centre]);

    const handleSelectMultiChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const dateSelect = (date, name) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
    };

    const handleListSearch = (data, name) => {
        const doctorItem = {
            value: data.DoctorReferalID,
            label: data.Name,
            Mobile: data.Mobile,
        };

        if (!selectedDoctors.find((d) => d.value === doctorItem.value)) {
            const updated = [...selectedDoctors, doctorItem];
            setSelectedDoctors(updated);
            setFormData((prev) => ({
                ...prev,
                [name]: "",
                DoctorID: "",
                doctorIds: updated.map((d) => d.value),
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: "" }));
        }

        setDropFalse(false);
        setDoctorSuggestion([]);
    };

    const handleRemoveDoctor = (value) => {
        const updated = selectedDoctors.filter((d) => d.value !== value);
        setSelectedDoctors(updated);
        setFormData((prev) => ({ ...prev, doctorIds: updated.map((d) => d.value) }));
    };

    const handleIndex = (e) => {
        if (e.keyCode === 40 && indexMatch < doctorSuggestion.length - 1) {
            setIndexMatch(indexMatch + 1);
        } else if (e.keyCode === 38 && indexMatch > 0) {
            setIndexMatch(indexMatch - 1);
        } else if (e.keyCode === 13 && indexMatch > -1) {
            handleListSearch(doctorSuggestion[indexMatch], "DoctorName");
        }
    };

    useEffect(() => {
        if (formData.DoctorName.length > 0 && dropFalse) {
            getDoctorSuggestion(formData, setDoctorSuggestion);
        } else {
            setDoctorSuggestion([]);
        }
    }, [formData.DoctorName, dropFalse]);

    const buildPayload = (reportFormat) => {
        const fmt = (d) =>
            d instanceof Date
                ? `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`
                : d;

        return {
            fromDate: fmt(formData.FromDate),
            toDate: fmt(formData.ToDate),
            reportFormat: reportFormat,
            centres: Array.isArray(formData.Centre) ? formData.Centre.map(Number) : [],
            doctorIds: Array.isArray(formData.doctorIds) ? formData.doctorIds.map(Number) : [],
            departmentIds: Array.isArray(formData.DepartmentID) ? formData.DepartmentID.map(Number) : [],
            rateTypeIds: Array.isArray(formData.rateTypeIds) ? formData.rateTypeIds.map(Number) : [],
            reportType: formData.reportType || "0",
            LedgerMode: formData.ShowLedger?.value ||ledgerOptions[0].value,
            showOnlyDue: false
        };
    };


    const handlePDF = async () => {
        console.log("apiPayload", buildPayload("Pdf"));
        setLoadingSearch(true);
        try {
            const res = await axiosReport.post(
                "CombineLabReport/DoctorBusinessReport/DoctorBusinessReport",
                buildPayload("Pdf"),
                { responseType: "blob" }
            );
              

            const contentType = res.headers?.["content-type"] || "";
           
            if (contentType.includes("application/json")) {
                const text = await res.data.text();
                const json = JSON.parse(text);
                toast.warning(json?.message || "No records found.");
                return;
            }

            

                openPdfBlob(res.data);
                toast.success("PDF report generated successfully");
            
        } catch (err) {
           toast.error(err?.message || "Error fetching PDF report");
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleExcel = async () => {
        setLoadingSearch(true);
        try {
            const res = await axiosReport.post(
                "CombineLabReport/DoctorBusinessReport/DoctorBusinessReport",
                buildPayload("Excel"),
                { responseType: "blob" }
            );
                  
             const contentType = res.headers?.["content-type"] || "";

            if (contentType.includes("application/json")) {
                const text = await res.data.text();
                const json = JSON.parse(text);
                toast.warning(json?.message || "No records found.");
                return;
            }

            downloadExcelBlob(res.data, `DoctorWiseListReport`);
            toast.success(t("Excel downloaded successfully"));

        } catch (err) {
            if (err?.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const json = JSON.parse(text);
                    toast.error(json?.message || "Error fetching Excel report");
                } catch {
                    toast.error("Error fetching Excel report");
                }
            } else {
                toast.error(err?.response?.data?.message || err?.message || "Error fetching Excel report");
            }
        } finally {
            setLoadingSearch(false);
        }
    };


    return (
        <Accordion name={t("Doctor Wise List Report")} defaultValue={true} isBreadcrumb={true}>
            <div className="row pt-2 px-2 mb-2">
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        label="All Centre"
                        options={CentreData}
                        value={formData.Centre}
                        name="Centre"
                        onChange={handleSelectMultiChange}
                        lable={t("Select Centre")}
                    />
                </div>

                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        options={Department}
                        id="DepartmentID"
                        label="Department"
                        name="DepartmentID"
                        value={formData.DepartmentID}
                        onChange={handleSelectMultiChange}
                        searchable={true}
                    />
                </div>

                <div className="col-sm-2">
                    <div className="p-inputgroup d-flex" style={{ position: "relative" }}>
                        <div style={{ width: "100%" }}>
                            <div className="d-flex align-items-center">
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Input
                                        id="DoctorName"
                                        name="DoctorName"
                                        lable={t("Referred Doctor")}
                                        onChange={(e) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                DoctorName: e.target.value,
                                                DoctorID: ""
                                            }));
                                            setDropFalse(true);
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => {
                                                setDropFalse(false);
                                                setIndexMatch(-1);
                                            }, 200);
                                        }}
                                        value={formData?.DoctorName}
                                        onKeyDown={handleIndex}
                                        //  placeholder={t("Search Doctor")}
                                        type="text"
                                        autoComplete="off"
                                    />
                                </div>
                                {selectedDoctors.length > 0 && (
                                    <span className="d-flex align-items-center counticon">
                                        {selectedDoctors.length}
                                        <i
                                            className="bi bi-info-circle-fill infoIcon_cls"
                                            data-tooltip-id="referred-doctor-tooltip"
                                        ></i>
                                        <ReactTooltip
                                            id="referred-doctor-tooltip"
                                            place="bottom"
                                            clickable={true}
                                            content={
                                                <div>
                                                    <h2 className="mb-1 border-bottom">
                                                        {t("Referred Doctor")} ({selectedDoctors.length})
                                                    </h2>
                                                    <ul className="mb-0 pl-3">
                                                        {selectedDoctors?.map((doc, idx) => (
                                                            <li
                                                                key={doc.value}
                                                                className="mb-2 d-flex justify-content-between align-items-center"
                                                            >
                                                                <span>
                                                                    {idx + 1}. {doc.label}
                                                                </span>
                                                                <i
                                                                    className="fa fa-times ml-2"
                                                                    style={{ cursor: "pointer", color: "red" }}
                                                                    onClick={() => handleRemoveDoctor(doc.value)}
                                                                />
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            }
                                            style={{ zIndex: 9999 }}
                                        />
                                    </span>
                                )}
                            </div>
                            {dropFalse && doctorSuggestion.length > 0 && (
                                <ul
                                    className="suggestion-data"
                                    style={{
                                        zIndex: 9999,
                                        width: "100%",
                                        position: "absolute",
                                        top: "100%",
                                        left: 0,
                                        background: "white",
                                        padding: 0,
                                        margin: 0,
                                        listStyle: "none",
                                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                        border: "1px solid #ddd",
                                        maxHeight: "200px",
                                        overflowY: "auto"
                                    }}
                                >
                                    {doctorSuggestion.map((data, index) => (
                                        <li
                                            key={index}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleListSearch(data, "DoctorName");
                                            }}
                                            style={{
                                                padding: "8px",
                                                cursor: "pointer",
                                                backgroundColor: index === indexMatch ? "#4aa0fcff" : "white",
                                                color: index === indexMatch ? "white" : "black",
                                            }}
                                        >
                                            {data.Name} {data.Mobile && `(${data.Mobile})`}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        className="custom-calendar"
                        name="FromDate"
                        value={formData.FromDate}
                        onChange={dateSelect}
                        maxDate={new Date()}
                        lable={t("From Date")}
                    />
                </div>

                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        className="custom-calendar"
                        name="ToDate"
                        value={formData.ToDate}
                        onChange={dateSelect}
                        maxDate={new Date()}
                        minDate={new Date(formData.FromDate)}
                        lable={t("To Date")}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        label="Rate Type"
                        options={RateType}
                        value={formData.rateTypeIds}
                        name="rateTypeIds"
                        onChange={handleSelectMultiChange}
                        lable={t("Select Rate Type")}
                    />
                </div>

                  <div className="col-12 col-sm-6 col-md-2 my-1">

                 <ReactSelect
                            id="ShowLedger"
                            placeholderName="Select Ledger mode"
                            name="ShowLedger"
                             removeIsClearable={true}
                            dynamicOptions={ledgerOptions}
                            value={formData.ShowLedger?.value||ledgerOptions[0].value}
                            onChange={(name, value) =>{

                                setFormData((prev) => ({ ...prev, [name]: value }))
                            }}
                        />
                        </div>





                <div className="col-12 col-sm-auto my-1 d-flex flex-column flex-sm-row align-items-start align-items-sm-center flex-wrap gap-2">
                    <label className="mb-0 mr-2"><strong>{t("Report Type")}:</strong></label>
                    {ReportFormatSecond.map((opt) => (
                        <Form.Check
                            key={opt.value}
                            type="switch"
                            id={`reportFormatSecond-${opt.value}`}
                            label={t(opt.label)}
                            checked={formData.reportType === opt.value}
                            onChange={() => setFormData({ ...formData, reportType: opt.value })}
                            className="ml-3"
                        />
                    ))}
                </div>

                <div className="col-sm-4 mt-2">
                    {loadingSearch ? (
                        <Loading />
                    ) : (
                        <div className="col-12 col-sm-6 col-md-2 my-1 d-flex gap-2">
                            <CustomButton text={"PDF"} icon={"pdf"} onClick={handlePDF} className="mr-2" />
                            <CustomButton text={"Excel"} icon={"excel"} onClick={handleExcel} />
                        </div>
                    )}
                </div>
                 {/* <div className="d-flex align-items-center mt-1">
                    <div style={{ width: "150px" }}>
                        <ReactSelect
                            className="required-fields"
                            id="ShowLedger"
                            placeholderName="Select Ledger"
                            name="ShowLedger"
                            // removeIsClearable={true}
                            dynamicOptions={ledgerOptions}
                            value={formData.ShowLedger?.value}
                            onChange={(name, value) =>{
                                console.log("name:", name, "value:", value); 
                                setFormData((prev) => ({ ...prev, [name]: value }))
                            }}
                        />
                    </div> 
                </div> */}


            </div>
        </Accordion>
    );
};

export default DoctorWiseListReport;