import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Input from "../../../components/formComponent/Input"
import { CustomButton, SaveButton } from "../../../components/UI/CustomButton"
import { toast } from "react-toastify"
import DatePicker from "../../../components/formComponent/DatePicker"
import ReactSelect from "../../../components/formComponent/ReactSelect"
import { axiosInstance } from "../../../utils/axiosInstance"
import UploadFile from "../../utils/UploadFileModal/UploadFile"
import { guidNumber } from "../../../utils/generateGuid"
import { getAccessCentresReports } from "../../../utils/NetworkApi/commonApi"

const Immunization = ({ editData, setEditData }) => {
    const [t] = useTranslation()
    const [centre, setCentre] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(false)
    const [showFileModal, setShowFileModal] = useState({
        modal: false,
        data: "",
        index: -1,
    });

    const [payload, setPayload] = useState({
        id: 0,
        centreId: "",
        employeeId: "",
        hepB_Dose1_Date: null,
        hepB_Dose2_Date: null,
        hepB_Dose3_Date: null,
        tetanus_Date: null,
        filePath: "",
        isActive: 1
    })

    useEffect(() => {
    if (editData) {
        setPayload({
            id: editData.Id,
            employeeId: editData.EmployeeId,
            centreId: editData.CentreId,
            hepB_Dose1_Date: editData.HepB_Dose1_Date ? new Date(editData.HepB_Dose1_Date) : null,
            hepB_Dose2_Date: editData.HepB_Dose2_Date ? new Date(editData.HepB_Dose2_Date) : null,
            hepB_Dose3_Date: editData.HepB_Dose3_Date ? new Date(editData.HepB_Dose3_Date) : null,
            tetanus_Date: editData.Tetanus_Date ? new Date(editData.Tetanus_Date) : null,
            isActive: editData.IsActive
        });
    }
}, [editData]);



    const getEmployees = async (centreId) => {
        try {
            const res = await axiosInstance.post("Employee/getEmployee", {
                employeeID: 0,
                centreID: centreId ? [Number(centreId)] : [],
                removeRateTypes: true,
                employeeName: ""
            });
            const data = res.data.message;
            const employeesDataValue = (data || []).map((ele) => ({
                value: ele.EmployeeID,
                label: ele.EmployeeName,
            }));
            setEmployees(employeesDataValue);
        } catch (error) {
            console.log("Error while fetching employees");
        }
    };

    useEffect(() => {
        axiosInstance.get("Centre/getAccessCentres").then((res) => {
            const data = res.data.message || [];
            const options = data.map((ele) => ({ value: ele.CentreID, label: ele.Centre }));
            setCentre(options);
            if (!editData) {
                const defaultCentre = data.find((ele) => ele.DefaultCentreIds);
                if (defaultCentre) {
                    setPayload((prev) => ({ ...prev, centreId: defaultCentre.CentreID }));
                }
            }
        }).catch(() => {});
    }, [])

    useEffect(() => {
        getEmployees(payload.centreId);
    }, [payload.centreId])

    const handleDateChange = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value?.value
        }))
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value)
        setPayload({ ...payload, [name]: value });
    };

    const handleToggle = (field) => {
        setPayload((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };

    const handleOpenUploadModal = () => {
        const currentGuid = payload.filePath ? payload.filePath : guidNumber();
        setPayload(prev => ({ ...prev, filePath: currentGuid }));
        setShowFileModal({
            modal: true,
            data: currentGuid,
            index: -1,
        });
    };

    const handleCaptureUploadedFile = (name, count, isUploaded) => {
        if (count > 0) {
            toast.success(`${count} file(s) linked successfully.`);
        }
    };

    const handleSave = async () => {
        const {
            centreId,
            employeeId,
            hepB_Dose1_Date,
            hepB_Dose2_Date,
            hepB_Dose3_Date,
            tetanus_Date,
            isActive,
            filePath
        } = payload;

        if (!centreId) {
            toast.error(t("Please select a Centre"));
            return;
        }
        if (!employeeId) {
            toast.error(t("Please select Employee"));
            return;
        }

        const hasAnyDate = hepB_Dose1_Date || hepB_Dose2_Date || hepB_Dose3_Date || tetanus_Date;
        if (!hasAnyDate) {
            toast.error(t("Please provide at least one vaccination date"));
            return;
        }
        setLoading(true);

        const finalPayload = {
            id: Number(payload?.id),
            centreId: centreId,
            employeeId: String(employeeId),
            hepB_Dose1_Date: hepB_Dose1_Date,
            hepB_Dose2_Date: hepB_Dose2_Date,
            hepB_Dose3_Date: hepB_Dose3_Date,
            tetanus_Date: tetanus_Date,
            filePath: filePath,
            isActive: isActive || 0,
        };

        // console.log("Final Payload:", finalPayload);

        try {
            const res = await axiosInstance.post("ESG/AddOrUpdateImmunization", finalPayload);
            if (res?.data?.success) {
                toast.success(t(`Immunization record ${editData ? "updated" : "saved"} successfully`));
                setEditData(null)

                setPayload({
                    id: 0,
                    centreId: "",
                    employeeId: "",
                    hepB_Dose1_Date: null,
                    hepB_Dose2_Date: null,
                    hepB_Dose3_Date: null,
                    tetanus_Date: null,
                    filePath: "",
                    isActive: 1
                })
            } else {
                toast.error(res?.data?.message || t(`Error while ${editData ? "updating" : "saving"} data`));
            }
        } catch (error) {
            console.error("Save Error:", error);
            toast.error(t("Something went wrong"));
        } finally {
            setLoading(false);
        }
    };
    console.log("payload", payload)

    return (
        <>
            <div className="row px-2 py-2">
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={centre}
                        name="centreId"
                        lable={t("Centre")}
                        id="centreId"
                        removeIsClearable={true}
                        placeholderName={t("Select Centre")}
                        value={payload.centreId}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={employees}
                        name="employeeId"
                        lable={t("Employee")}
                        id="employeeId"
                        removeIsClearable={true}
                        placeholderName={t("Select Employee")}
                        value={payload.employeeId}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="hepB_Dose1_Date"
                        id="hepB_Dose1_Date"
                        lable={t("Hepatitis 1st Dose")}
                        value={payload.hepB_Dose1_Date}
                        onChange={handleDateChange}
                        maxDate={new Date()}
                        className="custom-calendar"
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="hepB_Dose2_Date"
                        id="hepB_Dose2_Date"
                        lable={t("Hepatitis 2nd Dose")}
                        value={payload.hepB_Dose2_Date}
                        onChange={handleDateChange}
                        maxDate={new Date()}
                        className="custom-calendar"
                        // minDate={payload.hepB_Dose1_Date}
                        disabled={!payload.hepB_Dose1_Date}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="hepB_Dose3_Date"
                        id="hepB_Dose3_Date"
                        className="custom-calendar"
                        lable={t("Hepatitis 3rd Dose")}
                        value={payload.hepB_Dose3_Date}
                        onChange={handleDateChange}
                        maxDate={new Date()}
                        // minDate={payload.hepB_Dose2_Date}
                        disabled={!payload.hepB_Dose2_Date}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="tetanus_Date"
                        id="tetanus_Date"
                        lable={t("Tetanus Date")}
                        value={payload.tetanus_Date}
                        onChange={handleDateChange}
                        maxDate={new Date()}
                        className="custom-calendar"
                    />
                </div>

                <div className="col-auto mb-3 d-flex align-items-end">
                    <CustomButton
                        text={payload.filePath ? t("File Linked") : t("Upload file")}
                        onClick={handleOpenUploadModal}
                    />
                </div>
                <div className="col-auto mb-3 d-flex align-items-center" style={{ gap: "5px" }}>
                    <label className="switch mb-0">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={payload.isActive === 1}
                            onChange={() => handleToggle("isActive")}
                        />
                        <span className="slider"></span>
                    </label>
                    <strong>
                        <span>{t("IsActive")}</span>
                    </strong>
                </div>
                <div className="col-auto mb-3 d-flex align-items-end">
                    <CustomButton
                        text={editData ? "Update" : "Save"}
                        icon={editData ? "edit" : "save"}
                        onClick={handleSave}
                        disabled={loading}
                    />
                </div>
            </div>

            {showFileModal?.modal && (
                <UploadFile
                    show={showFileModal?.modal}
                    handleClose={() => {
                        setShowFileModal({ modal: false, data: "", index: -1 });
                    }}
                    // options={Identity}
                    documentId={showFileModal?.data}
                    pageName="Chemical"
                    handleUploadCount={handleCaptureUploadedFile}
                />
            )}
        </>
    )
}

export default Immunization