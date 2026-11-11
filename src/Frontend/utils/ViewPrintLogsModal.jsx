import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Tables from "../../components/UI/customTable";

function ViewPrintLogsModal({ show, onHide, printList=[] }) {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  console.log("printList",printList);

  return (
    <Dialog
      header={t("Print Logs")}
      onHide={onHide}
      visible={show}
      style={{ width: isMobile ? "40vw" : "40vw" }}
      className={theme}
    >
        <div>
            <Tables>
                        <thead className="cf">
                            <tr>
                                <th style={{ width: "70px" }}>{t("Sr. No")}</th>
                                <th>{t("Last Printed By")}</th>
                                <th>{t("Last Printed Date")}</th>
                                
                            </tr>
                        </thead>

                        <tbody>
                            {printList?.length > 0 ? (
                                printList.map((item, i) => {
                                    return (
                                        <tr
                                            key={i}
                                            style={{
                                                backgroundImage: "none",
                                                color: "white",
                                            }}
                                        >
                                            <td data-title={t("S. No")} style={{ width: "70px" }}>
                                                {i + 1}

                                            </td>

                                            <td data-title={t("Printed By")}>{item?.CreatedBy || ""}</td>
                                            <td data-title={t("Printed Date")}>{item?.CreatedDate || ""}</td>

                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "10px" }}>
                                        {t("No Records Found")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Tables>
        </div>
      
    </Dialog>
  );
}

export default ViewPrintLogsModal;