import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../utils/axiosInstance";
import { guidNumber } from "../../util/Commonservices";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { CustomButton } from "../../../components/UI/CustomButton";
import UploadFile from "../../utils/UploadFileModal/UploadFile";

const Audit = ({ editData, setEditData }) => {
    const [t] = useTranslation();
    const [centre, setCentre] = useState([]);
    const [loading, setLoading] = useState(false);

    const [payload, setPayload] = useState({
        centreId: "",
        esgReportFilePath: "",
        fireSafetyReportFilePath: "",
        status: "",
        isActive: 1
    });

    const [showFileModal, setShowFileModal] = useState({
        modal: false,
        data: "",
        type: "",
    });

    const auditStatusOptions = [
        { label: "Open", value: "0" },
        { label: "In Process", value: "1" },
        { label: "Closed", value: "2" },
    ]

    useEffect(() => {
        if (editData) {
            setPayload({
                id: editData?.Id,
                centreId: editData?.CentreId || "",
                esgReportFilePath: editData?.ESGReportFilePath || "",
                fireSafetyReportFilePath: editData?.FireSafetyReportFilePath || "",
                status: editData?.Status ?? 1,
                isActive: editData?.IsActive
            });
        }
    }, [editData]);

    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get("Centre/getAccessCentres");
            const CentreDataValue = res.data.message.map((ele) => ({
                value: ele.CentreID,
                label: ele.Centre,
            }));
            setCentre(CentreDataValue);
        } catch (error) {
            console.error("Error fetching centres", error);
        }
    };

    useEffect(() => {
        getAccessCentres();
    }, []);


    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value?.value
        }))
    }

     const handleToggle = (field) => {
        setPayload((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };

    const handleOpenUploadModal = (type) => {
        const existingPath = type === 'esg' ? payload.esgReportFilePath : payload.fireSafetyReportFilePath;
        const currentGuid = existingPath || guidNumber();

        setPayload(prev => ({
            ...prev,
            [type === 'esg' ? 'esgReportFilePath' : 'fireSafetyReportFilePath']: currentGuid
        }));

        setShowFileModal({
            modal: true,
            data: currentGuid,
            type: type
        });
    };

    const handleSave = async () => {
        const {centreId,esgReportFilePath, fireSafetyReportFilePath, status, isActive } = payload;

        if (!payload.centreId) {
            toast.error(t("Please select a Centre"));
            return;
        }

        const finalPayload = {
            id: payload.id,
            centreId,
            esgReportFilePath,
            fireSafetyReportFilePath,
            status, 
            isActive
        }

        setLoading(true);
        try {
            const res = await axiosInstance.post("ESG/AddOrUpdateAudit", finalPayload);
            if (res.data?.success) {
                toast.success(t(`Audit record ${editData ? "updated" : "saved"} successfully`));
                if (setEditData) setEditData(null);
                setPayload({
                    centreId: "",
                    esgReportFilePath: "",
                    fireSafetyReportFilePath: "",
                    status: 1
                })
            } else {
                toast.error(res.data?.message || "Error saving record");
            }
        } catch (error) {
            console.error("API Error", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="row px-2 py-2 align-items-center g-2">

                <div className="col-12 col-sm-6 col-md-3">
                    <ReactSelect
                        dynamicOptions={centre}
                        name="centreId"
                        lable={t("Centre")}
                        placeholderName={t("Select Centre")}
                        removeIsClearable={true}
                        value={payload.centreId}
                        onChange={handleReactSelectChange}
                    />
                </div>
                {editData && (
                    <div className="col-12 col-sm-6 col-md-3">
                        <ReactSelect
                            dynamicOptions={auditStatusOptions}
                            name="status"
                            lable={t("Status")}
                            placeholderName={t("Status")}
                            removeIsClearable={true}
                            value={payload.status}
                            onChange={handleReactSelectChange}
                        />
                    </div>
                )}
                {!editData && (
                    <div className="col-6 col-sm-6 col-md-auto">
                        <CustomButton
                            text={payload.esgReportFilePath ? t("ESG Report Linked") : t("Upload ESG Report")}
                            icon="upload"
                            onClick={() => handleOpenUploadModal('esg')}
                            className="w-100"
                        />
                    </div>
                )}
                {!editData && (
                    <div className="col-6 col-sm-6 col-md-auto">
                        <CustomButton
                            text={payload.fireSafetyReportFilePath ? t("Fire Safety Linked") : t("Upload Fire Safety")}
                            icon="upload"
                            onClick={() => handleOpenUploadModal('fire')}
                            className="w-100"
                        />
                    </div>
                )}

                <div className="col-6 col-sm-6 col-md-auto d-flex align-items-center px-3 py-2" style={{
                    gap: "8px"
                }}>
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

                <div className="col-6 col-sm-6 col-md-auto">
                    <CustomButton
                        text={editData ? t("Update Audit") : t("Save Audit")}
                        icon={editData ? t("edit") : t("save")}
                        loading={loading}
                        onClick={handleSave}
                        className="btn-primary w-100"
                    />
                </div>
            </div>

            {showFileModal.modal && (
                <UploadFile
                    show={showFileModal.modal}
                    handleClose={() => setShowFileModal({ modal: false, data: "", type: "" })}
                    documentId={showFileModal.data}
                    pageName={showFileModal.type === 'esg' ? "ESG_Audit" : "Fire_Safety"}
                    handleUploadCount={(name, count) => {
                        if (count > 0) toast.success(t("File linked successfully"));
                    }}
                />
            )}
        </>
    );
};

export default Audit;