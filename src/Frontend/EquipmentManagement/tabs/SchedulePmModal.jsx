import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@app/components/formComponent/Modal";
import Input from "@app/components/formComponent/Input";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import DatePicker from "@app/components/formComponent/DatePicker";
import TextAreaInput from "@app/components/formComponent/TextAreaInput";
import { SaveButton, CancelButton } from "@app/components/UI/CustomButton";
import { notify } from "@app/utils/utils";
import { PM_FREQUENCY_OPTIONS } from "../maintenanceConstants";

const emptyForm = {
  PMID: null,
  EquipmentID: "",
  EquipmentCode: "",
  Frequency: "Monthly",
  LastDone: null,
  NextPM: null,
  Engineer: "",
  Checklist: "",
};

const SchedulePmModal = ({
  visible,
  setVisible,
  onSave,
  equipmentOptions = [],
  editData = null,
  isSaving = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (visible) {
      if (editData) {
        setFormData({
          PMID: editData.PMID || editData.pmid || null,
          EquipmentID: editData.EquipmentID || editData.equipmentID || "",
          EquipmentCode: editData.EquipmentCode || editData.equipmentCode || "",
          Frequency: editData.Frequency || editData.frequency || "Monthly",
          LastDone: editData.LastDone ? new Date(editData.LastDone) : null,
          NextPM: editData.NextPM ? new Date(editData.NextPM) : null,
          Engineer: editData.Engineer || editData.engineer || "",
          Checklist: editData.Checklist || editData.checklist || "",
        });
      } else {
        setFormData(emptyForm);
      }
    }
  }, [visible, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, option) => {
    if (name === "EquipmentID") {
      setFormData((prev) => ({
        ...prev,
        EquipmentID: option?.value ?? "",
        EquipmentCode: option?.code ?? "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: option?.value ?? "" }));
    }
  };

  const handleDateChange = (value, name) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.EquipmentID) {
      notify(t("Please select equipment"), "error");
      return;
    }
    if (!formData.NextPM) {
      notify(t("Next PM Date is required"), "error");
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header={editData ? t("Edit Preventive Maintenance") : t("Schedule Preventive Maintenance")}
      modalWidth="620px"
      buttons={
        <>
          <SaveButton
            text={editData ? t("Update schedule") : t("Save schedule")}
            onClick={handleSave}
            disabled={isSaving}
          />
          <CancelButton text={t("Cancel")} onClick={() => setVisible(false)} />
        </>
      }
    >
      <div className="row">
        <ReactSelect
          id="pmEquipment"
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
        <ReactSelect
          id="pmFrequency"
          name="Frequency"
          placeholderName="Frequency"
          value={formData.Frequency}
          dynamicOptions={PM_FREQUENCY_OPTIONS}
          onChange={handleSelectChange}
          respclass="col-md-4 col-12"
          tabIndex={2}
        />
        <DatePicker
          id="pmLastDate"
          name="LastDone"
          className="custom-calendar"
          lable="Last Done"
          value={formData.LastDone}
          onChange={handleDateChange}
          respclass="col-md-4 col-12"
          tabIndex={3}
        />
        <DatePicker
          id="pmNextDate"
          name="NextPM"
          className="custom-calendar"
          lable="Next PM Date"
          value={formData.NextPM}
          onChange={handleDateChange}
          respclass="col-md-4 col-12"
          tabIndex={4}
        />
      </div>

      <div className="row">
        <Input
          type="text"
          name="Engineer"
          id="pmEngineer"
          lable="Assigned Engineer"
          value={formData.Engineer}
          onChange={handleChange}
          maxLength={100}
          respclass="col-12"
          tabIndex={4}
        />
      </div>

      <div className="row">
        <TextAreaInput
          id="pmChecklist"
          name="Checklist"
          lable="Checklist"
          value={formData.Checklist}
          onChange={handleChange}
          rows={3}
          maxLength={500}
          respclass="col-12"
          showTooltipCount={true}
        />
      </div>
    </Modal>
  );
};

export default SchedulePmModal;
