import React, { useState, useEffect } from 'react'
import * as XLSX from "xlsx";
import Accordion from '../../components/UI/Accordion'
import MultiSelectComp from '../../components/formComponent/MultiSelectComp'
import { axiosInstance, axiosReport } from '../../utils/axiosInstance'
import { BindEmployeeReports, GetGlobalData } from '../../utils/NetworkApi/commonApi'
import { formatStandardDate } from '../../utils/helpers'
import DatePicker from '../../components/formComponent/DatePicker'
import { useTranslation } from 'react-i18next'
import ReactSelect from '../../components/formComponent/ReactSelect'
import CustomTimePicker from "../../components/formComponent/TimePicker";
import { CustomButton } from '../../components/UI/CustomButton'
import Tooltip from '../../components/formComponent/Tooltip'
import RadioInput from '../../components/formComponent/RadioInput'
import { toast } from 'react-toastify';

const CollectionReportUserwise = () => {
    const [t] = useTranslation();
    const [centre, setCentre] = useState([])
    const [EmployeeName, setEmployeeName] = useState([])
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        CentreId: [],
        User: [],
        PaymentMode: [],
        FromDate: new Date(),
        FromTime: "00:00:00",
        ToTime: "23:59:59",
        ToDate: new Date(),
        ReportType: "1",
        FormatType: "PDF",
        IsActiveCentre: 2,
        IsActiveUser: 2,
    })

    const [showCentreDropdown, setShowCentreDropdown] = useState(false)
    const [showUserDropdown, setShowUserDropdown] = useState(false)
    const [paymentMode, setPaymentMode] = useState([])

    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get(`Centre/GetAllAccessCentres?IsActive=${formData.IsActiveCentre}`);
            const data = res.data.message;
            if(res.data?.success && Array.isArray(data)){
                const CentreDataValue = data.map((ele) => {
                    return {
                        value: ele.CentreID,
                        label: ele.Centre,
                    };
                });
                setCentre(CentreDataValue);
                setFormData((prev) => ({
                    ...prev,
                    CentreId: []
                }))
            }else{
                toast.error(res.data?.message || "Failed to fetch centres");
                setCentre([]);
            }
        } catch (error) {
            console.log("Error while fetching centres");
        }
    };
    const getEmployees = async () => {
        try {
            const res = await axiosInstance.get(`Camp/GetAllEmployees?IsActive=${formData.IsActiveUser}`);
            const data = res.data.message;
            if(res.data?.success && Array.isArray(data)){
                const EmployeeDataValue = data.map((ele) => {
                    return {
                        value: ele.EmployeeID,
                        label: ele.NAME,
                    };
                });
                setEmployeeName(EmployeeDataValue);
                setFormData((prev) => ({
                    ...prev,
                    User: []
                }))
            }else{
                toast.error(res.data?.message || "Failed to fetch employees");
                setEmployeeName([]);
            }
        } catch (error) {
            console.log("Error while fetching employees");
        }
    };

    useEffect(() => {
        getAccessCentres()
    }, [formData.IsActiveCentre])
    useEffect(() => {
        GetGlobalData(setPaymentMode, "PaymentMode")
    }, [])

    useEffect(() => {
        getEmployees()
    }, [formData.IsActiveUser])

    const handleMultiSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }
    const handleReactSelectChange = (name, e) => {
        setFormData((prev) => ({ ...prev, [name]: e?.value }));
    };
    const dateSelect = (date, name) => {
        setFormData({
            ...formData,
            [name]: date,
        });
    };
    const handleTime = (time, name) => {
        setFormData({ ...formData, [name]: time });
    };
    const handleToggle = (field) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };

    const handleRadioChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
        setShowCentreDropdown(false)
        setShowUserDropdown(false)
    }

    const getReport = async () => {
        //date format change and payload preparation
    const finalPayload = {
        CentreIds: formData.CentreId,
        UserIds: formData.User,
        FromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
        ToDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
        Type: formData.ReportType,
        FormatType: formData.FormatType,
        PaymentMode: formData.PaymentMode,
    }
    try {
        setLoading(true)
        const isExcel = formData.FormatType === "Excel"
        const res = await axiosReport.post(
            "ReportsUserWise/GenerateCollectionReportUserWise",
            finalPayload,
            { responseType: isExcel ? "json" : "blob" }
        )

        if (isExcel) {
            // Excel: response is already JSON
            if (!res?.data?.success) {
                console.log(res?.data?.message || "No data found")
                return
            }

            const data = res.data
            const workbook = XLSX.utils.book_new()
            let ws

            if (formData.ReportType === "1") {
                if (data.summaryModel && data.summaryModel.length > 0) {
                    ws = XLSX.utils.json_to_sheet(data.summaryModel)
                    XLSX.utils.book_append_sheet(workbook, ws, "Summary Report")
                } else {
                    console.log("No Summary data available")
                }
            } else if (formData.ReportType === "2") {
                if (data.summaryModel && data.summaryModel.length > 0) {
                    ws = XLSX.utils.json_to_sheet(data.summaryModel)
                }

                if (data.patientWiseModel && data.patientWiseModel.length > 0) {
                    if (!ws) {
                        ws = XLSX.utils.json_to_sheet(data.patientWiseModel)
                    } else {
                        XLSX.utils.sheet_add_aoa(ws, [[""], ["Patient Wise Details"]], { origin: -1 })
                        XLSX.utils.sheet_add_json(ws, data.patientWiseModel, { origin: -1 })
                    }
                }

                if (ws) {
                    XLSX.utils.book_append_sheet(workbook, ws, "Detail Report")
                } else {
                    console.log("No data available for Detail report")
                }
            }

            if (workbook.SheetNames.length > 0) {
                XLSX.writeFile(workbook, `CollectionReport_${new Date().getTime()}.xlsx`)
            } else {
                console.log("No data available for Excel export")
            }

        } else {
            // PDF: response is a blob, but might actually be a JSON error
            // Parse the blob to check if it's a JSON error response
            const blob = res.data
            const text = await blob.text()

            let parsedJson = null
            try {
                parsedJson = JSON.parse(text)
            } catch {
            }

            if (parsedJson !== null) {
                toast.error(parsedJson?.message || "No data found")
                return
            }

            // It's a valid PDF blob — open in new tab
            const url = window.URL.createObjectURL(
                new Blob([blob], { type: "application/pdf" })
            )
            window.open(url, "_blank")
        }

    } catch (error) {
        console.log("Error while fetching report")
    } finally {
        setLoading(false)
    }
}

    return (
        <>
            <Accordion
                name={t("CollectionReportUserwise")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row px-2 mt-2 p-1">
                    <div className="col-sm-2">
                        <div className="d-flex" style={{ gap: "5px" }}>
                            <div style={{ width: "86%" }}>
                                <MultiSelectComp
                                    label="All Centre"
                                    options={centre}
                                    value={formData?.CentreId}
                                    name="CentreId"
                                    id="CentreId"
                                    onChange={handleMultiSelectChange}
                                    lable={t("Select Centre")}
                                />
                            </div>
                            <div style={{ width: "10%", position: "relative" }}>
                                <Tooltip label={t("Status")} position="top">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-primary"
                                        onClick={() => {
                                            setShowCentreDropdown(!showCentreDropdown)
                                            setShowUserDropdown(false)
                                        }}
                                    >
                                        <i className="fa fa-plus-circle fa-sm"></i>
                                    </button>
                                </Tooltip>
                                {showCentreDropdown && (
                                    <div
                                        className="dropdown-menu show p-2"
                                        style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: "0",
                                            zIndex: 1000,
                                            minWidth: "120px",
                                            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                                            borderRadius: "5px"
                                        }}
                                    >
                                        <RadioInput
                                            label={t("Both")}
                                            name="IsActiveCentre"
                                            id="IsActiveCentreBoth"
                                            checked={formData.IsActiveCentre === 2}
                                            onChange={() => handleRadioChange("IsActiveCentre", 2)}
                                        />
                                        <RadioInput
                                            label={t("Active")}
                                            name="IsActiveCentre"
                                            id="IsActiveCentreActive"
                                            checked={formData.IsActiveCentre === 1}
                                            onChange={() => handleRadioChange("IsActiveCentre", 1)}
                                        />
                                        <RadioInput
                                            label={t("Inactive")}
                                            name="IsActiveCentre"
                                            id="IsActiveCentreInactive"
                                            checked={formData.IsActiveCentre === 0}
                                            onChange={() => handleRadioChange("IsActiveCentre", 0)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-2 ">
                        <div className="d-flex" style={{ gap: "5px" }}>
                            <div style={{ width: "86%" }}>
                                <MultiSelectComp
                                    label="All Employee"
                                    options={EmployeeName}
                                    value={formData?.User}
                                    name="User"
                                    id="User"
                                    onChange={handleMultiSelectChange}
                                    lable={t("Select Employee")}
                                />
                            </div>
                            <div style={{ width: "10%", position: "relative" }}>
                                <Tooltip label={t("Status")} position="top">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-primary"
                                        onClick={() => {
                                            setShowUserDropdown(!showUserDropdown)
                                            setShowCentreDropdown(false)
                                        }}
                                    >
                                        <i className="fa fa-plus-circle fa-sm"></i>
                                    </button>
                                </Tooltip>
                                {showUserDropdown && (
                                    <div
                                        className="dropdown-menu show p-2"
                                        style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: "0",
                                            zIndex: 1000,
                                            minWidth: "120px",
                                            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                                            borderRadius: "5px"
                                        }}
                                    >
                                        <RadioInput
                                            label={t("Both")}
                                            name="IsActiveUser"
                                            id="IsActiveUserBoth"
                                            checked={formData.IsActiveUser === 2}
                                            onChange={() => handleRadioChange("IsActiveUser", 2)}
                                        />
                                        <RadioInput
                                            label={t("Active")}
                                            name="IsActiveUser"
                                            id="IsActiveUserActive"
                                            checked={formData.IsActiveUser === 1}
                                            onChange={() => handleRadioChange("IsActiveUser", 1)}
                                        />
                                        <RadioInput
                                            label={t("Inactive")}
                                            name="IsActiveUser"
                                            id="IsActiveUserInactive"
                                            checked={formData.IsActiveUser === 0}
                                            onChange={() => handleRadioChange("IsActiveUser", 0)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-2">
                        <DatePicker
                            className="custom-calendar"
                            name="FromDate"
                            value={formData?.FromDate}
                            onChange={dateSelect}
                            onChangeTime={handleTime}
                            maxDate={new Date()}
                            lable={t("FromDate")}
                        />
                    </div>
                    <div className="col-sm-1 mt-1">
                        <CustomTimePicker
                            value={formData?.FromTime}
                            onChange={handleTime}
                            id="FromTime"
                            lable="FromTime"
                            name="FromTime"
                            placeholder="FromTime"
                        />
                    </div>
                    <div className="col-sm-2 ">
                        <DatePicker
                            className="custom-calendar"
                            name="ToDate"
                            value={formData?.ToDate}
                            onChange={dateSelect}
                            onChangeTime={handleTime}
                            maxDate={new Date()}
                            minDate={formData.FromDate}
                            lable={t("ToDate")}
                        />
                    </div>
                    <div className="col-sm-1 mt-1">
                        <CustomTimePicker
                            value={formData?.ToTime}
                            onChange={handleTime}
                            id="ToTime"
                            lable="ToTime"
                            name="ToTime"
                            placeholder="ToTime"
                        />
                    </div>
                    <div className="col-sm-2">
                        {/* <ReactSelect
                            className="required-fields"
                            dynamicOptions={paymentMode}
                            value={formData?.PaymentMode}
                            name="PaymentMode"
                            onChange={handleReactSelectChange}
                            label={t("Payment Mode")}
                            removeIsClearable={true}
                            placeholderName={t("Payment Mode")}
                        /> */}
                                <MultiSelectComp
                                    label="All PaymentMode"
                                    options={paymentMode}
                                    value={formData?.PaymentMode}
                                    name="PaymentMode"
                                    id="PaymentMode"
                                    onChange={handleMultiSelectChange}
                                    lable={t("All PaymentMode")}
                                />
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            className="required-fields"
                            dynamicOptions={[
                                { label: "Summary", value: "1" },
                                { label: "Detail", value: "2" },
                            ]}
                            value={formData?.ReportType}
                            name="ReportType"
                            onChange={handleReactSelectChange}
                            label={t("Report Type")}
                            removeIsClearable={true}
                            placeholderName={t("Report Type")}
                        />
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            className="required-fields"
                            dynamicOptions={[
                                { label: "PDF", value: "PDF" },
                                { label: "Excel", value: "Excel" },
                            ]}
                            value={formData?.FormatType}
                            name="FormatType"
                            onChange={handleReactSelectChange}
                            label={t("Format Type")}
                            removeIsClearable={true}
                            placeholderName={t("Format Type")}
                        />
                    </div>
                    {/* <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                        gap: "5px"
                    }}>
                        <label class="switch mb-0">
                            <input
                                type="checkbox"
                                checked={formData.IsActive === 1}
                                onChange={() => handleToggle("IsActive")}
                            />
                            <span class="slider"></span>
                        </label>
                        <strong>
                            <span>{t("IsActive")}</span>
                        </strong>
                    </div> */}
                    <div className="col-sm-2 ">
                        <CustomButton
                            text={"Get Report"}
                            icon={"excel"}
                            disabled={loading}
                            onClick={getReport}
                        />
                    </div>
                </div>
            </Accordion>
        </>
    )
}

export default CollectionReportUserwise