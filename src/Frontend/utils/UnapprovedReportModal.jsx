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

function UnapprovedReportModal({ show, handleShow, reportUrl, data }) {
    const { t } = useTranslation();
    const isMobile = window.innerWidth <= 768;
    const theme = useLocalStorage("theme", "get");

    const openReport = (reportURL) => {
        window.open(reportURL)
    }
    return (
        <Dialog
            visible={show}
            header={t("Unapproved Reports")}
            top={"10%"}
            onHide={handleShow}
            className={theme}
            style={{
                width: isMobile ? "70vw" : "55vw",
            }}
        >
            <div
                className="p-dialog-header custom-box-body"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    // backgroundColor: "#bd933aff",
                }}
            >
                <div
                    style={{
                        // backgroundColor: "#b53f3fff",
                        display: "",
                        gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
                        gap: "8px",
                        padding: "0px",
                        borderRadius: "8px",
                    }}
                    className="d-flex flex-wrap"
                >
                    <div
                        style={{
                            display: "flex",
                            minWidth: "135px",
                            // display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <i className="fa fa-file mr-1" style={{ color: "white" }}></i>
                        <Tooltip position="bottom" label={t("LabNo")}>
                            <span>{data?.LedgerTransactionNo}</span>
                        </Tooltip>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            minWidth: "135px",
                            // display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <i className="fa fa-user mr-1" style={{ color: "white" }}></i>
                        <Tooltip position="bottom" label={t("PatientName")}>
                            <span>{data?.PatientName}</span>
                        </Tooltip>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            minWidth: "135px",
                            // display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <i className="fa fa-phone mr-1" style={{ color: "white" }}></i>
                        <Tooltip position="bottom" label={t("MobileNo")}>
                            <span>{data?.MobileNo}</span>
                        </Tooltip>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            minWidth: "135px",
                            // display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <i className="fa fa-book mr-1" style={{ color: "white" }}></i>
                        <Tooltip position="bottom" label={t("TestName")}>
                            <span>{data?.PackageName}</span>
                        </Tooltip>
                    </div>
                </div>
            </div>
            {reportUrl.length > 0 ? (
                <div className="row px-2 mt-2">
                    <div className="col-12">
                        <Tables>
                            <thead style={{ width: "auto" }}>
                                <tr style={{
                                    wordWrap: "break-word",
                                    whiteSpace: "normal",
                                }}>
                                    <th>{t("S.No")}</th>
                                    <th>{t("UnapporvedDate")}</th>
                                    <th>{t("Reason")}</th>
                                    <th>{t("Report URLs")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportUrl.map((data, index) => (
                                    <tr key={index}>
                                        <td data-title={t("S.No")} style={{ width: "40px" }}>
                                            <div>{index + 1}</div>
                                        </td>
                                        <td data-title={t("UnapporvedDate")}>
                                            {dateConfig(data.UnapproveDate)}&nbsp;
                                        </td>
                                        <td data-title={t("Reason")}>{data?.Reason}</td>
                                        <td data-title={t("Report URLs")}>
                                            <button
                                                onClick={() => openReport(data?.ReportUrl)}
                                                title={data?.ReportUrl}
                                                style={{
                                                    color: "blue",
                                                    border: "none",
                                                    background: "transparent",
                                                    cursor: "pointer",
                                                    textDecoration: "underline"
                                                }}
                                            >
                                                View Report
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Tables>
                    </div>
                </div>
            ) : (
                <Loading />
            )}
        </Dialog>
    );
}

export default UnapprovedReportModal;
