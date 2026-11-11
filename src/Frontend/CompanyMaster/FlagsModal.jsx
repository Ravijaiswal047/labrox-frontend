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

const FlagsModal = ({ 
    show, 
    onHandleClose, 
    flagType,
    editData,
    onSave
 }) => {
    const { t } = useTranslation();
    const isMobile = window.innerWidth <= 768;
    const theme = useLocalStorage("theme", "get");
    const [loading, setLoading] = useState(false);

    const initialState = {
        FlagName: "",
        ControlType: "",
        PossibleValues: "",
        MinValue: 0,
        MaxValue: 0,
        FlagType: flagType || "company",
        isActive: 1,
    };

    const [flagPayload, setFlagPayload] = useState(initialState)

    useEffect(() => {
        if (editData) {
            setFlagPayload({
                ...editData,
                FlagType: flagType,
            });
        } else {
            setFlagPayload({
                ...initialState,
                FlagType: flagType,
            });
        }
    }, [editData, flagType, show]);

    const controlOptions = [
        { label: "Checkbox", value: "Checkbox" },
        { label: "Textbox", value: "Textbox" },
        { label: "Dropdown", value: "Dropdown" },
    ]

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFlagPayload({ ...flagPayload, [name]: value });
    };
    const handleSelectChange = (name, value) => {
        setFlagPayload((prev) => ({
            ...prev,
            [name]: value?.value
        }))
    }

    const handleSubmit = async () => {
        if (!flagPayload.FlagName) {
            toast.error("Flag Name is required");
            return;
        }
        if (!flagPayload.ControlType) {
            toast.error("Control Type is required");
            return;
        }
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
                setFlagPayload(initialState);
                if (onSave) onSave();
                onHandleClose()
            } else {
                toast.error(res?.data?.message || "Failed to save flag");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Error occurred");
        } finally {
            setLoading(false);
        }
    }

    const getModalTitle = () => {
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
                width: isMobile ? "80vw" : "70vw",
            }}
        >
            <div className='pt-2 pl-2 pr-2'>
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
                        name="ControlType"
                        lable={t("Control Type")}
                        id="ControlType"
                        removeIsClearable={true}
                        placeholderName={t("Control Type")}
                        value={flagPayload.ControlType}
                        onChange={handleSelectChange}
                    />
                </div>
                {flagPayload.ControlType == "Textbox" && (
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
                )}
                {flagPayload.ControlType == "Textbox" && (
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
                )}
                {flagPayload.ControlType == "Dropdown" && (
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
                )}
                {/* <div className="row px-2 mt-3 mb-2">
                    <div className="col-sm-12">
                    <small className="text-muted">
                        <strong>Note:</strong> For Dropdown, use pipe (|) to separate values. 
                        Example: "Option1|Option2|Option3"
                    </small>
                    </div>
                </div> */}

            </div>

                <div className="row px-2 mt-3 justify-content-end">
                    <div className="col-sm-1">
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
                                    setFlagPayload(initialState);
                                    onHandleClose()
                                }}
                            />
                        </div>
                </div>
            </div>
        </Dialog>
    )
}

export default FlagsModal