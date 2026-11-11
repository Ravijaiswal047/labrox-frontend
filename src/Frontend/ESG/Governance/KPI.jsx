import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../utils/axiosInstance";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { CustomButton } from "../../../components/UI/CustomButton";
import Input from "../../../components/formComponent/Input";
import { GetGlobalData } from "../../../utils/NetworkApi/commonApi";

const KPI = ({ editData, setEditData }) => {
    const [t] = useTranslation();
    const [centre, setCentre] = useState([]);
    const [status, setStatus] = useState([]);
    const [loading, setLoading] = useState(false);

    const [payload, setPayload] = useState({
        centreId: "",
        kpiName: "",
        target: "",
        progressNotes: "",
        status: 0,
        isActive: 1,
    });

    useEffect(() => {
        if (editData) {
            setPayload({
                id: editData?.Id,
                centreId: editData?.CentreId,
                kpiName: editData?.KPIName || "",
                target: editData?.Target || "",
                progressNotes: editData?.ProgressNotes || "",
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
        GetGlobalData(setStatus, "KPIStatus")
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
        if(name === "kpiName"){
            setPayload({ ...payload, [name]: value?.toUpperCase() });
            return;
        }
        setPayload({ ...payload, [name]: value });
        
    };

    const handleToggle = (field) => {
        setPayload((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };

    const handleSave = async () => {
        if (!payload?.centreId) {
            toast.error(t("Please select a Centre"));
            return;
        }
        if (!payload?.kpiName) {
            toast.error(t("Please enter kPI Name"));
            return;
        }

        const finalPayload = {
            ...payload,
            id: payload.id,
            status: String(payload.status)
        }

        setLoading(true);
        try {
            const res = await axiosInstance.post("ESG/AddOrUpdateKPI", finalPayload);
            if (res.data?.success) {
                toast.success(t(`KPI record ${editData ? "updated" : "saved"} successfully`));
                if (setEditData) setEditData(null);
                setPayload({
                    centreId: "",
                    kpiName: "",
                    target: "",
                    progressNotes: "",
                    status: 1,
                    isActive: 1,
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
                        name="kpiName"
                        id="kpiName"
                        lable={"KPI Name"}
                        value={payload?.kpiName}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-sm-2">
                    <ReactSelect
                        dynamicOptions={status}
                        name="status"
                        id="status"
                        lable={t("Status")}
                        placeholderName={t("Status")}
                        removeIsClearable={true}
                        value={payload.status}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-sm-2">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="target"
                        id="target"
                        lable={"Target"}
                        value={payload?.target}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-sm-2">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="progressNotes"
                        id="progressNotes"
                        lable={"Progress & Notes"}
                        value={payload?.progressNotes}
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
                    />
                </div>
            </div>
        </>
    );
};

export default KPI;