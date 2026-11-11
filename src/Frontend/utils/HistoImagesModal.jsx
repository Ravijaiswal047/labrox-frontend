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

function HistoImagesModal({ show, handleShow, tableData, setTableData, data }) {
    const { t } = useTranslation();
    const isMobile = window.innerWidth <= 768;
    const theme = useLocalStorage("theme", "get");

   const handleMove = (ele, index) => {
    if(data?.Status===5 || data?.Status===6) {
        toast.error("Cannot move image of approved test")
        return;
    }
  axiosInstance
    .post("CommonController/MoveHistoImageToAttachment", {
      PageName : ele?.Page, 
      AwsKey : ele?.awsKey,
      Guid :ele?.Guid,
      ID_Hash :ele?.ID_Hash
    })
    .then((res) => {
      if (res?.data?.success) {
        toast.success(res?.data?.message || "Moved successfully");

        // const updatedData = [...tableData];
        // updatedData.splice(index, 1);
        // setTableData(updatedData);
      } else {
        toast.error(res?.data?.message || "Move failed");
      }
    })
    .catch((err) => {
      toast.error(
        err?.response?.data?.message || "Error occurred"
      );
    });
};
    return (
        <Dialog
            visible={show}
            header={t("Histo Images")}
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
            <div className="col-12">
                <Tables>
                    <thead>
                        <tr
                            style={{
                                wordWrap: "break-word",
                                whiteSpace: "normal",
                            }}
                        >
                            <th>{t("S.No")}</th>
                            <th>{t("Image")}</th>
                            <th>{t("File Name")}</th>
                            <th>{t("Uploaded By")}</th>
                            <th>{t("Action")}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tableData && tableData.length > 0 ? (
                            tableData.map((ele, index) => (
                                <tr key={index}>
                                    {/* S.No */}
                                    <td data-title={t("S.No")} style={{ width: "40px" }}>
                                        {index + 1}
                                    </td>

                                    {/* Preview */}
                                    <td data-title={t("Image")}>
                                        {["jpeg", "jpg", "png"].includes(
                                            ele?.awsKey?.split(".").pop().toLowerCase()
                                        ) ? (
                                            <img
                                                src={ele?.imgUrl}
                                                alt="preview"
                                                style={{
                                                    width: "50px",
                                                    height: "50px",
                                                    objectFit: "cover",
                                                    marginLeft:"10px"
                                                }}
                                            />
                                        ) : (
                                            "-"
                                        )}
                                    </td>

                                    {/* File Name */}
                                    <td
                                        data-title={t("File Name")}
                                        style={{
                                            wordWrap: "break-word",
                                            whiteSpace: "normal",
                                        }}
                                    >
                                        {ele?.FileName}
                                    </td>

                                    {/* Uploaded By */}
                                    <td data-title={t("Uploaded By")}>
                                        {ele?.CreatedByName}
                                    </td>

                                    <td data-title={t("Action")}>
  <button
    onClick={() => handleMove(ele, index)}
    style={{
      color: "green",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      textDecoration: "underline",
    }}
  >
    {t("Move")}
  </button>
</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    {t("No files uploaded")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Tables>
            </div>
        </Dialog>
    );
}

export default HistoImagesModal;
