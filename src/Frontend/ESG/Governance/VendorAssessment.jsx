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
import { GetGlobalData } from "../../../utils/NetworkApi/commonApi"

const VendorAssessment = ({ editData, setEditData }) => {
    const [t] = useTranslation()
    const [centre, setCentre] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(false)
        const [status, setStatus] = useState([]);
    const [showFileModal, setShowFileModal] = useState({
        modal: false,
        data: "",
        index: -1,
    });

    const [payload, setPayload] = useState({
        centreId: "",
        vendorName: "",
        status: "",
        assessmentFilePath: "",
        isActive: 1
    })

    useEffect(() => {
        if (editData) {
            setPayload({
                id: editData?.Id,
                centreId: editData?.CentreId || "",
                vendorName: editData?.VendorName || "",
                status: editData?.Status || "",
                assessmentFilePath: editData?.AssessmentFilePath || "",
                isActive: editData?.IsActive ?? 1,
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
        GetGlobalData(setStatus, "VendorAssessmentStatus")
    }, [])

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
        const currentGuid = payload?.assessmentFilePath ? payload?.assessmentFilePath : guidNumber();
        setPayload(prev => ({ ...prev, assessmentFilePath: currentGuid }));
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
            vendorName,
            status,
            isActive,
            assessmentFilePath
        } = payload;

        if (!centreId) {
            toast.error(t("Please select a Centre"));
            return;
        }
        if (!vendorName) {
            toast.error(t("Please enter Vendor Name"));
            return;
        }

        setLoading(true);

        const finalPayload = {
            id: payload?.id,
            centreId: centreId,
            vendorName: vendorName,
            status: status,
            assessmentFilePath: assessmentFilePath,
            isActive: isActive
        };

        try {
            const res = await axiosInstance.post("ESG/AddOrUpdateVendorAssessment", finalPayload);
            if (res?.data?.success) {
                toast.success(t(`Assessment record ${editData ? "updated" : "saved"} successfully`));
                setPayload({
                    centreId: "",
                    vendorName: "",
                    status: "",
                    assessmentFilePath: "",
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
                <div className="col-sm-2">
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
                <div className="col-sm-2">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="vendorName"
                        id="vendorName"
                        lable={"Vendor Name"}
                        value={payload?.vendorName}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-sm-2">
                    <ReactSelect
                        dynamicOptions={status}
                        name="status"
                        lable={t("Status")}
                        id="status"
                        removeIsClearable={true}
                        placeholderName={t("Status")}
                        value={payload.status}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-sm-1">
                    <CustomButton
                        text={payload.assessmentFilePath ? t("File Linked") : t("Upload file")}
                        onClick={handleOpenUploadModal}
                    />
                </div>
                <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                    gap: "5px"
                }}>
                    <label class="switch mb-0">
                        <input
                            type="checkbox"
                            checked={payload.isActive === 1}
                            onChange={() => handleToggle("isActive")}
                        />
                        <span class="slider"></span>
                    </label>
                    <strong>
                        <span>{t("IsActive")}</span>
                    </strong>
                </div>
                <div className="col-sm-2">
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

export default VendorAssessment;