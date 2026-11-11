import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@app/components/formComponent/Modal";
import Input from "@app/components/formComponent/Input";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import TextAreaInput from "@app/components/formComponent/TextAreaInput";
import { SaveButton, CancelButton } from "@app/components/UI/CustomButton";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { notify } from "@app/utils/utils";
import { PRIORITY_OPTIONS } from "../maintenanceConstants";

const ReportBreakdownModal = ({
  visible,
  setVisible,
  onSave,
  equipmentOptions = [],
  isSaving = false,
}) => {
  const { t } = useTranslation();
  const userData = useLocalStorage("userData", "get") || "";
  const currentUser = userData?.UserName || userData?.userName || "Admin";

  const emptyForm = {
    EquipmentID: "",
    EquipmentCode: "",
    ReportedBy: currentUser,
    Priority: "Medium",
    Description: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (visible) setFormData(emptyForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

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

  const handleSave = () => {
    if (!formData.EquipmentID) {
      notify(t("Please select equipment"), "error");
      return;
    }
    if (!formData.Description.trim()) {
      notify(t("Issue Description is required"), "error");
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header={t("Report Breakdown")}
      modalWidth="620px"
      buttons={
        <>
          <SaveButton
            text={t("Create ticket")}
            onClick={handleSave}
            disabled={isSaving}
          />
          <CancelButton text={t("Cancel")} onClick={() => setVisible(false)} />
        </>
      }
    >
      <div className="row">
        <ReactSelect
          id="bdEquipment"
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
        <Input
          type="text"
          name="ReportedBy"
          id="bdReportedBy"
          lable="Reported By"
          value={formData.ReportedBy}
          onChange={handleChange}
          maxLength={100}
          respclass="col-md-6 col-12"
          tabIndex={2}
        />
        <ReactSelect
          id="bdPriority"
          name="Priority"
          placeholderName="Priority"
          value={formData.Priority}
          dynamicOptions={PRIORITY_OPTIONS}
          onChange={handleSelectChange}
          respclass="col-md-6 col-12"
          tabIndex={3}
        />
      </div>

      <div className="row">
        <TextAreaInput
          id="bdDescription"
          name="Description"
          lable="Issue Description"
          value={formData.Description}
          onChange={handleChange}
          rows={3}
          maxLength={500}
          respclass="col-12"
          showTooltipCount={true}
        />
      </div>

      <p className="em-detail-empty">
        {t("A Critical ticket also moves the equipment to Under Maintenance.")}
      </p>
    </Modal>
  );
};

export default ReportBreakdownModal;
