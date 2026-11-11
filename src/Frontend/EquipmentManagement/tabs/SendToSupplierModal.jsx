import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import Modal from "@app/components/formComponent/Modal";
import Input from "@app/components/formComponent/Input";
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
  VendorID: null,
  Vendor: "",
  Challan: "",
  Sent: new Date(),
  Expected: null,
  Cost: "",
  Reason: "",
  Decontaminated: false,
});

const SendToSupplierModal = ({
  visible,
  setVisible,
  onSave,
  equipmentList = [],
  vendorList = [],
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
      .filter((e) => e.Status !== "Condemned" && e.Status !== "Sent to Supplier")
      .map((e) => ({
        value: e.EquipmentID,
        label: `${e.EquipmentCode} — ${e.EquipmentName || e.DisplayName || ""} (${e.CentreName || e.Centre || ""})`,
        data: e,
      }));
  }, [equipmentList]);

  const vendorOptions = useMemo(() => {
    const list = (vendorList || []).map((v) => ({
      value: String(v.SupplierID || v.value || v.label),
      label: v.label || v.SupplierName,
      SupplierID: v.SupplierID || (Number(v.value) ? Number(v.value) : null),
      SupplierName: v.SupplierName || v.label,
    }));

    if (
      formData.Vendor &&
      !list.some(
        (o) =>
          o.label?.toLowerCase() === formData.Vendor.toLowerCase() ||
          (formData.VendorID && String(o.SupplierID) === String(formData.VendorID))
      )
    ) {
      list.unshift({
        value: formData.Vendor,
        label: formData.Vendor,
        SupplierID: formData.VendorID || null,
        SupplierName: formData.Vendor,
      });
    }

    return list;
  }, [vendorList, formData.Vendor, formData.VendorID]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEquipmentChange = (name, option) => {
    const eq = option?.data || (equipmentList || []).find((e) => e.EquipmentID === option?.value);
    setFormData((prev) => ({
      ...prev,
      EquipmentID: option?.value ?? "",
      EquipmentCode: eq?.EquipmentCode ?? "",
      Vendor: eq?.SupplierVendor || prev.Vendor || "",
      VendorID: eq?.SupplierID || prev.VendorID || null,
    }));
  };

  const handleVendorChange = (name, option) => {
    setFormData((prev) => ({
      ...prev,
      Vendor: option?.SupplierName || option?.label || "",
      VendorID: option?.SupplierID || null,
    }));
  };

  const handleVendorCreateOption = (inputValue) => {
    const trimmed = inputValue?.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      Vendor: trimmed,
      VendorID: null,
    }));
  };

  const handleDateChange = (value, name) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.EquipmentID) {
      notify(t("Please select equipment"), "error");
      return;
    }
    if (!formData.Vendor.trim()) {
      notify(t("Vendor / Service Centre is required"), "error");
      return;
    }
    // ISO 15189 6.4.5 / biosafety — nothing leaves the lab undecontaminated.
    if (!formData.Decontaminated) {
      notify(
        t("Equipment cannot be dispatched without decontamination (ISO 15189 — 6.4.5)"),
        "error",
      );
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header={t("Send Equipment to Supplier")}
      modalWidth="680px"
      buttons={
        <>
          <SaveButton
            text={t("Generate gate pass & send")}
            onClick={handleSave}
            disabled={isSaving}
          />
          <CancelButton text={t("Cancel")} onClick={() => setVisible(false)} />
        </>
      }
    >
      <div className="row">
        <ReactSelect
          id="retEquipment"
          name="EquipmentID"
          placeholderName="Equipment"
          value={formData.EquipmentID}
          dynamicOptions={equipmentOptions}
          onChange={handleEquipmentChange}
          searchable={true}
          respclass="col-md-6 col-12"
          tabIndex={1}
        />
        <ReactSelect
          id="retVendor"
          name="Vendor"
          placeholderName="Vendor / Service Centre"
          value={formData.VendorID ? String(formData.VendorID) : formData.Vendor}
          dynamicOptions={vendorOptions}
          onChange={handleVendorChange}
          searchable={true}
          creatable={true}
          onCreateOption={handleVendorCreateOption}
          respclass="col-md-6 col-12"
          tabIndex={2}
        />
      </div>

      <div className="row">
        
        <Input
          type="text"
          name="Challan"
          id="retChallan"
          lable="Courier / Challan No."
          // placeholder="CH-XXXX · BlueDart"
          value={formData.Challan}
          onChange={handleChange}
          maxLength={50}
          respclass="col-md-6 col-12"
          tabIndex={3}
        />
        <Input
          type="number"
          name="Cost"
          id="retCost"
          lable="Estimated Cost (₹)"
          value={formData.Cost}
          onChange={handleChange}
          display="right"
          respclass="col-md-6 col-12"
          tabIndex={6}
        />
      </div>

      <div className="row">
        <DatePicker
          id="retSent"
          name="Sent"
          className="custom-calendar"
          lable="Sent Date"
          value={toDate(formData.Sent)}
          onChange={handleDateChange}
          respclass="col-md-6 col-12"
          tabIndex={4}
        />
        <DatePicker
          id="retExpected"
          name="Expected"
          className="custom-calendar"
          lable="Expected Return"
          value={toDate(formData.Expected)}
          onChange={handleDateChange}
          minDate={toDate(formData.Sent) || undefined}
          respclass="col-md-6 col-12"
          tabIndex={5}
        />
      </div>

     

      <div className="row">
        <TextAreaInput
          id="retReason"
          name="Reason"
          lable="Reason / Fault Description"
          value={formData.Reason}
          onChange={handleChange}
          rows={2}
          maxLength={500}
          respclass="col-12"
        />
      </div>

      <div className="row">
        <div className="col-12">
          <label className="em-check-row">
            <input
              type="checkbox"
              name="Decontaminated"
              checked={formData.Decontaminated}
              onChange={handleChange}
              tabIndex={7}
            />
            <span>
              {t(
                "Decontamination completed & certificate attached (ISO 15189 — 6.4.5)",
              )}
            </span>
          </label>
        </div>
      </div>
    </Modal>
  );
};

export default SendToSupplierModal;
