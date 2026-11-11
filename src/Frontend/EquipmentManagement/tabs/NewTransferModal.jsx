import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@app/components/formComponent/Modal";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import DatePicker from "@app/components/formComponent/DatePicker";
import TextAreaInput from "@app/components/formComponent/TextAreaInput";
import { SaveButton, CancelButton } from "@app/components/UI/CustomButton";
import { notify } from "@app/utils/utils";

const toDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const buildEmptyForm = () => ({
  EquipmentID: "",
  EquipmentCode: "",
  EquipmentName: "",
  FromCentreID: null,
  FromCentreName: "",
  ToCentreID: "",
  ToCentreName: "",
  TransferDate: new Date(),
  Reason: "",
});

const NewTransferModal = ({
  visible,
  setVisible,
  onSave,
  equipmentList = [],
  centreList = [],
  isSaving = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(buildEmptyForm);

  useEffect(() => {
    if (visible) {
      setFormData(buildEmptyForm());
    }
  }, [visible]);

  const equipmentOptions = useMemo(() => {
    return (equipmentList || [])
      .filter((e) => e.Status !== "Condemned" && e.Status !== "Scrapped" && e.IsActive !== 0)
      .map((e) => ({
        value: e.EquipmentID,
        label: `${e.EquipmentCode} — ${e.EquipmentName || e.DisplayName || ""} (${e.CentreName || e.Centre || "Unassigned"})`,
        data: e,
      }));
  }, [equipmentList]);

  const selectedEquipment = useMemo(() => {
    return (
      (equipmentList || []).find(
        (e) => String(e.EquipmentID) === String(formData.EquipmentID)
      ) || null
    );
  }, [equipmentList, formData.EquipmentID]);

  const currentCentreName =
    selectedEquipment?.CentreName || selectedEquipment?.Centre || "";
  const currentCentreID = selectedEquipment?.CentreID;

  // Destination options: filter out the current centre of the equipment
  const destinationOptions = useMemo(() => {
    const currId = currentCentreID ? String(currentCentreID) : "";
    const currName = currentCentreName.trim().toLowerCase();

    return (centreList || [])
      .filter((c) => {
        const cId = String(c.value || c.CentreID || "");
        const cName = (c.label || c.Centre || "").trim().toLowerCase();
        if (currId && cId && currId === cId) return false;
        if (currName && cName && currName === cName) return false;
        return true;
      })
      .map((c) => ({
        value: c.value || c.CentreID,
        label: c.label || c.Centre,
        CentreID: c.value || c.CentreID,
        CentreName: c.label || c.Centre,
      }));
  }, [centreList, currentCentreID, currentCentreName]);

  const handleEquipmentChange = (name, option) => {
    const eq =
      option?.data ||
      (equipmentList || []).find(
        (e) => String(e.EquipmentID) === String(option?.value)
      );
    setFormData((prev) => ({
      ...prev,
      EquipmentID: option?.value ?? "",
      EquipmentCode: eq?.EquipmentCode ?? "",
      EquipmentName: eq?.EquipmentName ?? "",
      FromCentreID: eq?.CentreID ?? null,
      FromCentreName: eq?.CentreName ?? "",
      ToCentreID: "",
      ToCentreName: "",
    }));
  };

  const handleCentreChange = (name, option) => {
    setFormData((prev) => ({
      ...prev,
      ToCentreID: option?.value ?? "",
      ToCentreName: option?.label ?? "",
    }));
  };

  const handleDateChange = (value, name) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.EquipmentID) {
      notify(t("Please select equipment"), "error");
      return;
    }
    if (!formData.ToCentreID) {
      notify(t("Please select a destination centre"), "error");
      return;
    }
    if (
      currentCentreID &&
      String(formData.ToCentreID) === String(currentCentreID)
    ) {
      notify(
        t("Equipment is already at this centre. Choose a different destination."),
        "error"
      );
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header={t("New Transfer Request")}
      modalWidth="620px"
      buttons={
        <>
          <SaveButton
            text={t("Submit request")}
            onClick={handleSave}
            disabled={isSaving}
          />
          <CancelButton text={t("Cancel")} onClick={() => setVisible(false)} />
        </>
      }
    >
      <div className="row">
        <ReactSelect
          id="trfEquipment"
          name="EquipmentID"
          placeholderName="Equipment"
          value={formData.EquipmentID}
          dynamicOptions={equipmentOptions}
          onChange={handleEquipmentChange}
          searchable={true}
          respclass="col-12"
          tabIndex={1}
        />
      </div>

      {currentCentreName && (
        <p className="em-detail-empty mt-1 mb-2">
          {t("Currently at")}: <b>{currentCentreName}</b>
        </p>
      )}

      <div className="row">
        <ReactSelect
          id="trfToCentre"
          name="ToCentreID"
          placeholderName="To Centre"
          value={formData.ToCentreID}
          dynamicOptions={destinationOptions}
          onChange={handleCentreChange}
          isDisabled={!formData.EquipmentID}
          searchable={true}
          respclass="col-md-6 col-12"
          tabIndex={2}
        />
        <DatePicker
          id="trfDate"
          name="TransferDate"
          className="custom-calendar"
          lable="Transfer Date"
          value={toDate(formData.TransferDate)}
          onChange={handleDateChange}
          respclass="col-md-6 col-12"
          tabIndex={3}
        />
      </div>

      <div className="row">
        <TextAreaInput
          id="trfReason"
          name="Reason"
          lable="Reason"
          value={formData.Reason}
          onChange={handleChange}
          rows={2}
          maxLength={500}
          respclass="col-12"
        />
      </div>
    </Modal>
  );
};

export default NewTransferModal;
