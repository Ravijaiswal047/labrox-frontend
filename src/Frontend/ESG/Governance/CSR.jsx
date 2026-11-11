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

const CSR = ({ editData, setEditData }) => {
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
        centreId: "",
        activityName: "",
        descriptionOutcome: "",
        noOfPeopleBenefited: "",
        eventDate: new Date(),
        filePath: "",
        isActive: 1
    })

    useEffect(() => {
        if (editData) {
            setPayload({
                id: editData?.Id,
                centreId: editData?.CentreId || "",
                activityName: editData?.ActivityName || "",
                descriptionOutcome: editData?.DescriptionOutcome || "",
                eventDate: editData?.eventDate ? new Date(editData.eventDate) : new Date(),
                filePath: editData?.FilePath || "",
                isActive: editData?.IsActive ?? 1,
                noOfPeopleBenefited: editData?.CSRBenefit ?? "",
            });
        }
    }, [editData]);

    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get("Centre/getAccessCentres");
            const data = res.data.message;
            const CentreDataValue = data.map((ele) => {
                return {
                    value: ele.CentreID,
                    label: ele.Centre,
                };
            });
            setCentre(CentreDataValue);
        } catch (error) {
            console.log("Error while fetching centres");
        }
    };

    useEffect(() => {
        getAccessCentres();
    }, [])

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
        setPayload({ ...payload, [name]: value });
    };

    const handleToggle = (field) => {
        setPayload((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };

    const handleOpenUploadModal = () => {
        const currentGuid = payload.filePath || guidNumber();
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
            activityName,
            descriptionOutcome,
            eventDate,
            isActive,
            filePath
        } = payload;

        if (!centreId) {
            toast.error(t("Please select a Centre"));
            return;
        }
        if (!activityName) {
            toast.error(t("Please enter activity name"));
            return;
        }

        setLoading(true);

        const finalPayload = {
            id: payload?.id,
            centreId,
            activityName,
            descriptionOutcome,
            CSRBenefit: payload?.noOfPeopleBenefited,
            eventDate,
            filePath,
            isActive
        };

        try {
            const res = await axiosInstance.post("ESG/AddOrUpdateCSR", finalPayload);
            if (res?.data?.success) {
                toast.success(t(`CSR ${editData ? "updated" : "saved"} successfully`));
                setPayload({
                    centreId: "",
                    activityName: "",
                    descriptionOutcome: "",
                    noOfPeopleBenefited: "",
                    eventDate: new Date(),
                    filePath: "",
                    isActive: 1
                })
            } else {
                toast.error(res?.data?.message || t(`Error while ${editData ? "updating" : "saving"} data`));
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error(t("Something went wrong"));
        } finally {
            setLoading(false);
        }
    };

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
                    <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="activityName"
                        id="activityName"
                        lable={"Activity Name"}
                        value={payload?.activityName}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="descriptionOutcome"
                        id="descriptionOutcome"
                        lable={"Description"}
                        value={payload?.descriptionOutcome}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        type="number"
                        name="noOfPeopleBenefited"
                        id="noOfPeopleBenefited"
                        lable={"No of People Benefited"}
                        value={payload?.noOfPeopleBenefited}
                        onChange={handleChange}
                        display="right"
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="eventDate"
                        id="eventDate"
                        className="custom-calendar"
                        lable={t("Event Date")}
                        value={payload?.eventDate}
                        onChange={handleDateChange}
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
                    pageName="CSR"
                    handleUploadCount={handleCaptureUploadedFile}
                />
            )}
        </>
    )
}

export default CSR;