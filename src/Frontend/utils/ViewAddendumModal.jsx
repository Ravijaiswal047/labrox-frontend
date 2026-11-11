import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import FullTextEditor from "../../components/formComponent/TextEditor";
import Tables from "../../components/UI/customTable";
import { dateConfig } from "../../utils/helpers";
import Tooltip from "../../components/formComponent/Tooltip";
import Loading from "../../components/loader/Loading";

function ViewAddendumModal({ show, handleShow, data }) {
    const { t } = useTranslation();
    const isMobile = window.innerWidth <= 768;
    const theme = useLocalStorage("theme", "get");

    return (
        <>

            <Dialog
                visible={show}
                header={t("View Comment")}
                top={"10%"}
                onHide={handleShow}
                className={theme}
                style={{
                    width: isMobile ? "56vw" : "40vw",
                }}
            >
                <div className="m-3">
                    <div
                        dangerouslySetInnerHTML={{ __html: data }}
                    />
                </div>
            </Dialog>
        </>

    );
}

export default ViewAddendumModal;
