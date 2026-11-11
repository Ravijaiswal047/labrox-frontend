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
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp"

const HealthSafetyTraining = ({ editData, setEditData }) => {
    const [t] = useTranslation()
    const [centre, setCentre] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(false)
    const [showFileModal, setShowFileModal] = useState({
        modal: false,
        data: "",
        index: -1,
    });

    const trainingModeOptions = [
        { label: "On Site", value: "OnSite"   },
        { label: "Virtual", value: "Virtual"  },
    ];

    const trainerOptions = [
        { label: "External", value: "External" },
        { label: "Internal", value: "Internal" },
    ];

    const [payload, setPayload] = useState({
        centreId: [],
        employeeId: [],
        trainingName: "",
        trainingMode: "",
        trainer: "",
        completionDate: new Date(),
        filePath: "",
        isActive: 1,
    })

    useEffect(() => {
    if (editData) {
        setPayload({
            id: editData?.uniqueId,
            centreId: editData?.centreIds || [],
            employeeId: editData?.employeeIds || [],
            trainingName: editData?.trainingName || "",
            trainingMode: editData?.trainingMode || "",
            trainer: editData?.trainerType || "",
            completionDate: editData?.completionDate ? new Date(editData.completionDate) : new Date(),
            filePath: editData?.filePath || "",
            isActive: editData?.IsActive ?? 1,
        });
    }
}, [editData]);

    const getEmployees = async (centreId) => {
        try {
            const res = await axiosInstance.post("Employee/getEmployee", {
                employeeID: 0,
                centreID: centreId || [],
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
                const defaults = data
                    .filter((ele) => ele.DefaultCentreIds)
                    .map((ele) => ele.CentreID);
                if (defaults.length > 0) {
                    setPayload((prev) => ({ ...prev, centreId: defaults }));
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

    const handleMultiSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
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
            trainingName,
            trainingMode,
            trainer,
            completionDate,
            isActive,
            filePath
        } = payload;

        if (!centreId || centreId.length === 0) {
            toast.error(t("Please select a Centre"));
            return;
        }
        if (!employeeId || employeeId.length === 0) {
            toast.error(t("Please select Employee"));
            return;
        }
        if (!trainingName) {
            toast.error(t("Please enter Training Name"));
            return;
        }
        if (!trainingMode) {
            toast.error(t("Please select Training Mode"));
            return;
        }
        if (!trainer) {
            toast.error(t("Please select Trainer"));
            return;
        }
        setLoading(true);

        const finalPayload = {
            uniqueId: payload?.id,
            centreId: centreId,
            employeeId: employeeId,
            trainingName: trainingName,
            TrainingMode: trainingMode,
            TrainerType: trainer,
            completionDate: completionDate,
            filePath: filePath,
            isActive: isActive
        };

        try {
            const res = await axiosInstance.post("ESG/AddOrUpdateTraining", finalPayload);
            if (res?.data?.success) {
                toast.success(t(`Training record ${editData ? "update" : "save"} successfully`));

                setPayload({
                    centreId: [],
                    employeeId: [],
                    trainingName: "",
                    trainingMode: "",
                    trainer: "",
                    completionDate: new Date(),
                    filePath: "",
                    isActive: 1,
                })
            } else {
                toast.error(res?.data?.message || t("Error while saving data"));
            }
        } catch (error) {
            console.error("Save Error:", error);
            toast.error(t("Something went wrong"));
        } finally {
            setLoading(false);
        }
    };

    console.log("Payload:", payload);

    return (
        <>
            <div className="row px-2 py-2">
                {/* <div className="col-sm-2">
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
                </div> */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        label="Centre"
                        options={centre}
                        value={payload?.centreId}
                        name="centreId"
                        id="centreId"
                        onChange={handleMultiSelectChange}
                        lable={t("Select Centre")}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        label="Employee"
                        options={employees}
                        value={payload.employeeId}
                        name="employeeId"
                        id="employeeId"
                        onChange={handleMultiSelectChange}
                        lable={t("Select Employee")}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="trainingName"
                        id="trainingName"
                        lable={"Training Name"}
                        value={payload?.trainingName}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={trainingModeOptions}
                        name="trainingMode"
                        id="trainingMode"
                        removeIsClearable={true}
                        placeholderName={t("Training Mode")}
                        value={payload.trainingMode}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={trainerOptions}
                        name="trainer"
                        id="trainer"
                        removeIsClearable={true}
                        placeholderName={t("Trainer")}
                        value={payload.trainer}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="completionDate"
                        id="completionDate"
                        lable={t("Completion Date")}
                        value={payload?.completionDate}
                        onChange={handleDateChange}
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

export default HealthSafetyTraining;