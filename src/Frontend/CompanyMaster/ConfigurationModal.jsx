import React, { useEffect, useState } from 'react'
import { useLocalStorage } from '../../utils/hooks/useLocalStorage';
import { useTranslation } from 'react-i18next';
import Input from '../../components/formComponent/Input';
import { axiosInstance } from '../../utils/axiosInstance';
import Loading from '../../components/loader/Loading';
import { CustomButton } from '../../components/UI/CustomButton';
import { Dialog } from 'primereact/dialog';
import ReactSelect from '../../components/formComponent/ReactSelect';
import { toast } from 'react-toastify';
import TextAreaInput from '../../components/formComponent/TextAreaInput';

const Configuration = ({ 
    show, 
    onHandleClose, 
    flagType,
    editData,
    onSave,
    companyId
 }) => {
    const { t } = useTranslation();
    const isMobile = window.innerWidth <= 768;
    const theme = useLocalStorage("theme", "get");
    const [loading, setLoading] = useState(false);

    const initialFlagState = {
        FlagName: "",
        ControlType: "",
        PossibleValues: "",
        MinValue: 0,
        MaxValue: 0,
        FlagType: flagType || "company",
        isActive: 1,
    };

    const initialConfigState = {
        id: 0,
        dataType: "",
        labReportUrl: "",
        apiName: "",
        apiUrl: "",
        httpMethod: "",
        headers: "", // Will be parsed/stringified
        payloadTemplate: "",
        verifyWalletCount: "",
        responseKey: "",
        responseValue: "",
        companyId: 0,
    };

    const [flagPayload, setFlagPayload] = useState(initialFlagState)
    const [configPayload, setConfigPayload] = useState(initialConfigState)

    useEffect(() => {
        if (flagType === "configuration") {
            if (editData) {
                setConfigPayload({
                    ...editData,
                    headers: typeof editData.headers === 'object' ? JSON.stringify(editData.headers, null, 2) : editData.headers
                });
            } else {
                setConfigPayload(initialConfigState);
            }
        } else {
            if (editData) {
                setFlagPayload({
                    ...editData,
                    FlagType: flagType,
                });
            } else {
                setFlagPayload({
                    ...initialFlagState,
                    FlagType: flagType,
                });
            }
        }
    }, [editData, flagType, show]);

    const controlOptions = [
        { label: "WhatsApp", value: "Checkbox" },
        { label: "Textbox", value: "Textbox" },
        { label: "Dropdown", value: "Dropdown" },
    ]

    const httpMethodOptions = [
        { label: "GET", value: "GET" },
        { label: "POST", value: "POST" },
        { label: "PUT", value: "PUT" },
        { label: "DELETE", value: "DELETE" },
    ]
    const DataTypeOptions = [
        { label: "WhatsApp", value: "WhatsApp" },
        { label: "Sms", value: "Sms" },
        { label: "Email", value: "Email" },
    ]

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (flagType === "configuration") {
            setConfigPayload({ ...configPayload, [name]: value });
        } else {
            setFlagPayload({ ...flagPayload, [name]: value });
        }
    };

    const handleSelectChange = (name, value) => {
        if (flagType === "configuration") {
            setConfigPayload((prev) => ({
                ...prev,
                [name]: value?.value
            }))
        } else {
            setFlagPayload((prev) => ({
                ...prev,
                [name]: value?.value
            }))
        }
    }

    const handleSubmit = async () => {
        if (flagType === "configuration") {
            if (!configPayload.apiName) { toast.error("API Name is required"); return; }
            if (!configPayload.apiUrl) { toast.error("API URL is required"); return; }
            
            setLoading(true);
            try {
                let parsedHeaders = {};
                try {
                    if (configPayload.headers) {
                        parsedHeaders = JSON.parse(configPayload.headers);
                    }
                } catch (e) {
                    toast.error("Invalid JSON format in Headers");
                    setLoading(false);
                    return;
                }

                const payload = {
                    id: editData?.id || 0,
                    dataType: String(configPayload.dataType || ""),
                    labReportUrl: String(configPayload.labReportUrl || ""),
                    apiName: String(configPayload.apiName || ""),
                    apiUrl: String(configPayload.apiUrl || ""),
                    httpMethod: String(configPayload.httpMethod || ""),
                    headers: parsedHeaders,
                    payloadTemplate: String(configPayload.payloadTemplate || ""),
                    verifyWalletCount: String(configPayload.verifyWalletCount || ""),
                    responseKey: String(configPayload.responseKey || ""),
                    responseValue: String(configPayload.responseValue || ""),
                    companyId: String(companyId || 0),
                };

                const url = editData ? "CommonController/UpdateApiConfiguration" : "CommonController/SaveApiConfiguration";
                const res = await axiosInstance.post(url, payload);
                if (res?.data?.success) {
                    toast.success(res?.data?.message || "Configuration saved successfully");
                    if (onSave) onSave();
                    onHandleClose();
                } else {
                    toast.error(res?.data?.message || "Failed to save configuration");
                }
            } catch (error) {
                toast.error(error?.response?.data?.message || "Error occurred");
            } finally {
                setLoading(false);
            }
        } else {
            if (!flagPayload.FlagName) { toast.error("Flag Name is required"); return; }
            if (!flagPayload.ControlType) { toast.error("Control Type is required"); return; }
            
            setLoading(true);
            try {
                const payload = {
                    flagId: editData?.flagId || 0,
                    flagName: flagPayload?.FlagName,
                    dataType: flagType,
                    controlType: flagPayload?.ControlType,
                    possibleValues: flagPayload?.PossibleValues,
                    minLength: flagPayload?.MinValue,
                    maxLength: flagPayload?.MaxValue,
                    isActive: 1,
                };

                const res = await axiosInstance.post("CompanyMaster/AddCentreOrRateTypeFlagMaster", payload);
                if (res?.data?.success) {
                    toast.success(res?.data?.message || "Flag saved successfully");
                    if (onSave) onSave();
                    onHandleClose();
                } else {
                    toast.error(res?.data?.message || "Failed to save flag");
                }
            } catch (error) {
                toast.error(error?.response?.data?.message || "Error occurred");
            } finally {
                setLoading(false);
            }
        }
    }

    const getModalTitle = () => {
        if (flagType === "configuration") {
            return editData ? "Update API Configuration" : "Add API Configuration";
        }
        const type = flagType === "company" ? "Company" : flagType === "centre" ? "Centre" : "Rate Type";
        const action = editData ? "Update" : "Add";
        return `${action} ${type} Flag`;
    };

    return (
        <Dialog
            visible={show}
            className={theme}
            header={t(getModalTitle())}
            onHide={onHandleClose}
            style={{
                width: isMobile ? "90vw" : "70vw",
            }}
        >
            <div className='pt-2 pl-2 pr-2'>
                {flagType === "configuration" ? (
                    <div className="row pt-2 pl-2 pr-2">
                        <div className="col-sm-3">
                             <ReactSelect
                                dynamicOptions={DataTypeOptions}
                                label={t("Data Type")}
                                placeholderName={"Select Data Type"}
                                name="dataType"
                                value={configPayload.dataType}
                                onChange={handleSelectChange}
                            />
                        </div>
                        <div className="col-sm-3">
                            <Input
                                lable={"API Name"}
                                type="text"
                                name="apiName"
                                value={configPayload.apiName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-3">
                            <Input
                                lable={"API URL"}
                                type="text"
                                name="apiUrl"
                                value={configPayload.apiUrl}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-3">
                             <ReactSelect
                                dynamicOptions={httpMethodOptions}
                                label={t("HTTP Method")}
                                placeholderName={"Select HTTP Method"}
                                name="httpMethod"
                                value={configPayload.httpMethod}
                                onChange={handleSelectChange}
                            />
                        </div>
                        <div className="col-sm-6 mt-2">
                            <Input
                                lable={"Lab Report URL"}
                                type="text"
                                name="labReportUrl"
                                value={configPayload.labReportUrl}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-6 mt-2">
                            <Input
                                lable={"Payload Template"}
                                type="text"
                                name="payloadTemplate"
                                value={configPayload.payloadTemplate}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-3 mt-2">
                            <Input
                                lable={"Verify Wallet Count"}
                                type="text"
                                name="verifyWalletCount"
                                value={configPayload.verifyWalletCount}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-3 mt-2">
                            <Input
                                lable={"Response Key"}
                                type="text"
                                name="responseKey"
                                value={configPayload.responseKey}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-3 mt-2">
                            <Input
                                lable={"Response Value"}
                                type="text"
                                name="responseValue"
                                value={configPayload.responseValue}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-12 mt-2">
                            <TextAreaInput
                                lable={"Headers (JSON Format)"}
                                name="headers"
                                rows="4"
                                value={configPayload.headers}
                                onChange={handleChange}
                                placeholder='{"Content-Type": "application/json"}'
                            />
                        </div>
                    </div>
                ) : (
                    <div className="row pt-2 pl-2 pr-2">
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="FlagName"
                                id="FlagName"
                                lable={"Flag Name"}
                                value={flagPayload.FlagName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <ReactSelect
                                dynamicOptions={controlOptions}
                                name="Configuration"
                                lable={t("Select Configuration")}
                                id="configuration"
                                removeIsClearable={true}
                                placeholderName={t("Select Configuration")}
                                value={flagPayload.ControlType}
                                onChange={handleSelectChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="MinValue"
                                id="MinValue"
                                lable={"Min Value"}
                                value={flagPayload.MinValue}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="MaxValue"
                                id="MaxValue"
                                lable={"Max Value"}
                                value={flagPayload.MaxValue}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="PossibleValues"
                                id="PossibleValues"
                                lable={"Possible Values"}
                                value={flagPayload.PossibleValues}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                )}

                <div className="row mx-4 mt-3 d-flex justify-content-end">
                    <div className="col-sm-1 mr-4">
                        {loading ? (
                            <Loading />
                        ) : (
                            <CustomButton
                                text={editData ? t("Update") : t("Save")}
                                icon={editData ? "edit" : "save"}
                                onClick={handleSubmit}
                            />
                        )}
                    </div>
                    <div className="col-sm-1">
                        <CustomButton
                            text={t("Cancel")}
                            icon={"cancel"}
                            onClick={() => {
                                setFlagPayload(initialFlagState);
                                setConfigPayload(initialConfigState);
                                onHandleClose()
                            }}
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default Configuration