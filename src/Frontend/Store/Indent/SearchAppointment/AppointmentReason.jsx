import React, { useState } from "react";
import Heading from "../../../../components/UI/Heading";
import Input from "../../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import { useLocation } from "react-router-dom";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { CustomButton } from "../../../../components/UI/CustomButton";

function AppointmentReason({ show, handleClose, Status, onSubmit }) {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const { pathname } = useLocation();

    const isMobile = window.innerWidth < 768;

    const [payload, setPayload] = useState({
        CloseReason: "",
        OtherReason: "",
    }); 
    console.log(Status, "status");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setPayload((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
        }));
    };

    const handleSubmit = () => {
        const data = {
            ...payload
        };
        onSubmit(data);
        handleClose();
    };

    return (
        <Dialog
            header={ Status == 5 ? t("Cancel Reason") : t("Re-Open Reason")}
            visible={show}
            top={"25%"}
            className={theme}
            onHide={handleClose}
            style={{ width: isMobile ? "90vw" : "30vw" }}
        >
            <div className="p-3">
                <div className="row px-2 py-2">
                    <Input
                        type="text"
                        placeholder=" "
                        lable= {Status == 5 ? "Cancel Reason" : "Re-Open Reason" }
                        id="Reason"
                        name="Reason"
                        value={payload?.Reason}
                        onChange={handleChange}
                        respclass={"col-12"}
                    />
                    {Status == 5 && (
                        <Input
                            type="text"
                            placeholder=" "
                            lable="Other Reason"
                            id="OtherReason"
                            name="OtherReason"
                            value={payload?.OtherReason}
                            onChange={handleChange}
                            respclass={"col-12"}
                        />
                    )}

                    <div className="col-12 mt-3">
                        <CustomButton
                            text="Save"
                            icon="save"
                            className="btn btn-primary btn-sm px-3"
                            onClick={handleSubmit}
                        />
                        <CustomButton
                            text="Cancel"
                            icon="cancel"
                            className="btn btn-secondary btn-sm px-3 ml-2"
                            onClick={handleClose}
                        />
                    </div>

                </div>
            </div>
        </Dialog>
    );
}

export default AppointmentReason;