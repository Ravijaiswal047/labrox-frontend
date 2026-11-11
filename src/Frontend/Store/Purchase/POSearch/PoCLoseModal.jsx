import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import Input from "../../../../components/formComponent/Input";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import { CustomButton } from "../../../../components/UI/CustomButton";
const PoCLoseModal = ({
    show,
    handleClose,
    state,
}) => {
    const { t } = useTranslation();
    console.log(state, "state");
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;
    const [CancelReason, setCancelReason] = useState("");

    const handlecancel = async () => {
        try {
            if (!CancelReason) {
                toast.error("Please enter cancel reason");
                return;
            }

            const res = await axiosInstance.post(`POSearch/close`, {
                purchaseOrderID: state?.PurchaseOrderID.toString(),
                closeReason: CancelReason,
                indentNo: state?.IndentNo
            });
            const data = res?.data?.message;
            const success = res?.data?.success;
            if (success) {
                toast.success(data);
                handleClose();
            }

        } catch (err) {
            console.log(err);
        }
    };


    return (
        <>
            <Dialog
                header={t(`Purchase Order Close for : -   ${state?.PurchaseOrderNo}`)}
                visible={show}
                top={"25%"}
                className={theme}
                onHide={handleClose}
                style={{
                    width: isMobile ? "30vw" : "40vw",
                }}
            >
                <div className="card">
                    <div className="d-flex">
                        <span className="text-danger" style={{ fontWeight: "bold" }}>
                            PI will Also Close For This PO : - &nbsp; &nbsp; &nbsp;&nbsp;
                        </span>

                        <span className="text-success" style={{ fontWeight: "bold" }}>
                            {state?.PurchaseOrderNo}
                        </span>
                    </div>
                    <div className="row">
                        <Input
                            type="text"
                            lable="Cancel Reason"
                            id="CancelReason"
                            name="CancelReason"
                            value={CancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            respclass="col-xl-6 col-sm-4 col-md-2 col-12"
                        />
                        <CustomButton
                            text={"close Po"}
                            onClick={handlecancel}
                        />
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default PoCLoseModal;
