import React, { useState } from "react";
import Heading from "../../components/UI/Heading";
import Input from "../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useLocation } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { CustomButton } from "../../components/UI/CustomButton";

function MachineBreakDownReason({ show, id ,onHide}) {
  
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const { pathname } = useLocation();
    const isMobile = window.innerWidth < 768;
    const [payload, setPayload] = useState({
        Reason: "",
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
        if (!payload?.Reason) {
            toast.error("Please Enter Reason");
            return;
        }
        axiosInstance
            .post("MachineGroup/SaveBreakdownReason?reason=" + payload?.Reason)
            .then((res) => {
                if (res?.data?.success) {
                    toast.success(res?.data?.message);
                    setPayload({ Reason: "" });
                    onHide();
                } else {
                    toast.error(res?.data?.message);
                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message);
                console.log(err);
            })
    };

    return (
        <Dialog
            header={t("Add New Machine Breakdown Reason")}
            visible={show}
            top={"25%"}
            className={theme}
            onHide={onHide}
            style={{ width: isMobile ? "90vw" : "30vw" }}
        >
            <div className="p-3">
                <div className="row px-2 py-2">
                    <Input
                        type="text"
                        placeholder=" "
                        lable="Machine Breakdown Reason"
                        id="Reason"
                        name="Reason"
                        value={payload?.Reason}
                        onChange={handleChange}
                        respclass={"col-12"}
                    />

                    <div className="col-12 mt-3">
                        <CustomButton
                            text={t("Save")}
                            icon={"save"}
                            className="btn btn-danger btn-sm me-2 px-3 mr-2"
                            onClick={handleSubmit}
                        />

                        <CustomButton
                            text={t("Cancel")}
                            icon={"cancel"}
                            className="btn btn-secondary btn-sm px-3 mr-2"
                            onClick={onHide}
                        />
                    </div>

                </div>
            </div>
        </Dialog>
    );
}

export default MachineBreakDownReason;