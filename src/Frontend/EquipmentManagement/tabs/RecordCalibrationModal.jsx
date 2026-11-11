import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@app/components/formComponent/Modal";
import Input from "@app/components/formComponent/Input";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import DatePicker from "@app/components/formComponent/DatePicker";
import { CustomButton, SaveButton, CancelButton } from "@app/components/UI/CustomButton";
import { notify } from "@app/utils/utils";
import UploadFile from "../../utils/UploadFileModal/UploadFile";
import { guidNumber } from "../../../utils/generateGuid";
import {
  CALIBRATION_RESULT_OPTIONS,
  FREQUENCY_OPTIONS,
  PERFORMED_BY_OPTIONS,
  TRACEABILITY_OPTIONS,
} from "../calibrationConstants";

const emptyForm = {
  EquipmentID: "",
  CalibrationDate: null,
  Frequency: "Monthly",
  PerformedBy: "Internal",
  CertificateNo: "",
  Result: "Pass",
  Traceability: "ISO/IEC 17025 lab · SI-traceable",
  CertificateFile: "",
};

const RecordCalibrationModal = ({
  visible,
  setVisible,
  onSave,
  equipmentOptions = [],
  editData = null,
  isSaving = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(emptyForm);
  const [uploadModal, setUploadModal] = useState({ modal: false, data: "" });
  const [certificateCount, setCertificateCount] = useState(0);

  useEffect(() => {
    if (visible) {
      if (editData) {
        setFormData({
          CalibrationID: editData.CalibrationID || null,
          EquipmentID: editData.EquipmentID || "",
          CalibrationDate: editData.CalibrationDate ? new Date(editData.CalibrationDate) : null,
          Frequency: editData.Frequency || "Monthly",
          PerformedBy: editData.PerformedBy || "Internal",
          CertificateNo: editData.CertificateNo || "",
          Result: editData.Result || "Pass",
          Traceability: editData.Traceability || "ISO/IEC 17025 lab · SI-traceable",
          CertificateFile: editData.CertificateFile || "",
        });
        setCertificateCount(
          Number(
            editData.CertificateFileCount ??
              (editData.CertificateFiles
                ? Array.isArray(editData.CertificateFiles)
                  ? editData.CertificateFiles.length
                  : 1
                : editData.CertificateFile
                  ? 1
                  : 0)
          )
        );
      } else {
        setFormData(emptyForm);
        setCertificateCount(0);
      }
    }
  }, [visible, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({ ...prev, [name]: selectedOption?.value ?? "" }));
  };

  const handleDateChange = (value, name) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openUploadModal = () => {
    const guid = formData.CertificateFile || guidNumber();
    setFormData((prev) => ({ ...prev, CertificateFile: guid }));
    setUploadModal({ modal: true, data: guid });
  };

  const handleUploadCount = (name, count) => {
    setCertificateCount(Number(count) || 0);
  };

  const handleSave = () => {
    if (!formData.EquipmentID) {
      notify(t("Please select equipment"), "error");
      return;
    }
    if (!formData.CalibrationDate) {
      notify(t("Calibration Date is required"), "error");
      return;
    }
    if (formData.Traceability === "Not established") {
      notify(t("Traceability is not established — this will be flagged"), "warn");
    }
    onSave(formData);
  };

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header={editData ? t("Edit Calibration") : t("Record Calibration")}
      modalWidth="680px"
      buttons={
        <>
          <SaveButton
            text={editData ? t("Update calibration") : t("Save calibration")}
            onClick={handleSave}
            disabled={isSaving}
          />
          <CancelButton text={t("Cancel")} onClick={() => setVisible(false)} />
        </>
      }
    >
      <div className="row">
        <ReactSelect
          id="calEquipment"
          name="EquipmentID"
          placeholderName="Equipment"
          value={formData.EquipmentID}
          dynamicOptions={equipmentOptions}
          onChange={handleSelectChange}
          respclass="col-12"
          tabIndex={1}
        />
      </div>

      <div className="row">
        <DatePicker
          id="calDate"
          name="CalibrationDate"
          className="custom-calendar"
          lable="Calibration Date"
          value={formData.CalibrationDate}
          onChange={handleDateChange}
          respclass="col-md-6 col-12"
          tabIndex={2}
        />
        <ReactSelect
          id="calFrequency"
          name="Frequency"
          placeholderName="Frequency"
          value={formData.Frequency}
          dynamicOptions={FREQUENCY_OPTIONS}
          onChange={handleSelectChange}
          respclass="col-md-6 col-12"
          tabIndex={3}
        />
      </div>

      <div className="row">
        <ReactSelect
          id="calPerformedBy"
          name="PerformedBy"
          placeholderName="Performed By"
          value={formData.PerformedBy}
          dynamicOptions={PERFORMED_BY_OPTIONS}
          onChange={handleSelectChange}
          respclass="col-md-6 col-12"
          tabIndex={4}
        />
        <Input
          type="text"
          name="CertificateNo"
          id="calCertificate"
          lable="Certificate No."
          value={formData.CertificateNo}
          onChange={handleChange}
          maxLength={50}
          respclass="col-md-6 col-12"
          tabIndex={5}
        />
      </div>

      <div className="row">
        <ReactSelect
          id="calResult"
          name="Result"
          placeholderName="Result"
          value={formData.Result}
          dynamicOptions={CALIBRATION_RESULT_OPTIONS}
          onChange={handleSelectChange}
          respclass="col-md-6 col-12"
          tabIndex={6}
        />

        <ReactSelect
          id="calTraceability"
          name="Traceability"
          placeholderName="Metrological Traceability (ISO 15189 — 6.5.3)"
          value={formData.Traceability}
          dynamicOptions={TRACEABILITY_OPTIONS}
          onChange={handleSelectChange}
          respclass="col-md-6 col-12"
          tabIndex={7}
        />
      </div>

      <div className="row">
        <div className="col-12 my-2">
          <label className="em-file-label d-block mb-1">{t("Certificate Upload")}</label>
          <div className="d-flex align-items-center gap-2">
            <CustomButton
              text={
                certificateCount > 0
                  ? `${t("Certificate")} (${certificateCount} ${t("file(s)")})`
                  : t("Upload Certificate")
              }
              icon="upload"
              variant={certificateCount > 0 ? "success" : "secondary"}
              onClick={openUploadModal}
            />
            {/* {certificateCount > 0 && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                onClick={openUploadModal}
                title={t("View / Manage uploaded certificate")}
              >
                <i className="fa fa-eye"></i> {t("View / Manage")}
              </button>
            )} */}
          </div>
        </div>
      </div>

      {uploadModal.modal && (
        <UploadFile
          show={uploadModal.modal}
          handleClose={() => setUploadModal({ modal: false, data: "" })}
          documentId={uploadModal.data}
          pageName="Calibration"
          handleUploadCount={handleUploadCount}
        />
      )}
    </Modal>
  );
};

export default RecordCalibrationModal;
