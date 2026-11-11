import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import { axiosInstance } from "../../utils/axiosInstance";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import CameraModal from "./CameraModal";
import { guidNumber } from "../util/Commonservices";
import { PlaceholderImage } from "../../assets/index.js";
import { FaTrash } from "react-icons/fa";
import { CustomButton, SaveButton, CancelButton } from "../../components/UI/CustomButton.jsx";
import { GetGlobalData } from "../../utils/NetworkApi/commonApi.js";
import DatePicker from "../../components/formComponent/DatePicker.jsx";
import moment from "moment";
import { number } from "../../utils/helpers.js";

const TITLE_GENDER_MAP = {
    "Mr.": "Male",
    "Master": "Male",
    "Dr.(Mr)": "Male",
    "Mrs.": "Female",
    "Miss.": "Female",
    "Ms.": "Female",
    "Dr.(Mrs)": "Female",
    "Dr.(Miss)": "Female",
    "Other": "Other",
    "Baby": "",
    "B/0": "",
    "Baba": "",
    "Dog": "",
    "Cat": "",
    "": "",
};

const GENDER_OPTIONS = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
];

const RELATION_TYPE_OPTIONS = [
    { value: "Dependent", label: "Dependent" },
    { value: "Relative", label: "Relative" },
];

const RELATION_MAPPING = {
    Dependent: [
        { value: "Father", label: "Father" },
        { value: "Mother", label: "Mother" },
        { value: "Brother", label: "Brother" },
        { value: "Sister", label: "Sister" },
        { value: "Husband", label: "Husband" },
        { value: "Wife", label: "Wife" },
        { value: "Son", label: "Son" },
        { value: "Daughter", label: "Daughter" },
        { value: "Spouse", label: "Spouse" },
    ],
    Relative: [
        { value: "Uncle", label: "Uncle" },
        { value: "Aunty", label: "Aunty" },
        { value: "Relative", label: "Relative" },
    ],
};

const AddFamilyMemberModal = ({ visible, onHide, employeeData }) => {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");

    const initialMemberData = {
        id: 0,
        employeeID: 0,
        title: "Mr.",
        gender: "Male",
        name: "",
        AgeYear: 0,
        AgeMonth: 0,
        AgeDays: 0,
        DOB: new Date(),
        address: "",
        relation: "",
        relationType: "Dependent",
        mobileNo: "",
        isActive: 1,
        imageGuid: "",
        imageUrl: PlaceholderImage,
        CentreID: 0,
    }

    const [member, setMember] = useState(initialMemberData);
    const [memberList, setMemberList] = useState([]);
    const [title, setTitle] = useState([]);
    const [cameraModal, setCameraModal] = useState({ show: false, guid: "" });
    const [saving, setSaving] = useState(false);
    const [excelRows, setExcelRows] = useState([]);
    const [excelSaving, setExcelSaving] = useState(false);
    const fileInputRef = useRef(null);

    const getGenderDropdown = (name) => {
        axiosInstance.post("Global/getGlobalData", { Type: name }).then((res) => {
            let data = res.data.message;
            let value = data.map((ele) => {
                return {
                    value: ele.FieldDisplay,
                    label: ele.FieldDisplay,
                };
            });
            setTitle(value);
        });
    };

    const getFamilyMember = async () => {
        try {
            const res = await axiosInstance.post("Employee/GetFamilyMembers", {
                employeeID: employeeData?.EmployeeID || 0,
            });
            const data = res.data.message;
            if (res.data?.message && Array.isArray(data)) {
                setMemberList(data);
            } else {
                toast.error(data || t("Error fetching family member"));
            }
        } catch (error) {
            console.log("Error while fetching family member", error);
        }
    };

    useEffect(() => {
        if (visible) {
            setMember({
                ...initialMemberData,
                employeeID: employeeData?.EmployeeID || 0
            });
            setMemberList([]);
            setExcelRows([]);
            getGenderDropdown("Title");
            getFamilyMember();
        }
    }, [visible, employeeData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "mobileNo") {
            const numeric = value.replace(/\D/g, "");
            if (numeric.length > 10) return;
            setMember((p) => ({ ...p, mobileNo: numeric }));
            return;
        }
        setMember((p) => ({ ...p, [name]: value }));
    };

    const handleSelectChange = (name, selected) => {
        if (name === "title") {
            const mappedGender = TITLE_GENDER_MAP[selected?.value] ?? "";
            setMember((p) => ({ ...p, title: selected?.value ?? "", gender: mappedGender }));
            return;
        }
        setMember((p) => ({ ...p, [name]: selected?.value ?? "" }));
    };

    const handleToggle = (field) => {
        setMember((prev) => ({
            ...prev,
            [field]: prev[field] == 1 ? 0 : 1,
        }));
    };

    const ageFromDOB = (dobValue) => {
        const now = moment();
        const d = moment(dobValue);
        const years = now.diff(d, "years");
        d.add(years, "years");
        const months = now.diff(d, "months");
        d.add(months, "months");
        const days = now.diff(d, "days");
        return { AgeYear: years, AgeMonth: months, AgeDays: days };
    };

    const dobFromAge = (y, m, d) =>
        moment()
            .subtract(parseInt(y) || 0, "years")
            .subtract(parseInt(m) || 0, "months")
            .subtract(parseInt(d) || 0, "days")
            .toDate();

    const handleAgeChange = (e) => {
        const { name, value } = e.target;
        const numVal = value === "" ? "" : parseInt(value, 10);
        if (name === "AgeMonth" && numVal !== "" && numVal > 11) return;
        if (name === "AgeDays" && numVal !== "" && numVal > 31) return;
        const updated = { ...member, [name]: numVal };
        setMember({ ...updated, DOB: dobFromAge(updated.AgeYear, updated.AgeMonth, updated.AgeDays) });
    };

    const dateSelect = (value, name) => {
        if (name === "DOB" && value) {
            setMember((prev) => ({ ...prev, DOB: value, ...ageFromDOB(value) }));
        } else {
            setMember((prev) => ({ ...prev, [name]: value }));
        }
    };

    const openCamera = () => {
        let g = member.imageGuid || guidNumber();
        setMember((p) => ({ ...p, imageGuid: g }));
        setCameraModal({ show: true, guid: g });
    };

    const handleCameraClose = (guidNo, newUrl) => {
        setCameraModal({ show: false, guid: "" });
        if (guidNo) {
            setMember((p) => ({
                ...p,
                imageGuid: guidNo,
                imageUrl: newUrl || p.imageUrl,
            }));
        }
    };

    const normalizeKey = (k) => k?.toString().trim().toLowerCase().replace(/\s+/g, "");

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!fileInputRef.current) return;
        fileInputRef.current.value = "";
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const wb = XLSX.read(ev.target.result, { type: "array", cellDates: true });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const raw = XLSX.utils.sheet_to_json(ws, { defval: "" });

                if (raw.length === 0) { toast.warning(t("Excel file is empty")); return; }

                const mapped = raw.map((row, idx) => {
                    const r = {};
                    Object.keys(row).forEach((k) => { r[normalizeKey(k)] = row[k]; });

                    const titleVal  = r["title"]        || "Mr.";
                    const nameVal   = (r["name"] || r["membername"] || "").toString().trim();
                    const relType   = r["relationtype"] || r["reltype"] || "Dependent";
                    const relation  = (r["relation"]    || "").toString().trim();
                    const mobile    = (r["mobile"] || r["mobileno"] || r["phone"] || "").toString().replace(/\D/g, "").slice(0, 10);
                    const address   = (r["address"]     || "").toString().trim();
                    const ageYear   = parseInt(r["ageyear"]  || r["age"] || 0, 10) || 0;
                    const ageMonth  = parseInt(r["agemonth"] || 0, 10) || 0;
                    const ageDays   = parseInt(r["agedays"]  || 0, 10) || 0;
                    const dobRaw    = r["dob"];
                    const dob       = dobRaw instanceof Date ? dobRaw : (dobRaw ? moment(dobRaw, ["DD-MM-YYYY", "YYYY-MM-DD", "DD/MM/YYYY"]).toDate() : null);
                    const gender    = r["gender"] || TITLE_GENDER_MAP[titleVal] || "Male";

                    const errors = [];
                    if (!nameVal)               errors.push("Name missing");
                    if (!relation)              errors.push("Relation missing");
                    if (mobile.length !== 10)   errors.push("Mobile invalid");

                    return {
                        _row: idx + 2,
                        _errors: errors,
                        id: 0,
                        employeeID: employeeData?.EmployeeID || 0,
                        title: titleVal,
                        gender,
                        name: nameVal,
                        address,
                        mobileNo: mobile,
                        relation,
                        relationType: relType,
                        isActive: 1,
                        imageGuid: "",
                        DOB: dob || dobFromAge(ageYear, ageMonth, ageDays),
                        AgeYear: ageYear,
                        AgeMonth: ageMonth,
                        AgeDays: ageDays,
                        CentreID: employeeData?.CentreID || 0,
                    };
                });

                setExcelRows(mapped);
                const errCount = mapped.filter((r) => r._errors.length > 0).length;
                if (errCount > 0)
                    toast.warning(`${mapped.length} rows loaded — ${errCount} row(s) have errors`);
                else
                    toast.success(`${mapped.length} rows loaded from Excel`);
            } catch {
                toast.error(t("Failed to parse Excel file"));
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleDownloadTemplate = async () => {
        const ExcelJS = (await import("exceljs")).default;
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("FamilyMembers");

        ws.columns = [
            { header: "Title",            key: "title",       width: 14 },
            { header: "Name",             key: "name",        width: 22 },
            { header: "Gender",           key: "gender",      width: 12 },
            { header: "Relation Type",    key: "relationType",width: 16 },
            { header: "Relation",         key: "relation",    width: 15 },
            { header: "Mobile",           key: "mobile",      width: 15 },
            { header: "Address",          key: "address",     width: 28 },
            { header: "Age Year",         key: "ageYear",     width: 10 },
            { header: "Age Month",        key: "ageMonth",    width: 11 },
            { header: "Age Days",         key: "ageDays",     width: 10 },
            { header: "DOB (DD-MM-YYYY)", key: "dob",         width: 20 },
        ];

        ws.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0070C0" } };
            cell.alignment = { vertical: "middle", horizontal: "center" };
        });
        ws.getRow(1).height = 22;

        const titleValues   = "Mr.,Mrs.,Miss.,Ms.,Master,Dr.(Mr),Dr.(Mrs),Dr.(Miss),Other,Baby,B/0,Baba";
        const genderValues  = "Male,Female,Other";
        const relTypeValues = "Dependent,Relative";

        for (let row = 2; row <= 500; row++) {
            ws.getCell(`A${row}`).dataValidation = {
                type: "list", allowBlank: true,
                formulae: [`"${titleValues}"`],
                showErrorMessage: true,
                errorTitle: "Invalid Title",
                error: "Please select a title from the dropdown",
            };
            ws.getCell(`C${row}`).dataValidation = {
                type: "list", allowBlank: true,
                formulae: [`"${genderValues}"`],
                showErrorMessage: true,
                errorTitle: "Invalid Gender",
                error: "Please select Male, Female or Other",
            };
            ws.getCell(`D${row}`).dataValidation = {
                type: "list", allowBlank: false,
                formulae: [`"${relTypeValues}"`],
                showErrorMessage: true,
                errorTitle: "Invalid Relation Type",
                error: "Please select Dependent or Relative",
            };
        }

        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "FamilyMemberTemplate.xlsx";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSaveExcelMembers = async () => {
        const validRows = excelRows.filter((r) => r._errors.length === 0);
        if (validRows.length === 0) { toast.warning(t("No valid rows to save")); return; }

        setExcelSaving(true);
        try {
            const payload = validRows.map(({ _row, _errors, ...rest }) => rest);
            const res = await axiosInstance.post("Employee/InsertFamilyMembers", payload);
            if (res.data?.success) {
                toast.success(res?.data?.message || `${validRows.length} ${t("members added successfully")}`);
                setExcelRows([]);
                getFamilyMember();
            } else {
                toast.error(res.data?.message);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || t("Error saving members"));
        } finally {
            setExcelSaving(false);
        }
    };

    const handleAddMember = async () => {
        if (!member.name?.trim()) {
            toast.error(t("Please enter member name"));
            return;
        }
        if (!member.relation) {
            toast.error(t("Please select relation"));
            return;
        }
        if (!member.mobileNo || member.mobileNo.length < 10) {
            toast.error(t("Please enter valid 10-digit mobile number"));
            return;
        }

        setSaving(true);
        try {
            if (member.id === 0) {
                // Insert New Members - Payload should be an array of objects
                const payload = [{
                    id: 0,
                    employeeID: employeeData?.EmployeeID || 0,
                    title: member.title,
                    gender: member.gender,
                    name: member.name,
                    address: member.address,
                    mobileNo: member.mobileNo,
                    relation: member.relation,
                    relationType: member.relationType,
                    isActive: 1,
                    imageGuid: member.imageGuid || "",
                    DOB: member.DOB,
                    AgeYear: Number(member.AgeYear),
                    AgeMonth: Number(member.AgeMonth),
                    AgeDays: Number(member.AgeDays),
                    CentreID: employeeData?.CentreID || 0,
                }];
                const res = await axiosInstance.post("Employee/InsertFamilyMembers", payload);
                if (res.data?.success) {
                    toast.success(res?.data?.message || t("Family member added successfully"));
                } else {
                    toast.error(res.data?.message)
                }
            } else {
                // Update Existing Member - Payload should be a single object
                const payload = {
                    ID: member.id,
                    employeeID: member.employeeID,
                    title: member.title,
                    gender: member.gender,
                    name: member.name,
                    address: member.address,
                    mobileNo: member.mobileNo,
                    relation: member.relation,
                    relationType: member.relationType,
                    isActive: member.isActive,
                    imageGuid: member.imageGuid || "",
                    DOB: member.DOB,
                    AgeYear: Number(member.AgeYear),
                    AgeMonth: Number(member.AgeMonth),
                    AgeDays: Number(member.AgeDays),
                    CentreID: employeeData?.CentreID || 0,
                };
                const res = await axiosInstance.post("Employee/UpdateEmployeeFamilyMember", payload);
                if (res.data?.success) {
                    toast.success(res?.data?.message || t("Family member updated successfully"));
                } else {
                    toast.error(res.data?.message)
                }
            }

            // Refresh list and reset form
            getFamilyMember();
            setMember({
                ...initialMemberData,
                employeeID: employeeData?.EmployeeID || 0
            });
        } catch (err) {
            toast.error(err?.response?.data?.message || t("Error processing request"));
            console.error("Save Error:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleEditMember = (m) => {
        const parsedDOB = m.DOB
            ? moment(m.DOB, ["DD-MMM-YY hh:mm A", "DD-MMM-YYYY hh:mm A", moment.ISO_8601]).toDate()
            : null;

        const { AgeYear, AgeMonth, AgeDays } = m.AgeYear != null
            ? { AgeYear: m.AgeYear, AgeMonth: m.AgeMonth, AgeDays: m.AgeDays }
            : parsedDOB ? ageFromDOB(parsedDOB) : { AgeYear: "", AgeMonth: "", AgeDays: "" };

        setMember({
            id: m.ID,
            employeeID: m.EmployeeID,
            title: m.Title,
            gender: m.Gender || TITLE_GENDER_MAP[m.Title] || "",
            name: m.Name,
            AgeYear,
            AgeMonth,
            AgeDays,
            address: m.Address,
            mobileNo: m.MobileNo,
            relation: m.Relation,
            isActive: m.IsActive,
            relationType: m.RelationType,
            imageGuid: m.ImageGuid || "",
            imageUrl: m.ImageUrl || PlaceholderImage,
            DOB: parsedDOB,
            CentreID: employeeData?.CentreID || 0,
        });
    };



    const handleRemoveMember = (id) => {
        setMemberList((p) => p.filter((m) => Number(m.ID) !== Number(id)));
    };

    const dialogHeader = (
        <div className="d-flex align-items-center gap-2" style={{ gap: "12px" }}>
            <span style={{ fontWeight: 600 }}>
                {t("Add Family Member")}
            </span>
            {employeeData?.EmployeeCode && (
                <span
                    className="badge"
                    style={{
                        background: "var(--primary, #007bff)",
                        color: "#fff",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        fontSize: "0.82rem",
                        marginLeft: "10px",
                    }}
                >
                    {employeeData.EmployeeCode}
                </span>
            )}
            {employeeData?.Name && (
                <span style={{ fontSize: "0.92rem", color: "inherit", marginLeft: "6px" }}>
                    — {employeeData.Title ? `${employeeData.Title} ` : ""}
                    {employeeData.Name}
                </span>
            )}
        </div>
    );

    return (
        <>
            <Dialog
                visible={visible}
                onHide={onHide}
                header={dialogHeader}
                className={theme}
                style={{ width: "80vw", maxWidth: "900px" }}
                draggable={false}
                resizable={false}
            >
                <Accordion title={t("Family Member Details")} defaultValue={true}>
                    <div className="d-flex justify-content-center align-items-start">
                        <div className="col-11 row pt-2 pl-2 pr-2">
                            <div className="col-sm-2">
                                <ReactSelect
                                    dynamicOptions={title}
                                    name="title"
                                    lable={t("Title")}
                                    id="family-title"
                                    removeIsClearable={true}
                                    placeholderName={t("Title")}
                                    value={member.title}
                                    onChange={handleSelectChange}
                                />
                            </div>
                            
                            <div className="col-sm-3">
                                <Input
                                    type="text"
                                    name="name"
                                    lable={t("Member Name")}
                                    placeholder=" "
                                    className="required-fields"
                                    maxLength={75}
                                    value={member.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-sm-3">
                                <div className="d-flex" style={{ gap: "4px" }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Input
                                            name="AgeYear"
                                            type="number"
                                            lable="Y"
                                            onInput={(e) => number(e, 3, 120)}
                                            onChange={handleAgeChange}
                                            value={member?.AgeYear}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Input
                                            name="AgeMonth"
                                            lable="M"
                                            type="number"
                                            onInput={(e) => number(e, 3, 12)}
                                            onChange={handleAgeChange}
                                            value={member?.AgeMonth}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Input
                                            name="AgeDays"
                                            lable="D"
                                            type="number"
                                            onInput={(e) => number(e, 3, 31)}
                                            onChange={handleAgeChange}
                                            value={member?.AgeDays}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-3 mb-2">
                                <DatePicker
                                    value={member?.DOB}
                                    className="custom-calendar"
                                    name="DOB"
                                    placeholder=" "
                                    id="DOB"
                                    lable="DOB"
                                    maxDate={new Date()}
                                    onChange={dateSelect}
                                />
                            </div>
                            <div className="col-sm-2">
                                <ReactSelect
                                    dynamicOptions={GENDER_OPTIONS}
                                    name="gender"
                                    lable={t("Gender")}
                                    id="family-gender"
                                    removeIsClearable={true}
                                    placeholderName={t("Gender")}
                                    value={member.gender}
                                    onChange={handleSelectChange}
                                    isDisabled={true}
                                />
                            </div>
                            <div className="col-sm-3">
                                <Input
                                    type="text"
                                    name="address"
                                    lable={t("Address")}
                                    placeholder=" "
                                    className="required-fields"
                                    maxLength={75}
                                    value={member.address}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-sm-3">
                                <ReactSelect
                                    dynamicOptions={RELATION_TYPE_OPTIONS}
                                    name="relationType"
                                    lable={t("Relation Type")}
                                    id="relation-type"
                                    removeIsClearable={true}
                                    placeholderName={t("Select Type")}
                                    value={member.relationType}
                                    onChange={handleSelectChange}
                                />
                            </div>
                            <div className="col-sm-3">
                                <ReactSelect
                                    dynamicOptions={RELATION_MAPPING[member.relationType] || []}
                                    name="relation"
                                    lable={member.relationType === "Dependent" ? t("Dependent") : t("Relative")}
                                    id="family-relation"
                                    removeIsClearable={true}
                                    placeholderName={member.relationType === "Dependent" ? t("Select Dependent") : t("Select Relative")}
                                    value={member.relation}
                                    onChange={handleSelectChange}
                                />
                            </div>
                            <div className="col-sm-3">
                                <Input
                                    type="number"
                                    name="mobileNo"
                                    lable={t("Mobile")}
                                    placeholder=" "
                                    className="required-fields"
                                    maxLength={10}
                                    value={member.mobileNo}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-auto mb-2 d-flex align-items-center justify-content-start" style={{
                                gap: "5px"
                            }}>
                                <label class="switch mb-0">
                                    <input
                                        type="checkbox"
                                        checked={member.isActive == "1"}
                                        onChange={() => handleToggle("isActive")}
                                    />
                                    <span class="slider"></span>
                                </label>
                                <strong>
                                    <span>{t("IsActive")}</span>
                                </strong>
                            </div>

                            <div className="col-sm-auto mb-2 d-flex align-items-end flex-wrap" style={{ gap: "8px" }}>
                                <CustomButton
                                    text={member.id === 0 ? t("Add Member") : t("Update Member")}
                                    icon={member.id === 0 ? "add" : "edit"}
                                    onClick={handleAddMember}
                                    loading={saving}
                                />
                                <CustomButton
                                    text={t("Import Excel")}
                                    icon="upload"
                                    onClick={() => fileInputRef.current?.click()}
                                />
                                <CustomButton
                                    text={t("Template")}
                                    icon="excel"
                                    onClick={handleDownloadTemplate}
                                    variant="success"
                                />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    style={{ display: "none" }}
                                    onChange={handleFileSelect}
                                />
                            </div>
                        </div>
                        <div className="col-1 d-flex justify-content-center align-items-center">
                            <div className="mb-2 d-flex flex-column align-items-start">
                                <label style={{ fontSize: "0.78rem", marginBottom: "4px", fontWeight: 500 }}>
                                    {t("Photo")}
                                </label>
                                <div
                                    style={{
                                        position: "relative",
                                        cursor: "pointer",
                                        border: "1px solid #ccc",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        width: "72px",
                                        height: "72px",
                                    }}
                                    onClick={openCamera}
                                    title={t("Click to upload / capture photo")}
                                >
                                    <img
                                        src={member.imageUrl || PlaceholderImage}
                                        alt="member"
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        onError={(e) => { e.target.src = PlaceholderImage; }}
                                    />
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 0, left: 0, right: 0,
                                            background: "rgba(0,0,0,0.45)",
                                            color: "#fff",
                                            fontSize: "0.62rem",
                                            textAlign: "center",
                                            padding: "2px 0",
                                        }}
                                    >
                                        {t("Upload")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Accordion>

                {excelRows.length > 0 && (
                    <Accordion title={`${t("Excel Preview")} (${excelRows.length} ${t("rows")})`} defaultValue={true}>
                        <div className="p-2">
                            <div className="d-flex align-items-center justify-content-end mb-2 flex-wrap" style={{ gap: "12px" }}>
                                {/* <span style={{ fontSize: 12, color: "#6c757d" }}>
                                    {excelRows.filter((r) => r._errors.length === 0).length} {t("valid")} ·{" "}
                                    {excelRows.filter((r) => r._errors.length > 0).length} {t("errors")}
                                </span> */}
                                <SaveButton
                                    text={`${t("Save")} ${excelRows.filter((r) => r._errors.length === 0).length} ${t("Members")}`}
                                    onClick={handleSaveExcelMembers}
                                    disabled={excelSaving || excelRows.filter((r) => r._errors.length === 0).length === 0}
                                    loading={excelSaving}
                                />
                                <CancelButton text={t("Clear")} onClick={() => setExcelRows([])} />
                            </div>
                            <Tables>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>{t("Name")}</th>
                                        <th>{t("Title")}</th>
                                        <th>{t("Gender")}</th>
                                        <th>{t("Relation Type")}</th>
                                        <th>{t("Relation")}</th>
                                        <th>{t("Mobile")}</th>
                                        <th>{t("Address")}</th>
                                        <th>{t("Age")}</th>
                                        <th>{t("Status")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {excelRows.map((row, idx) => (
                                        <tr key={idx} style={row._errors.length > 0 ? { background: "#fff5f5" } : {}}>
                                            <td>{idx + 1}</td>
                                            <td>{row.name || <span className="text-danger">—</span>}</td>
                                            <td>{row.title}</td>
                                            <td>{row.gender}</td>
                                            <td>{row.relationType}</td>
                                            <td>{row.relation || <span className="text-danger">—</span>}</td>
                                            <td>{row.mobileNo || <span className="text-danger">—</span>}</td>
                                            <td>{row.address}</td>
                                            <td style={{ fontSize: 12 }}>
                                                {row.AgeYear}Y {row.AgeMonth}M {row.AgeDays}D
                                            </td>
                                            <td>
                                                {row._errors.length === 0 ? (
                                                    <span className="badge bg-success">{t("Valid")}</span>
                                                ) : (
                                                    <span className="badge bg-danger" title={row._errors.join(", ")}>
                                                        {row._errors.join(", ")}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Tables>
                        </div>
                    </Accordion>
                )}

                {memberList.length > 0 && (
                    <Accordion title={t("Family Members")} defaultValue={true}>
                        <Tables>
                            <thead className="cf">
                                <tr>
                                    {[t("S.No"), t("Employee ID"), t("Name"), t("Age/Gender"), t("Relation Type"), t("Relation"), t("Address"), t("Mobile"), t("Photo"), t("CreatedByName"), t("CreatedAt"), t("Action")].map(
                                        (h, i) => <th key={i}>{h}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {memberList.map((m, idx) => (
                                    <tr key={m.id || idx}>
                                        <td data-title={t("S.No")}>{idx + 1}</td>
                                        <td data-title={t("Employee ID")}>{m?.FUHID}</td>
                                        <td data-title={t("Name")}>{m?.Name}</td>
                                        <td data-title={t("Age/Gender")}>{m?.Age} - {m?.Gender}</td>
                                        <td data-title={t("Relation Type")}>{m?.RelationType}</td>
                                        <td data-title={t("Relation")}>{m?.Relation}</td>
                                        <td data-title={t("Address")}>{m?.Address}</td>
                                        <td data-title={t("Mobile")}>{m?.MobileNo}</td>
                                        <td data-title={t("Photo")}>
                                            <img
                                                src={m?.imageUrl || PlaceholderImage}
                                                alt="member"
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    objectFit: "cover",
                                                    borderRadius: "6px",
                                                    border: "1px solid #ccc",
                                                }}
                                                onError={(e) => { e.target.src = PlaceholderImage; }}
                                            />
                                        </td>
                                        <td data-title={t("CreatedByName")}>{m?.CreatedByName}</td>
                                        <td data-title={t("CreatedAt")}>{m?.dtEntry}</td>
                                        <td data-title={t("Action")}>
                                            <div className="d-flex gap-2 align-items-center">
                                                {m?.Relation !== "Self" && (
                                                    <i
                                                        className="fa fa-edit text-primary"
                                                        style={{ cursor: "pointer", fontSize: "16px" }}
                                                        onClick={() => handleEditMember(m)}
                                                        title={t("Edit")}
                                                    />
                                                )}
                                                {/* {m?.Relation !== "Self" && (
                                                    <FaTrash
                                                        style={{ cursor: "pointer", color: "#dc3545", fontSize: "16px" }}
                                                        onClick={() => handleRemoveMember(m.ID)}
                                                        title={t("Remove")}
                                                    />
                                                )} */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Tables>
                    </Accordion>
                )}
            </Dialog>
            {cameraModal.show && (
                <CameraModal
                    visible={cameraModal.show}
                    guid={cameraModal.guid}
                    pageName={"FamilyMemberImage"}
                    defaultImage={member.imageUrl}
                    handleClose={handleCameraClose}
                />
            )}
        </>
    );
};

export default AddFamilyMemberModal;