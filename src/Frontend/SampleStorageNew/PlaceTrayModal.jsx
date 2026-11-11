import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Modal from "@components/formComponent/Modal";
import Input from "@components/formComponent/Input";
import ReactSelect from "@components/formComponent/ReactSelect";
import { SaveButton, CancelButton } from "@components/UI/CustomButton";

const PlaceTrayModal = ({ visible, setVisible, trayTemplateOptions, defaultTemplateId, onSave }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ label: "", templateName: "" });

  useEffect(() => {
    if (visible && defaultTemplateId) {
      setForm({ label: "", templateName: defaultTemplateId });
    } else if (visible) {
      setForm({ label: "", templateName: "" });
    }
  }, [visible]);

  const handleSave = () => {
    if (!form.label.trim()) { toast.warning(t("Enter tray label")); return; }
    if (!form.templateName) { toast.warning(t("Select template")); return; }
    onSave(form);
    setForm({ label: "", templateName: "" });
  };

  const handleClose = () => {
    setForm({ label: "", templateName: "" });
    setVisible(false);
  };

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header={t("Place New Tray")}
      modalWidth="400px"
      buttons={
        <>
          <CancelButton text={t("Cancel")} onClick={handleClose} />
          <SaveButton text={t("Place Tray")} onClick={handleSave} />
        </>
      }
    >
      <div className="row g-2">
        <div className="col-12">
          <Input type="text" name="label" lable="Tray Label" value={form.label}
            onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} respclass="" required={true} />
        </div>
        <div className="col-12">
          <ReactSelect
            id="trayTemplate" name="templateName" placeholderName="Template"
            value={form.templateName}
            dynamicOptions={trayTemplateOptions}
            onChange={(name, opt) => setForm((p) => ({ ...p, templateName: opt?.value || "" }))}
            respclass=""
          />
        </div>
      </div>
    </Modal>
  );
};

export default PlaceTrayModal;
