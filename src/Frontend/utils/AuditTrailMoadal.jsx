import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const AuditTrailModal = ({ show, data, testname, handleClose }) => {
  const { t } = useTranslation();
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  return (
    <Dialog
      style={{
        width: isMobile ? "80vw" : "90vw",
      }}
      visible={show}
      className={theme}
      onHide={handleClose}
      header={t("Audit Trail Details")}
    >
      <div className="mb-2">
        {t("Test Name")}: {testname}
      </div>
      <Tables>
        <thead className="cf">
          <tr>
            <th>{t("EntryDateTime")}</th>
            <th>{t("Parameter")}</th>
            <th>{t("Value")}</th>
            <th>{t("Old Value")}</th>
            <th>{t("Min Value")}</th>
            <th>{t("Max Value")}</th>
            <th>{t("Reading Format")}</th>
            <th>{t("Display Reading")}</th>
            <th>{t("Machine Name")}</th>
            {/* <th>{t("Min Critical")}</th>
            <th>{t("Max Critical")}</th> */}
            <th>{t("Result Entered By")}</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((ele, index) => {
              const isDifferent = ele?.Value !== ele?.OldValue;
              const highlightStyle = isDifferent ? { backgroundColor: "#FFC0CB" } : {};

              return (
                <tr key={index}>
                  <td data-title={t("EntryDateTime")}>{ele?.EntryDateTime}</td>
                  <td data-title={t("Parameter")}>{ele?.LabObservationName}</td>
                  <td data-title={t("Value")}
                    style={highlightStyle}
                  >{ele?.Value}</td>
                  <td data-title={t("Old Value")}
                    style={highlightStyle}
                  >{ele?.OldValue}</td>
                  <td data-title={t("Min Value")}>{ele?.MinValue}</td>
                  <td data-title={t("Max Value")}>{ele?.MaxValue}</td>
                  <td data-title={t("Reading Format")}>{ele?.ReadingFormat}</td>
                  <td data-title={t("Display Reading")}>{ele?.DisplayReading}</td>
                  <td data-title={t("Machine Name")}>{ele?.MachineName}</td>
                  {/* <td data-title={t("Min Critical")}>{ele?.MinCritical}</td>
                <td data-title={t("Max Critical")}>{ele?.MaxCritical}</td> */}
                  <td data-title={t("Result Entered By")}>
                    {ele?.ResultEnteredName}
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan="12">{t("No data available")}</td>
            </tr>
          )}
        </tbody>
      </Tables>
      <div className="row mt-2">
        <div className="col-sm-2">
          <button
            type="button"
            className="btn btn-block btn-danger btn-sm"
            onClick={handleClose}
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default AuditTrailModal;
