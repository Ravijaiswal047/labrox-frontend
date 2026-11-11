import React from "react";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
import "./ViewLogModal.css";
const ViewLogModal = ({ viewLog, showViewLog, handleCloseViewLog }) => {
  const isMobile = window.innerWidth <= 768;
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  return (
    <>
      {viewLog.length > 0 && (
        <Dialog
          visible={showViewLog}
          size="md"
          header={t("Log Data")}
          className={`responsive-dialog ${theme}`}
          onHide={handleCloseViewLog}
        >
          <Tables
            className="table table-bordered table-hover table-striped tbRecord"
            cellPadding="{0}"
            cellSpacing="{0}"
          >
            <thead className="cf text-center" style={{ zIndex: 99 }}>
              <tr>
                <th className="text-center">{t("Status")}</th>
                <th className="text-center">{t("StatusDate")}</th>
                <th className="text-center">{t("DoneBy")}</th>
              </tr>
            </thead>
            <tbody>
              {viewLog.map((ele, index) => (
                <>
                  <tr key={index}>
                    <td data-title="Status" className="text-center">
                      {ele.Status}
                    </td>
                    <td data-title="StatusDate" className="text-center">
                      {ele.StatusDate}
                    </td>
                    <td data-title="DoneBy" className="text-center">
                      {ele.DoneBy}
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </Tables>
        </Dialog>
      )}
    </>
  );
};

export default ViewLogModal;
