import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@app/components/formComponent/Modal";
import Input from "@app/components/formComponent/Input";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import DatePicker from "@app/components/formComponent/DatePicker";
import TextAreaInput from "@app/components/formComponent/TextAreaInput";
import { SaveButton, CancelButton } from "@app/components/UI/CustomButton";
import { notify } from "@app/utils/utils";

const emptyForm = {
  ContractID: "",
  VisitDate: null,
  Engineer: "",
  WorkDone: "",
  NextVisit: null,
};

const LogVisitModal = ({
  visible,
  setVisible,
  onSave,
  contractOptions = [],
  editData = null,
  isSaving = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (visible) {
      if (editData) {
        setFormData({
          VisitID: editData.VisitID || null,
          ContractID: editData.ContractID || "",
          VisitDate: editData.VisitDate ? new Date(editData.VisitDate) : null,
          Engineer: editData.Engineer || "",
          WorkDone: editData.WorkDone || "",
          NextVisit: editData.NextVisit ? new Date(editData.NextVisit) : null,
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

  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({ ...prev, [name]: selectedOption?.value ?? "" }));
  };

  const handleDateChange = (value, name) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.ContractID) {
      notify(t("Please select a contract"), "error");
      return;
    }
    if (!formData.VisitDate) {
      notify(t("Visit Date is required"), "error");
      return;
    }
    if (!formData.Engineer?.trim()) {
      notify(t("Engineer Name is required"), "error");
      return;
    }
    if (
    formData.NextVisit &&
    formData.NextVisit < formData.VisitDate
  ) {
    notify(
      t("Next visit cannot be before visit date"),
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
      Header={editData ? t("Edit Engineer Visit") : t("Log Engineer Visit")}
      modalWidth="640px"
      buttons={
        <>
          <SaveButton
            text={editData ? t("Update visit") : t("Save visit")}
            onClick={handleSave}
            disabled={isSaving}
          />
          <CancelButton text={t("Cancel")} onClick={() => setVisible(false)} />
        </>
      }
    >
      <div className="row">
        <ReactSelect
          id="visitContract"
          name="ContractID"
          placeholderName="Contract / Equipment"
          value={formData.ContractID}
          dynamicOptions={contractOptions}
          onChange={handleSelectChange}
          respclass="col-md-6 col-12"
          tabIndex={1}
        />
        <Input
          type="text"
          name="Engineer"
          id="visitEngineer"
          lable="Engineer Name"
          // placeholder="Engineer Name"
          value={formData.Engineer}
          onChange={handleChange}
          maxLength={100}
          respclass="col-md-6 col-12"
          tabIndex={3}
        />
      </div>

      <div className="row">
        <DatePicker
          id="visitDate"
          name="VisitDate"
          className="custom-calendar"
          lable="Visit Date"
          value={formData.VisitDate}
          onChange={handleDateChange}
          respclass="col-md-6 col-12"
          tabIndex={2}
        />
        <DatePicker
          id="visitNext"
          name="NextVisit"
          className="custom-calendar"
          lable="Next Visit Due"
          value={formData.NextVisit}
          onChange={handleDateChange}
          minDate={formData.VisitDate || undefined}
          respclass="col-md-6 col-12"
          tabIndex={4}
        />
        
      </div>

      <div className="row">
        <TextAreaInput
          id="visitWorkDone"
          name="WorkDone"
          lable="Work Done"
          value={formData.WorkDone}
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

export default LogVisitModal;
