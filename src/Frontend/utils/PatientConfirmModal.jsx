import React from "react";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { CustomButton } from "../../components/UI/CustomButton";

const PatientConfirmModal = ({
  show,
  handleClose,
  handleConfirm,
  patientData = {},
}) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");

  const footer = (
    <div className="d-flex justify-content-end gap-2">    
      <CustomButton text="Confirm" icon={"fa-check"} onClick={handleConfirm} className="mx-2"/>
      <CustomButton text="Cancel" icon="cancel" onClick={handleClose} className="mx-2"/>
    </div>
  );

  return (
    <Dialog
      header={t("Confirm Patient Details")}
      visible={show}
      onHide={handleClose}
      draggable={false}
      className={theme}
      footer={footer}
      style={{ width: "400px" }}
    >
      <Divider className={`custom-divider-header ${theme}`} />

          <div className="p-2">
              <div className="d-flex mb-1">
                  <div style={{ width: "140px", fontWeight: "600" }}>
                      {t("Patient Name")}:
                  </div>
                  <div>
                      {`${patientData?.Title || ""} ${patientData?.FirstName || ""}  ${patientData?.MiddleName || ""} ${patientData?.LastName || ""}`.trim() || "-"}
                  </div>
              </div>

              <div className="d-flex mb-1">
                  <div style={{ width: "140px", fontWeight: "600" }}>
                      {t("Mobile")}:
                  </div>
                  <div>{patientData?.Mobile || ""}</div>
              </div>

              <div className="d-flex mb-1">
                  <div style={{ width: "140px", fontWeight: "600" }}>
                      {t("Age")}:
                  </div>
                  <div> {patientData?.Age
                      ? patientData.Age
                      : (patientData?.AgeYear || patientData?.AgeMonth || patientData?.AgeDays)
                          ? `${patientData?.AgeYear || 0} Y ${patientData?.AgeMonth || 0} M ${patientData?.AgeDays || 0} D`
                          : ""
                  }</div>
              </div>
              <div className="d-flex mb-1">
                  <div style={{ width: "140px", fontWeight: "600" }}>
                      {t("Gender")}:
                  </div>
                  <div>{patientData?.Gender || ""}</div>
              </div>
          </div>
          
    </Dialog>
  );
};

export default PatientConfirmModal;