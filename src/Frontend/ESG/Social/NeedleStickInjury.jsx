import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Input from "../../../components/formComponent/Input"
import { CustomButton, SaveButton, CancelButton } from "../../../components/UI/CustomButton"
import { toast } from "react-toastify"
import DatePicker from "../../../components/formComponent/DatePicker"
import ReactSelect from "../../../components/formComponent/ReactSelect"
import { axiosInstance } from "../../../utils/axiosInstance"
import UploadFile from "../../utils/UploadFileModal/UploadFile"
import { guidNumber } from "../../../utils/generateGuid"
import { getAccessCentresReports } from "../../../utils/NetworkApi/commonApi"
import TimePicker from "../../../components/formComponent/TimePicker"
import Accordion from "../../../components/UI/Accordion"
import moment from "moment"

const ROLE_OPTIONS        = ["HCW", "Cleaner", "Other"]
const DEVICE_OPTIONS      = ["Hollow-bore Needle", "Scalpel", "Lancet", "Other"]
const DESCRIPTION_OPTIONS = ["Superficial", "Deep Puncture", "Blood Exposure", "Mucous Membrane Contact"]

const emptyPayload = {
    centreId: "",
    injuryDate: new Date(),
    injuryTime: new Date(),
    injuredPerson: "",
    role: "",
    otherRole: "",
    sourcePatientName: "",
    sourcePatientStatus: "",
    deviceCausingInjury: "",
    otherDevice: "",
    injuryDescription: "",
    injuryFormFilePath: "",
    testRecordFilePath: "",
    isActive: 1,
}

const NeedleStickInjury = ({ editData, setEditData }) => {
    const [t] = useTranslation()
    const [centre, setCentre] = useState([])
    const [loading, setLoading] = useState(false)

    const [injuryFormModal,  setInjuryFormModal]  = useState({ modal: false, data: "" })
    const [testRecordModal,  setTestRecordModal]  = useState({ modal: false, data: "" })

    const [payload, setPayload] = useState(emptyPayload)

    useEffect(() => {
        getAccessCentresReports(setCentre)
    }, [])

    useEffect(() => {
        if (editData) {
            const parsed = editData?.InjuryDate
                ? moment(editData.InjuryDate, "DD-MMM-YYYY HH:mm")
                : moment()
            setPayload({
                id: editData?.ID,
                centreId: editData?.CentreID || "",
                injuryDate: parsed.isValid() ? parsed.toDate() : new Date(),
                injuryTime: parsed.isValid() ? parsed.format("HH:mm:ss") : moment().format("HH:mm:ss"),
                injuredPerson: editData?.PersonName || "",
                role: editData?.Role || "",
                otherRole: editData?.OtherRole || "",
                sourcePatientName: editData?.SourcePatientName || "",
                sourcePatientStatus: editData?.HIVStatus || "",
                deviceCausingInjury: editData?.Device || "",
                otherDevice: editData?.OtherDevice || "",
                injuryDescription: editData?.InjuryDescription || "",
                injuryFormFilePath: editData?.NeedleStickInjuryForm || "",
                testRecordFilePath: editData?.NeedleStickTestRecord || "",
                existingInjuryFormCount: Number(editData?.NeedleStickCount) || 0,
                existingTestRecordCount: Number(editData?.NeedleStickTestCount) || 0,
                isActive: 1,
            })
        }
    }, [editData]);

    console.log("payload", payload)

    // ── handlers ──────────────────────────────────────────────

    const handleDateChange = (value, name) => {
        setPayload((prev) => ({ ...prev, [name]: value }))
    }

    const handleTimeChange = (value, name) => {
        setPayload((prev) => ({ ...prev, [name]: value }))
    }

    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => ({ ...prev, [name]: value?.value ?? "" }))
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setPayload((prev) => ({ ...prev, [name]: value }))
    }

    // Radio buttons (role, sourcePatientStatus, deviceCausingInjury, injuryDescription)
    const handleRadioChange = (e) => {
        const { name, value } = e.target
        setPayload((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "role" && value !== "Other" ? { otherRole: "" } : {}),
            ...(name === "deviceCausingInjury" && value !== "Other" ? { otherDevice: "" } : {}),
        }))
    }

    // Upload helpers
    const openUpload = (field, setModal) => {
        const guid = payload[field] || guidNumber()
        setPayload((prev) => ({ ...prev, [field]: guid }))
        setModal({ modal: true, data: guid })
    }

    const handleUploadCount = (field, name, count) => {
        setPayload((prev) => ({ ...prev, [field]: Number(count) }))
    }

    // ── save ──────────────────────────────────────────────────

    const handleSave = async () => {
        if (!payload.centreId)       { toast.error(t("Please select a Centre"));       return }
        if (!payload.injuredPerson)  { toast.error(t("Please enter Injured Person"));  return }
        if (!payload.injuryDate)     { toast.error(t("Please select Injury Date"));    return }

        const timeStr = typeof payload.injuryTime === "string" ? payload.injuryTime : ""
        const now = moment()
        const [h, m, s] = timeStr
            ? timeStr.split(":")
            : [String(now.hours()), String(now.minutes()), String(now.seconds())]

        const injuryDateTime = moment(payload.injuryDate)
            .set({ hour: Number(h), minute: Number(m), second: Number(s || 0), millisecond: 0 })
            .format("YYYY-MM-DDTHH:mm:ss")

        const isEdit = !!payload.id
        const finalPayload = {
            logID: isEdit ? Number(payload.id) : 0,
            centreID: Number(payload.centreId),
            incidentReportNo: "",
            injuryDate: injuryDateTime,
            personName: payload.injuredPerson,
            role: payload.role,
            otherRole: payload.otherRole,
            sourcePatientName: payload.sourcePatientName,
            hivStatus: payload.sourcePatientStatus,
            device: payload.deviceCausingInjury,
            otherDevice: payload.otherDevice,
            injuryDescription: payload.injuryDescription,
            needleStickInjuryForm: payload.injuryFormFilePath,
            needleStickTestRecord: payload.testRecordFilePath,
        }

        const endpoint = isEdit ? "ESG/UpdateInjuryPerson" : "ESG/SaveInjuryPerson"

        setLoading(true)
        try {
            const res = await axiosInstance.post(endpoint, finalPayload)
            if (res?.data?.success) {
                toast.success(t(`Needle Stick Injury record ${editData ? "updated" : "saved"} successfully`))
                setEditData && setEditData(null)
                setPayload(emptyPayload)
            } else {
                toast.error(res?.data?.message || t("Error while saving data"))
            }
        } catch {
            toast.error(t("Something went wrong"))
        } finally {
            setLoading(false)
        }
    }

    const pillStyle = (isSelected) => ({
        display: "inline-flex",
        alignItems: "center",
        padding: "1px 9px",
        borderRadius: "20px",
        border: `1.5px solid ${isSelected ? "#17a589" : "#ced4da"}`,
        background: isSelected ? "#17a589" : "#fff",
        color: isSelected ? "#fff" : "#495057",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: isSelected ? "600" : "normal",
        userSelect: "none",
        transition: "all 0.15s",
    })

    // ── render ────────────────────────────────────────────────

    return (
        <>
            {/* ── Accordion 1: Facility ── */}
            {/* <Accordion name={t("Needle Stick Injury")} defaultValue={true} isBreadcrumb={true}> */}
                <div className="card-body p-1" >
                    <div className="row">
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <ReactSelect
                                dynamicOptions={centre}
                                name="centreId"
                                id="centreId"
                                removeIsClearable={true}
                                placeholderName={t("Select Facility")}
                                value={payload.centreId}
                                onChange={handleReactSelectChange}
                            />
                        </div>
                        {/* <div className="col-md-3 col-6"> */}
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <DatePicker
                                name="injuryDate"
                                id="injuryDate"
                                lable={t("Injury Date")}
                                value={payload.injuryDate}
                                onChange={handleDateChange}
                                maxDate={new Date()}
                                className="mr-2 custom-calendar"
                            />
                            </div>
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                        <TimePicker
                            name="injuryTime"
                            id="injuryTime"
                            lable={t("Injury Time")}
                            value={payload.injuryTime}
                            onChange={handleTimeChange}
                            // respclass="col-md-2 col-sm-2 col-lg-1 col-6"
                        />
                        </div>
                    </div>
                </div>
            {/* </Accordion> */}

            {/* ── Section A: Personal Information ── */}
            <div className="card card_background mb-2">
                <div className="card-header mb-1">
                    <h4 className="card-title w-100">
                        <div><label className="text-nowrap m-0">{t("Personal Information")}</label></div>
                    </h4>
                </div>
                <div className="card-body p-2">
                    <div className="row g-2 align-items-start">
                        <div className="col-md-2 col-6">
                            <Input type="text" name="injuredPerson" id="injuredPerson" lable={t("Injured Person")}
                                value={payload.injuredPerson} onChange={handleChange} />
                        </div>
                        <div className="col-md-3 col-12">
                            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px 10px" }}>
                                <span style={{ fontSize: "13px", color: "#1f2d3d", fontWeight: "600", whiteSpace: "nowrap", minWidth: "52px" }}>
                                    {t("Role")} :
                                </span>
                                {ROLE_OPTIONS.map((role) => (
                                    <label key={role} htmlFor={`role_${role}`} style={pillStyle(payload.role === role)}>
                                        <input type="radio" name="role" id={`role_${role}`} value={role}
                                            checked={payload.role === role} onChange={handleRadioChange}
                                            style={{ display: "none" }} />
                                        {t(role)}
                                    </label>
                                ))}
                            </div>
                            {payload.role === "Other" && (
                                <div className="mt-2">
                                    <Input type="text" name="otherRole" id="otherRole" lable={t("Other Role")}
                                        value={payload.otherRole} onChange={handleChange} />
                                </div>
                            )}
                        </div>
                        <div className="col-md-2 col-6">
                            <Input type="text" name="sourcePatientName" id="sourcePatientName" lable={t("Source Patient Name")}
                                value={payload.sourcePatientName} onChange={handleChange} />
                        </div>
                        <div className="col-md-5 col-12">
                            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px 10px" }}>
                                <span style={{ fontSize: "13px", color: "#1f2d3d", fontWeight: "600", whiteSpace: "nowrap" }}>
                                    {t("Source Patient HIV/HBV/HCV Status")} :
                                </span>
                                {["Known", "Unknown"].map((status) => (
                                    <label key={status} htmlFor={`status_${status}`} style={pillStyle(payload.sourcePatientStatus === status)}>
                                        <input type="radio" name="sourcePatientStatus" id={`status_${status}`} value={status}
                                            checked={payload.sourcePatientStatus === status} onChange={handleRadioChange}
                                            style={{ display: "none" }} />
                                        {t(status)}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section B: Injury Information ── */}
            <div className="card card_background mb-2">
                <div className="card-header mb-1">
                    <h4 className="card-title w-100">
                        <div><label className="text-nowrap m-0">{t("Injury Information")}</label></div>
                    </h4>
                </div>
                <div className="card-body p-2">
                    <div className="row g-3 align-items-start">
                        <div className="col-md-6 col-12">
                            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px 10px" }}>
                                <span style={{ fontSize: "13px", color: "#1f2d3d", fontWeight: "600", whiteSpace: "nowrap" }}>
                                    {t("Device Causing Injury")} :
                                </span>
                                {DEVICE_OPTIONS.map((device) => (
                                    <label key={device} htmlFor={`device_${device}`} style={pillStyle(payload.deviceCausingInjury === device)}>
                                        <input type="radio" name="deviceCausingInjury" id={`device_${device}`} value={device}
                                            checked={payload.deviceCausingInjury === device} onChange={handleRadioChange}
                                            style={{ display: "none" }} />
                                        {t(device)}
                                    </label>
                                ))}
                            </div>
                            {payload.deviceCausingInjury === "Other" && (
                                <div className="mt-2">
                                    <Input type="text" name="otherDevice" id="otherDevice" lable={t("Other Device")}
                                        value={payload.otherDevice} onChange={handleChange} />
                                </div>
                            )}
                        </div>
                        <div className="col-md-6 col-12">
                            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px 10px" }}>
                                <span style={{ fontSize: "13px", color: "#1f2d3d", fontWeight: "600", whiteSpace: "nowrap" }}>
                                    {t("Injury Description")} :
                                </span>
                                {DESCRIPTION_OPTIONS.map((desc) => (
                                    <label key={desc} htmlFor={`desc_${desc}`} style={pillStyle(payload.injuryDescription === desc)}>
                                        <input type="radio" name="injuryDescription" id={`desc_${desc}`} value={desc}
                                            checked={payload.injuryDescription === desc} onChange={handleRadioChange}
                                            style={{ display: "none" }} />
                                        {t(desc)}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Action Bar ── */}
            <div className="d-flex flex-wrap justify-content-end mb-2" style={{ gap: "8px" }}>
                <CustomButton
                    text={payload.injuryFormFilePath
                        ? `${t("Injury Form")} (${payload.existingInjuryFormCount || 1} ${t("file(s)")})`
                        : t("Upload Injury Form")}
                    icon="upload"
                    onClick={() => openUpload("injuryFormFilePath", setInjuryFormModal)}
                />
                <CustomButton
                    text={payload.testRecordFilePath
                        ? `${t("Test Record")} (${payload.existingTestRecordCount || 1} ${t("file(s)")})`
                        : t("Upload Test Record")}
                    icon="upload"
                    onClick={() => openUpload("testRecordFilePath", setTestRecordModal)}
                />
                <SaveButton
                    text={editData ? t("Update") : t("Save")}
                    onClick={handleSave}
                    disabled={loading}
                />
                <CancelButton
                    text={t("Reset")}
                    onClick={() => {
                        setPayload(emptyPayload)
                        setEditData && setEditData(null)
                    }}
                />
            </div>

            {/* Upload modals */}
            {injuryFormModal.modal && (
                <UploadFile
                    show={injuryFormModal.modal}
                    handleClose={() => setInjuryFormModal({ modal: false, data: "" })}
                    documentId={injuryFormModal.data}
                    pageName="NeedleStickInjuryForm"
                    handleUploadCount={(name, count) => handleUploadCount("existingInjuryFormCount", name, count)}
                />
            )}
            {testRecordModal.modal && (
                <UploadFile
                    show={testRecordModal.modal}
                    handleClose={() => setTestRecordModal({ modal: false, data: "" })}
                    documentId={testRecordModal.data}
                    pageName="NeedleStickTestRecord"
                    handleUploadCount={(name, count) => handleUploadCount("existingTestRecordCount", name, count)}
                />
            )}
        </>
    )
}

export default NeedleStickInjury
