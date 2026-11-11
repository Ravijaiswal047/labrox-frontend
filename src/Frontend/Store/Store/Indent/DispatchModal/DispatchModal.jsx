import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import Tables from "../../../../components/UI/customTable";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";

const DispatchModal = ({ show, onHandleShow, title, Id }) => {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        if (show && Id) {
            handleDispatch(Id);
        }
    }, [show, Id]);

    const handleDispatch = (Id) => {
        axiosInstance
            .get(`IndentReceive/Dispatchdetails?IndentNo=${Id}`)
            .then((res) => {
                if (res?.data?.message) {
                    setTableData(res?.data?.message || []);
                } else {
                    toast.error(res?.data?.message);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };


    return (
        <>
            <Dialog
                header={title}
                visible={show}
                top={"25%"}
                className={theme}
                onHide={onHandleShow}
                style={{
                    width: isMobile ? "55vw" : "45vw",
                }}
            >
                <div className="modal-card">
                    <div className="col-12">
                        <Tables>
                            <thead style={{ width: "auto" }}>

                                <tr>
                                    <th>{t("DispatchDate")}</th>
                                    <th>{t("BatchNumber")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.length > 0 ? (
                                    tableData.map((row, index) => (
                                        <tr key={index}>
                                            <td data-title={t("DispatchDate")}>
                                                {row?.DispatchDate || "-"}
                                            </td>
                                            <td data-title={t("BatchNumber")}>
                                                {row?.IssueInvoiceNo || "-"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} style={{ textAlign: "center" }}>
                                            No Data Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Tables>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default DispatchModal;
