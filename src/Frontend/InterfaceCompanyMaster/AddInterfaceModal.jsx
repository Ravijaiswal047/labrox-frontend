import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Modal from "@components/formComponent/Modal";
import Input from "@components/formComponent/Input";
import { SaveButton, CancelButton } from "@components/UI/CustomButton";
import { Form } from "react-bootstrap";
import { axiosInstance } from "@app/utils/axiosInstance";

const initialForm = {
  companyName: "",
  isActive: true,
  TestCode: "LIS",
  RateTypeCode: "LIS",
  CentreCode: "LIS",
};

const RadioGroup = ({ label, name, value, onChange }) => (
  <div className="col-md-4 col-12 mb-2">
    <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
      {label}
    </label>
    <div className="d-flex" style={{ gap: "12px" }}>
      {["LIS", "OWN"].map((opt) => (
        <div key={opt} className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name={name}
            id={`${name}_${opt}`}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(name, opt)}
          />
          <label className="form-check-label" htmlFor={`${name}_${opt}`}>
            {opt}
          </label>
        </div>
      ))}
    </div>
  </div>
);

const AddInterfaceModal = ({ visible, onClose, editData, onSaved }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = editData?.id != null;

  useEffect(() => {
    if (visible) {
      if (isEditMode) {
        setForm({
          companyName: editData.companyName ?? "",
          isActive: editData.isActive === 1,
          TestCode: editData.isLISTestCode === 1 ? "LIS" : "OWN",
          RateTypeCode: editData.isLISRateTypeCode === 1 ? "LIS" : "OWN",
          CentreCode: editData.isLISCentreCode === 1 ? "LIS" : "OWN",
        });
      } else {
        setForm(initialForm);
      }
    }
  }, [visible, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadio = (name, val) => {
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleToggle = () => {
    setForm((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleSave = () => {
    if (!form.companyName.trim()) {
      toast.warning(t("Name is required"));
      return;
    }

    const payload = {
      companyName: form.companyName.trim(),
      isActive: form.isActive ? 1 : 0,
      isLISTestCode: form.TestCode === "LIS" ? 1 : 0,
      isLISCentreCode: form.CentreCode === "LIS" ? 1 : 0,
      isLISRateTypeCode: form.RateTypeCode === "LIS" ? 1 : 0,
    };

    const endpoint = isEditMode
      ? "ItemMasterInterface/UpdateInterfacemaster"
      : "ItemMasterInterface/SaveInterfaceMaster";

    const finalPayload = isEditMode ? { ...payload, id: editData.id } : payload;

    setIsSaving(true);
    axiosInstance
      .post(endpoint, finalPayload)
      .then((res) => {
        toast.success(res?.data?.message);
        onSaved?.();
        setForm(initialForm);
        onClose();
      })
      .catch((err) => toast.error(err?.response?.data?.message))
      .finally(() => setIsSaving(false));
  };

  return (
    <Modal
      visible={visible}
      setVisible={onClose}
      Header={t(isEditMode ? "Edit Interface" : "Add Interface")}
      modalWidth="520px"
      buttons={
        <>
          <SaveButton text="Save" onClick={handleSave} disabled={isSaving} />
          <CancelButton text="Cancel" onClick={onClose} className="ms-2" />
        </>
      }
    >
      <div className="row p-2">
        <Input
          type="text"
          name="companyName"
          id="intfName"
          lable="Name"
          value={form.companyName}
          onChange={handleChange}
          respclass="col-8 mb-2"
          required
        />

        <div className="col-4 mt-1">
          <div className="form-check form-switch ms-1">
            <Form.Check
              type="switch"
              id="isActiveSwitch"
              label={t("Active")}
              checked={form.isActive}
              onChange={handleToggle}
            />
          </div>
        </div>

        <RadioGroup
          label={t("Test Code")}
          name="TestCode"
          value={form.TestCode}
          onChange={handleRadio}
        />
        <RadioGroup
          label={t("Rate Type Code")}
          name="RateTypeCode"
          value={form.RateTypeCode}
          onChange={handleRadio}
        />
        <RadioGroup
          label={t("Centre Code")}
          name="CentreCode"
          value={form.CentreCode}
          onChange={handleRadio}
        />
      </div>
    </Modal>
  );
};

export default AddInterfaceModal;
