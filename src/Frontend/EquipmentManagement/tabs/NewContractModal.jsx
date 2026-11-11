import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@app/components/formComponent/Modal";
import Input from "@app/components/formComponent/Input";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import DatePicker from "@app/components/formComponent/DatePicker";
import { SaveButton, CancelButton } from "@app/components/UI/CustomButton";
import { notify } from "@app/utils/utils";
import { CONTRACT_TYPE_FORM_OPTIONS } from "../amcConstants";

const toDateOrUndefined = (val) => {
  if (!val) return undefined;
  if (val instanceof Date) return isNaN(val.getTime()) ? undefined : val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
};

const emptyForm = {
  EquipmentID: null,
  Type: "AMC",
  Vendor: "",
  StartDate: null,
  EndDate: null,
  Cost: "",
  VisitsTotal: 4,
};

const NewContractModal = ({
  visible,
  setVisible,
  onSave,
  equipmentOptions = [],
  equipmentList = [],
  vendorList = [],
  editData = null,
  isSaving = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (visible) {
      if (editData) {
        setFormData({
          ContractID: editData.ContractID || null,
          EquipmentID: editData.EquipmentID || null,
          Type: editData.ContractType || editData.Type || "AMC",
          Vendor: editData.Vendor || "",
          StartDate: editData.StartDate ? new Date(editData.StartDate) : null,
          EndDate: editData.EndDate ? new Date(editData.EndDate) : null,
          Cost: editData.Cost != null ? editData.Cost : "",
          VisitsTotal: editData.VisitsTotal != null ? editData.VisitsTotal : 4,
        });
      } else {
        setFormData(emptyForm);
      }
    }
  }, [visible, editData]);

  const vendorOptions = useMemo(() => {
    const list = (vendorList || []).map((v) => {
      const name = v.SupplierName || v.label || "";
      return {
        value: name,
        label: v.SupplierCode ? `${name} (${v.SupplierCode})` : name,
        SupplierID: v.SupplierID,
        SupplierName: name,
      };
    });

    if (
      formData.Vendor &&
      !list.some(
        (o) =>
          o.value?.toLowerCase() === formData.Vendor.toLowerCase() ||
          o.label?.toLowerCase() === formData.Vendor.toLowerCase()
      )
    ) {
      list.unshift({
        value: formData.Vendor,
        label: formData.Vendor,
        SupplierName: formData.Vendor,
      });
    }

    return list;
  }, [vendorList, formData.Vendor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEquipmentChange = (name, option) => {
    const eq =
      option?.data ||
      (equipmentList || []).find((e) => e.EquipmentID === option?.value);
    setFormData((prev) => ({
      ...prev,
      EquipmentID: option?.value ?? null,
      Vendor: prev.Vendor || eq?.SupplierVendor || eq?.Vendor || "",
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({ ...prev, [name]: selectedOption?.value ?? "" }));
  };

  const handleVendorChange = (name, option) => {
    setFormData((prev) => ({
      ...prev,
      Vendor: option?.SupplierName || option?.value || option?.label || "",
    }));
  };

  const handleVendorCreateOption = (inputValue) => {
    const trimmed = inputValue?.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      Vendor: trimmed,
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
    if (!formData.Vendor?.trim()) {
      notify(t("Vendor is required"), "error");
      return;
    }
    if (!formData.StartDate || !formData.EndDate) {
      notify(t("Start and End date are required"), "error");
      return;
    }
    if (new Date(formData.EndDate) < new Date(formData.StartDate)) {
      notify(t("End date cannot be before the start date"), "error");
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header={editData ? t("Edit Service Contract") : t("New Service Contract")}
      modalWidth="600px"
      buttons={
        <>
          <SaveButton
            text={editData ? t("Update contract") : t("Save contract")}
            onClick={handleSave}
            disabled={isSaving}
          />
          <CancelButton text={t("Cancel")} onClick={() => setVisible(false)} />
        </>
      }
    >
      <div className="row">
        <ReactSelect
          id="contractEquipment"
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

      <div className="row">
        <ReactSelect
          id="contractType"
          name="Type"
          placeholderName="Contract Type"
          value={formData.Type}
          dynamicOptions={CONTRACT_TYPE_FORM_OPTIONS}
          onChange={handleSelectChange}
          respclass="col-md-6 col-12"
          tabIndex={2}
        />
        <ReactSelect
          id="contractVendor"
          name="Vendor"
          placeholderName="Vendor"
          value={formData.Vendor}
          dynamicOptions={vendorOptions}
          onChange={handleVendorChange}
          searchable={true}
          creatable={true}
          onCreateOption={handleVendorCreateOption}
          respclass="col-md-6 col-12"
          tabIndex={3}
        />
      </div>

      <div className="row">
        <DatePicker
          id="contractStart"
          name="StartDate"
          className="custom-calendar"
          lable="Start Date"
          value={formData.StartDate}
          onChange={handleDateChange}
          respclass="col-md-6 col-12"
          tabIndex={4}
        />
        <DatePicker
          id="contractEnd"
          name="EndDate"
          className="custom-calendar"
          lable="End Date"
          value={formData.EndDate}
          onChange={handleDateChange}
          minDate={toDateOrUndefined(formData.StartDate)}
          respclass="col-md-6 col-12"
          tabIndex={5}
        />
      </div>

      <div className="row">
        <Input
          type="number"
          name="Cost"
          id="contractCost"
          lable="Contract Cost (₹)"
          placeholder="Contract Cost (₹)"
          value={formData.Cost}
          onChange={handleChange}
          display="right"
          respclass="col-md-6 col-12"
          tabIndex={6}
        />
        <Input
          type="number"
          name="VisitsTotal"
          id="contractVisits"
          lable="Visits Committed / Year"
          placeholder="Visits Committed / Year"
          value={formData.VisitsTotal}
          onChange={handleChange}
          display="right"
          respclass="col-md-6 col-12"
          tabIndex={7}
        />
      </div>
    </Modal>
  );
};

export default NewContractModal;
