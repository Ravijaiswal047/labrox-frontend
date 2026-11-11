import React, { useState } from "react";
import Heading from "../../../../components/UI/Heading";
import Input from "../../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import { useLocation } from "react-router-dom";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";

function CloseReason({ show, onHandleShow, id }) {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const { pathname } = useLocation();

    const isMobile = window.innerWidth < 768;

    const [payload, setPayload] = useState({
        CloseReason: "",
        IndentNo: "",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setPayload((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
        }));
    };
    console.log("payload", id);
    const handleSubmit = () => {
        if (payload?.CloseReason === "") {
            toast.error("Please Enter Close Reason");
            return;
        }
        axiosInstance
            .post("StoreIndentIssue/RejectOldIndent", {
                IndentNo: id,
                Reason: payload?.CloseReason,
            })
            .then((res) => {
                if (res?.data?.success) {
                    toast.success(res?.data?.message);
                    onHandleShow();
                } else {
                    toast.error(res?.data?.message);
                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message);
                console.log(err);
            });
    };

    return (
        <Dialog
            header={t("ISSUE CLOSE REASON")}
            visible={show}
            top={"25%"}
            className={theme}
            onHide={onHandleShow}
            style={{ width: isMobile ? "90vw" : "30vw" }}
        >
            <div className="p-3">
                <div className="row px-2 py-2">

                    <div className="mb-3" style={{ fontWeight: "700", color: "#000" }}>
                        Do You Want To Completely Close This Indent?
                    </div>

                    <Input
                        type="text"
                        placeholder=" "
                        lable="CloseReason"
                        id="CloseReason"
                        name="CloseReason"
                        value={payload?.CloseReason}
                        onChange={handleChange}
                        respclass={"col-12"}
                    />

                    <div className="col-12 mt-3">
                        <button
                            className="btn btn-danger btn-sm me-2 px-3 ms-2"

                            onClick={handleSubmit}
                        >
                            {t("Yes")}
                        </button>

                        <button
                            className="btn btn-secondary btn-sm px-3 ml-2"
                            onClick={onHandleShow}
                        >
                            {t("No")}
                        </button>
                    </div>

                </div>
            </div>
        </Dialog>
    );
}

export default CloseReason;