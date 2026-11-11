import React, { useState, useEffect } from 'react'
import * as XLSX from "xlsx";
import Accordion from '../../components/UI/Accordion'
import MultiSelectComp from '../../components/formComponent/MultiSelectComp'
import { axiosInstance, axiosReport } from '../../utils/axiosInstance'
import { GetGlobalData } from '../../utils/NetworkApi/commonApi'
import { formatStandardDate } from '../../utils/helpers'
import DatePicker from '../../components/formComponent/DatePicker'
import { useTranslation } from 'react-i18next'
import ReactSelect from '../../components/formComponent/ReactSelect'
import CustomTimePicker from "../../components/formComponent/TimePicker";
import { CustomButton } from '../../components/UI/CustomButton'
import Tooltip from '../../components/formComponent/Tooltip'
import RadioInput from '../../components/formComponent/RadioInput'
import { toast } from 'react-toastify';
import { getReportDownloadName, downloadReportBlob, saveAndPreviewPdf } from "./reportDownload";

const CollectionWiseReportUserNew = () => {
    const [t] = useTranslation();
    const [centre, setCentre] = useState([])
    const [EmployeeName, setEmployeeName] = useState([])
    const [loadingPdf, setLoadingPdf] = useState(false)
    const [loadingExcel, setLoadingExcel] = useState(false)
    const [formData, setFormData] = useState({
        CentreId: [],
        User: [],
        PaymentMode: [],
        FromDate: new Date(),
        FromTime: "00:00:00",
        ToTime: "23:59:59",
        ToDate: new Date(),
        ReportType: "1",
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
            if (res.data?.success && Array.isArray(data)) {
                const CentreDataValue = data.map((ele) => ({
                    value: ele.CentreID,
                    label: ele.Centre,
                }));
                setCentre(CentreDataValue);
                setFormData((prev) => ({ ...prev, CentreId: [] }))
            } else {
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
            if (res.data?.success && Array.isArray(data)) {
                const EmployeeDataValue = data.map((ele) => ({
                    value: ele.EmployeeID,
                    label: ele.NAME,
                }));
                setEmployeeName(EmployeeDataValue);
                setFormData((prev) => ({ ...prev, User: [] }))
            } else {
                toast.error(res.data?.message || "Failed to fetch employees");
                setEmployeeName([]);
            }
        } catch (error) {
            console.log("Error while fetching employees");
        }
    };

    useEffect(() => { getAccessCentres() }, [formData.IsActiveCentre])
    useEffect(() => { GetGlobalData(setPaymentMode, "PaymentMode") }, [])
    useEffect(() => { getEmployees() }, [formData.IsActiveUser])

    const handleMultiSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }
    const handleReactSelectChange = (name, e) => {
        setFormData((prev) => ({ ...prev, [name]: e?.value }));
    };
    const dateSelect = (date, name) => {
        setFormData({ ...formData, [name]: date });
    };
    const handleTime = (time, name) => {
        setFormData({ ...formData, [name]: time });
    };
    const handleRadioChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
        setShowCentreDropdown(false)
        setShowUserDropdown(false)
    }

    const validate = () => {
        if (!formData.CentreId || formData.CentreId.length === 0) {
            toast.warning("Please select the centre");
            return false;
        }
        return true;
    };

    const buildPayload = (formatType) => ({
        CentreIds: formData.CentreId,
        UserIds: formData.User,
        FromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
        ToDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
        FromTime: formData.FromTime,
        ToTime: formData.ToTime,
        Type: formData.ReportType,
        FormatType: formatType,
        PaymentMode: formData.PaymentMode,
    });

    const viewPdf = async () => {
        if (!validate()) return;
        setLoadingPdf(true);
        try {
            const res = await axiosReport.post(
                "ReportsUserWise/GenerateCollectionReportUserWise",
                buildPayload("PDF"),
                { responseType: "blob" }
            );

            const blob = res.data;
            const contentType = res.headers?.["content-type"] || "";
            if (contentType.includes("application/json")) {
                const text = await blob.text();
                const parsedJson = JSON.parse(text);
                toast.error(parsedJson?.message || "No data found");
                return;
            }

            const fileName = getReportDownloadName(res, `CollectionReportUserWise_${new Date().getTime()}.pdf`);
            saveAndPreviewPdf(blob, fileName);
            toast.success("PDF opened successfully");
        } catch (error) {
            if (error?.response?.data instanceof Blob) {
                const text = await error.response.data.text();
                try {
                    const json = JSON.parse(text);
                    toast.error(json?.message || "Something went wrong");
                } catch {
                    toast.error("Something went wrong");
                }
            } else {
                toast.error(error?.response?.data?.message || "Something went wrong");
            }
        } finally {
            setLoadingPdf(false);
        }
    };

    const downloadExcel = async () => {
        if (!validate()) return;
        setLoadingExcel(true);
        try {
            const res = await axiosReport.post(
                "ReportsUserWise/GenerateCollectionReportUserWise",
                buildPayload("Excel"),
                { responseType: "blob" }
            );

            const blob = res.data;
            const contentType = res.headers?.["content-type"] || "";
            if (contentType.includes("application/json")) {
                const text = await blob.text();
                const parsedJson = JSON.parse(text);
                toast.error(parsedJson?.message || "No data found");
                return;
            }

            const fileName = getReportDownloadName(res, `CollectionReportUserWise_${new Date().getTime()}.xlsx`);
            downloadReportBlob(blob, fileName);
            toast.success("Excel downloaded successfully");

        } catch (error) {
            if (error?.response?.data instanceof Blob) {
                const text = await error.response.data.text();
                try {
                    const json = JSON.parse(text);
                    toast.error(json?.message || "Something went wrong");
                } catch {
                    toast.error("Something went wrong");
                }
            } else {
                toast.error(error?.response?.data?.message || "Something went wrong");
            }
        } finally {
            setLoadingExcel(false);
        }
    };

    return (
        <>
            <Accordion title={t("Collection Report User wise")} defaultValue={true}>
                <div className="row px-2 mt-2 p-1">

                    <div className="col-12 col-sm-6 col-md-2 my-1">
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
                                    <div className="dropdown-menu show p-2" style={{
                                        position: "absolute", top: "100%", left: "0",
                                        zIndex: 1000, minWidth: "120px",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)", borderRadius: "5px"
                                    }}>
                                        <RadioInput label={t("Both")} name="IsActiveCentre" id="IsActiveCentreBoth"
                                            checked={formData.IsActiveCentre === 2}
                                            onChange={() => handleRadioChange("IsActiveCentre", 2)} />
                                        <RadioInput label={t("Active")} name="IsActiveCentre" id="IsActiveCentreActive"
                                            checked={formData.IsActiveCentre === 1}
                                            onChange={() => handleRadioChange("IsActiveCentre", 1)} />
                                        <RadioInput label={t("Inactive")} name="IsActiveCentre" id="IsActiveCentreInactive"
                                            checked={formData.IsActiveCentre === 0}
                                            onChange={() => handleRadioChange("IsActiveCentre", 0)} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-sm-2">
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
                                    <div className="dropdown-menu show p-2" style={{
                                        position: "absolute", top: "100%", left: "0",
                                        zIndex: 1000, minWidth: "120px",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)", borderRadius: "5px"
                                    }}>
                                        <RadioInput label={t("Both")} name="IsActiveUser" id="IsActiveUserBoth"
                                            checked={formData.IsActiveUser === 2}
                                            onChange={() => handleRadioChange("IsActiveUser", 2)} />
                                        <RadioInput label={t("Active")} name="IsActiveUser" id="IsActiveUserActive"
                                            checked={formData.IsActiveUser === 1}
                                            onChange={() => handleRadioChange("IsActiveUser", 1)} />
                                        <RadioInput label={t("Inactive")} name="IsActiveUser" id="IsActiveUserInactive"
                                            checked={formData.IsActiveUser === 0}
                                            onChange={() => handleRadioChange("IsActiveUser", 0)} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            name="FromDate"
                            value={formData?.FromDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            lable={t("FromDate")}
                                className="custom-calendar"
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <CustomTimePicker
                            value={formData?.FromTime}
                            onChange={handleTime}
                            id="FromTime"
                            lable="FromTime"
                            name="FromTime"
                            placeholder="FromTime"
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            name="ToDate"
                            value={formData?.ToDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            minDate={formData.FromDate}
                            lable={t("ToDate")}
                             className="custom-calendar"
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <CustomTimePicker
                            value={formData?.ToTime}
                            onChange={handleTime}
                            id="ToTime"
                            lable="ToTime"
                            name="ToTime"
                            placeholder="ToTime"
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
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

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <ReactSelect
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

                    <div className="col-12 col-sm-6 col-md-2 my-1 d-flex gap-2">
                        <CustomButton
                            text={t("Pdf")}
                            onClick={viewPdf}
                            loading={loadingPdf}
                            icon={"pdf"}
                            className="mr-2"
                        />
                        <CustomButton
                            text={t("Excel")}
                            onClick={downloadExcel}
                            loading={loadingExcel}
                            icon={"excel"}
                        />
                    </div>

                </div>
            </Accordion>
        </>
    )
}

export default CollectionWiseReportUserNew