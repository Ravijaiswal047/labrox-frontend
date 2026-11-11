import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import Input from "../../../../components/formComponent/Input";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import { CustomButton } from "../../../../components/UI/CustomButton";
const PoEmailModal = ({
    show,
    handleClose,
    state,
}) => {
    const { t } = useTranslation();
    console.log(state, "state");
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;
    const [RejectReason, setRejectReason] = useState("");
    const [mailId, setMailId] = useState("");
    const [CC, setCC] = useState("");
    const [BCC, setBCC] = useState("");

    // const handlecancel = async () => {
    //     try {
    //         if (!CancelReason) {
    //             toast.error("Please enter cancel reason");
    //             return;
    //         }

    //         const res = await axiosInstance.post(`POSearch/close`, {
    //             purchaseOrderID: state?.PurchaseOrderID.toString(),
    //             closeReason: CancelReason,
    //             indentNo: state?.IndentNo
    //         });
    //         const data = res?.data?.message;
    //         const success = res?.data?.success;
    //         if (success) {
    //             toast.success(data);
    //             handleClose();
    //         }

    //     } catch (err) {
    //         console.log(err);
    //     }
    // };


    return (
        <>
            <Dialog
                header={t(`Purchase Order Mail Sending`)}
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
                            Vendor : - &nbsp; &nbsp; &nbsp;&nbsp;
                        </span>

                        <span className="text-success" style={{ fontWeight: "bold" }}>
                            {state?.SupplierName}
                        </span>

                    </div>
                    <div className="d-flex">
                        <span className="text-danger" style={{ fontWeight: "bold" }}>
                            PO Number : - &nbsp; &nbsp; &nbsp;&nbsp;
                        </span>

                        <span className="text-success" style={{ fontWeight: "bold" }}>
                            {state?.PurchaseOrderNo}
                        </span>
                    </div>
                    <div className="row">
                        <Input
                            type="text"
                            lable="Mail"
                            id="mailId"
                            name="mailId"
                            value={mailId}
                            onChange={(e) => setMailId(e.target.value)}
                            respclass="col-12"
                        />

                        <Input
                            type="text"
                            lable="CC"
                            id="CC"
                            name="CC"
                            value={CC}
                            onChange={(e) => setCC(e.target.value)}
                            respclass="col-12"
                        />

                        <Input
                            type="text"
                            lable="BCC"
                            id="BCC"
                            name="BCC"
                            value={BCC}
                            onChange={(e) => setBCC(e.target.value)}
                            respclass="col-12"
                        />

                        <div className="col-12 d-flex gap-2 mt-2">
                            <CustomButton
                             text={"Reject"}
                             className="mr-4"
                              //onClick={handlecancel}
                              />
                            <CustomButton text={"Close Po"} onClick={handleClose} />
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default PoEmailModal;
