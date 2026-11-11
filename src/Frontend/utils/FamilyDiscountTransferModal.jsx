import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CancelButton, CustomButton } from "../../components/UI/CustomButton";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";

const FamilyDiscountTransferModal = ({
    show,
    handleClose,
    policyOptions,
    departmentOptions,
    fromPolicyId,
}) => {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;
    const [load, setLoad] = useState(false);
    const [payload, setPayload] = useState({
        FromPolicy: fromPolicyId || "",
        ToPolicy: "",
        DepartmentIDs: [],
    });

    useEffect(() => {
        setPayload(prev => ({ ...prev, FromPolicy: fromPolicyId || "", ToPolicy: "", DepartmentIDs: [] }));
    }, [fromPolicyId, show]);

    const handleSelect = (name, option) => {
        setPayload(prev => ({ ...prev, [name]: option?.value ?? "" }));
    };

    const handleMultiSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleTransfer = () => {
        if (!payload.FromPolicy || !payload.ToPolicy) {
            toast.error(t("Please select both From and To Policy."));
            return;
        }
        if (payload.FromPolicy === payload.ToPolicy) {
            toast.error(t("From Policy and To Policy cannot be the same."));
            return;
        }
        setLoad(true);
        axiosInstance
            .post("Employee/CopyFamilyDiscountPolicyItems", {
                fromPolicyID: payload.FromPolicy,
                toPolicyID: payload.ToPolicy,
                departmentIDs: payload.DepartmentIDs,
            })
            .then((res) => {
                if (res.data?.success) {
                    toast.success(res.data.message);
                    handleClose();
                } else {
                    toast.error(res.data?.message || t("Something went wrong"));
                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || t("Something went wrong"));
            })
            .finally(() => setLoad(false));
    };

    return (
        <Dialog
            header={t("Transfer Policy")}
            visible={show}
            onHide={handleClose}
            className={theme}
            style={{ width: isMobile ? "95vw" : "420px" }}
            draggable={false}
        >
            <Divider className={`custom-divider-header ${theme}`} />

            <div className="row p-2">
                <div className="col-12">
                    <ReactSelect
                        dynamicOptions={policyOptions}
                        name="FromPolicy"
                        lable={t("From Policy")}
                        id="transferFromPolicy"
                        removeIsClearable={true}
                        placeholderName={t("From Policy")}
                        value={payload.FromPolicy}
                        onChange={handleSelect}
                    />
                </div>
                <div className="col-12">
                    <ReactSelect
                        dynamicOptions={policyOptions}
                        name="ToPolicy"
                        lable={t("To Policy")}
                        id="transferToPolicy"
                        removeIsClearable={true}
                        placeholderName={t("To Policy")}
                        value={payload.ToPolicy}
                        onChange={handleSelect}
                    />
                </div>
                <div className="col-12">
                    <MultiSelectComp
                        options={departmentOptions}
                        value={payload?.DepartmentIDs}
                        name="DepartmentIDs"
                        id="DepartmentIDs"
                        onChange={handleMultiSelectChange}
                        label={t("Select Department")}
                    />
                </div>
            </div>

            <div className="d-flex justify-content-between gap-2 px-2 pb-2">
                <CancelButton
                    text={t("Cancel")}
                    style={{backgroundColor: "#f10b0b"}}
                    onClick={handleClose}
                />
                <CustomButton
                    text={t("Transfer")}
                    icon="send"
                    onClick={handleTransfer}
                    loading={load}
                    disabled={load}
                />
            </div>
        </Dialog>
    );
};

export default FamilyDiscountTransferModal;
