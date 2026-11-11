import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../utils/axiosInstance";
import { guidNumber } from "../../util/Commonservices";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { CustomButton } from "../../../components/UI/CustomButton";
import UploadFile from "../../utils/UploadFileModal/UploadFile";
import Input from "../../../components/formComponent/Input";
import { GetGlobalData } from "../../../utils/NetworkApi/commonApi";

const LegalRegister = ({ editData, setEditData }) => {
    const [t] = useTranslation();
    const [centre, setCentre] = useState([]);
    const [status, setStatus] = useState([])
    const [loading, setLoading] = useState(false);

    const [payload, setPayload] = useState({
        centreId: "",
        regulationLaw: "",
        notes: "",
        complianceStatus: "",
        isActive: 1
    });

    const [showFileModal, setShowFileModal] = useState({
        modal: false,
        data: "",
        type: "",
    });

    const complianceStatusOptions = [
        { label: "Open", value: "0" },
        { label: "In Process", value: "1" },
        { label: "Closed", value: "2" },
    ]

    useEffect(() => {
        console.log("editData in LegalRegister:", editData);
        if (editData) {
            setPayload({
                id: editData?.Id,
                centreId: editData?.CentreId || "",
                regulationLaw: editData?.RegulationLaw || "",
                notes: editData?.Notes || "",
                complianceStatus: editData?.ComplianceStatus ?? 1,
                isActive: editData?.IsActive === true ? 1 : 0,
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
        GetGlobalData(setStatus, "ComplianceStatus")
    }, []);


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

    const handleSave = async () => {
        const { centreId, regulationLaw, notes, complianceStatus, isActive } = payload;

        if (!centreId) {
            toast.error(t("Please select a Centre"));
            return;
        }
        if (!regulationLaw) {
            toast.error(t("Please enter Regulation Law"));
            return;
        }

        const finalPayload = {
            id: payload.id,
            centreId,
            regulationLaw,
            notes,
            complianceStatus,
            isActive
        }
        console.log("finalPayload", finalPayload);

        setLoading(true);
        try {
            const res = await axiosInstance.post("ESG/AddOrUpdateLegalRegister", finalPayload);
            if (res.data?.success) {
                toast.success(t(`Legal Register record ${editData ? "updated" : "saved"} successfully`));
                if (setEditData) setEditData(null);
                setPayload({
                    centreId: "",
                    regulationLaw: "",
                    notes: "",
                    complianceStatus: "",
                    isActive: 1
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
            <div className="row px-2 py-2">

                <div className="col-sm-2">
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
                <div className="col-sm-2">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="regulationLaw"
                        id="regulationLaw"
                        lable={"Regulation Law"}
                        value={payload?.regulationLaw}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-sm-2">
                    <ReactSelect
                        dynamicOptions={status}
                        name="complianceStatus"
                        id="complianceStatus"
                        lable={t("Status")}
                        placeholderName={t("Compliance Status")}
                        removeIsClearable={true}
                        value={payload.complianceStatus}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-sm-2">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="notes"
                        id="notes"
                        lable={"Detail"}
                        value={payload?.notes}
                        onChange={handleChange}
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

                <div className="">
                    <CustomButton
                        text={editData ? t("Update") : t("Save")}
                        icon={editData ? t("edit") : t("save")}
                        loading={loading}
                        onClick={handleSave}
                        className="btn-primary w-100"
                    />
                </div>
            </div>
        </>
    );
};

export default LegalRegister;