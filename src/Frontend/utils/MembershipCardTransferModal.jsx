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

const MembershipCardTransferModal = ({
    show,
    handleClose,
    membershipOptions,
    departmentOptions,
    fromMembershipId,
}) => {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;
    const [load, setLoad] = useState(false);
    const [payload, setPayload] = useState({
        FromMembership: fromMembershipId || "",
        ToMembership: "",
        DepartmentIDs: [],
    });

    useEffect(() => {
        setPayload(prev => ({
            ...prev,
            FromMembership: fromMembershipId || "",
            ToMembership: "",
            DepartmentIDs: [],
        }));
    }, [fromMembershipId, show]);

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
        if (!payload.FromMembership || !payload.ToMembership) {
            toast.error(t("Please select both From and To Membership Card."));
            return;
        }
        if (String(payload.FromMembership) === String(payload.ToMembership)) {
            toast.error(t("From and To Membership Card cannot be the same."));
            return;
        }
        setLoad(true);
        axiosInstance
            .post("MembershipCardMaster/CopyMembershipCardTests", {
                fromMembershipCardId: payload.FromMembership,
                toMembershipCardId: payload.ToMembership,
                DepartmentIDs: payload.DepartmentIDs || [],
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
            header={t("Transfer Membership Mapping")}
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
                        dynamicOptions={membershipOptions}
                        name="FromMembership"
                        lable={t("From Membership Card")}
                        id="transferFromMembership"
                        removeIsClearable={true}
                        placeholderName={t("From Membership Card")}
                        value={payload.FromMembership}
                        onChange={handleSelect}
                    />
                </div>
                <div className="col-12">
                    <ReactSelect
                        dynamicOptions={membershipOptions}
                        name="ToMembership"
                        lable={t("To Membership Card")}
                        id="transferToMembership"
                        removeIsClearable={true}
                        placeholderName={t("To Membership Card")}
                        value={payload.ToMembership}
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
                    onClick={handleClose}
                />
                <CustomButton
                    text={load ? t("Transferring...") : t("Transfer")}
                    icon="send"
                    onClick={handleTransfer}
                    disabled={load}
                />
            </div>
        </Dialog>
    );
};

export default MembershipCardTransferModal;
