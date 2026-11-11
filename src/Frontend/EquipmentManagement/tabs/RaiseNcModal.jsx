import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@app/components/formComponent/Modal";
import Input from "@app/components/formComponent/Input";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import DatePicker from "@app/components/formComponent/DatePicker";
import TextAreaInput from "@app/components/formComponent/TextAreaInput";
import { SaveButton, CancelButton } from "@app/components/UI/CustomButton";
import { notify } from "@app/utils/utils";
import { NC_SOURCE_OPTIONS } from "../complianceConstants";

const emptyForm = {
  NCID: null,
  Source: "Internal Audit",
  ClauseRef: "",
  Description: "",
  Capa: "",
  TargetDate: new Date(),
  Status: "Open",
};

const RaiseNcModal = ({
  visible,
  setVisible,
  onSave,
  editData = null,
  isSaving = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (visible) {
      if (editData) {
        setFormData({
          NCID: editData.NCID || editData.ncid || null,
          Source: editData.Source || editData.source || "Internal Audit",
          ClauseRef: editData.ClauseRef || editData.clauseRef || "",
          Description: editData.Description || editData.description || "",
          Capa: editData.Capa || editData.capa || "",
          TargetDate: editData.TargetDate ? new Date(editData.TargetDate) : new Date(),
          Status: editData.Status || editData.status || "Open",
        });
      } else {
        setFormData({
          ...emptyForm,
          TargetDate: new Date(),
        });
      }
    }
  }, [visible, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, option) => {
    setFormData((prev) => ({ ...prev, [name]: option?.value ?? "" }));
  };

  const handleDateChange = (value, name) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.Source) {
      notify(t("Please select NC Source"), "error");
      return;
    }
    if (!formData.Description?.trim()) {
      notify(t("Non-Conformity description is required"), "error");
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header={editData ? t("Edit Non-Conformity") : t("Raise Non-Conformity")}
      modalWidth="620px"
      buttons={
        <>
          <SaveButton
            text={editData ? t("Update NC") : t("Save NC")}
            onClick={handleSubmit}
            disabled={isSaving}
          />
          <CancelButton text={t("Cancel")} onClick={() => setVisible(false)} />
        </>
      }
    >
      <div className="row">
        <ReactSelect
          id="ncSource"
          name="Source"
          placeholderName="Source"
          value={formData.Source}
          dynamicOptions={NC_SOURCE_OPTIONS}
          onChange={handleSelectChange}
          respclass="col-md-6 col-12"
          tabIndex={1}
        />
        <Input
          type="text"
          name="ClauseRef"
          id="ncClause"
          lable="Clause / Reference"
          // placeholder="e.g. ISO 15189 6.5.3"
          value={formData.ClauseRef}
          onChange={handleChange}
          maxLength={100}
          respclass="col-md-6 col-12"
          tabIndex={2}
        />
      </div>

      <div className="row">
        <DatePicker
          id="ncTargetDate"
          name="TargetDate"
          className="custom-calendar"
          lable="Target Resolution Date"
          value={formData.TargetDate}
          onChange={handleDateChange}
          respclass="col-md-6 col-12"
          tabIndex={3}
        />
      </div>

      <div className="row">
        <TextAreaInput
          id="ncDescription"
          name="Description"
          lable="Non-Conformity Description"
          placeholder="Detailed observation / finding"
          value={formData.Description}
          onChange={handleChange}
          rows={3}
          maxLength={500}
          respclass="col-12"
          showTooltipCount={true}
        />
      </div>

      <div className="row">
        <TextAreaInput
          id="ncCapa"
          name="Capa"
          lable="Corrective & Preventive Action (CAPA)"
          placeholder="Action plan to eliminate root cause and prevent recurrence"
          value={formData.Capa}
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

export default RaiseNcModal;
