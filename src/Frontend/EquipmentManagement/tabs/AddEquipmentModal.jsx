import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@app/components/formComponent/Modal";
import Input from "@app/components/formComponent/Input";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import DatePicker from "@app/components/formComponent/DatePicker";
import { SaveButton, CancelButton } from "@app/components/UI/CustomButton";
import { notify } from "@app/utils/utils";
import { axiosInstance } from "@app/utils/axiosInstance";
import { CRITICALITY_OPTIONS, STATUS_FORM_OPTIONS } from "../equipmentConstants";

const emptyForm = {
  EquipmentCode: "",
  EquipmentName: "",
  CategoryID: "",
  Make: "",
  ModelNo: "",
  SerialNo: "",
  SupplierID: "",
  SupplierVendor: "",
  PurchaseDate: null,
  InstallationDate: null,
  WarrantyExpiry: null,
  Cost: "",
  DepartmentID: "",
  CentreID: "",
  Criticality: "Medium",
  Status: "Active",
};

const AddEquipmentModal = ({
  visible,
  setVisible,
  onSave,
  initialData,
  nextCode,
  isEdit = false,
  centreList = [],
  departmentList = [],
  categoryList = [],
  vendorList = [],
  isSaving = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(emptyForm);
  const [internalVendors, setInternalVendors] = useState([]);

  // Fetch vendors on open if parent list is empty
  useEffect(() => {
    if (!visible) return;
    if (!vendorList?.length) {
      axiosInstance
        .get("VendorMaster/GetVendorList")
        .then((res) => {
          const data = res?.data?.message || [];
          const opts = (Array.isArray(data) ? data : [])
            .map((ele) => ({
              label: ele?.SupplierName || ele?.label || "",
              value: String(ele?.SupplierID || ele?.value || ""),
              code: ele?.SupplierCode || "",
              SupplierID: ele?.SupplierID || ele?.value,
              SupplierName: ele?.SupplierName || ele?.label,
            }))
            .filter((o) => o.label);
          setInternalVendors(opts);
        })
        .catch(() => {});
    }
  }, [visible, vendorList?.length]);

  const activeVendorOptions = useMemo(() => {
    return vendorList?.length ? vendorList : internalVendors;
  }, [vendorList, internalVendors]);

  // Reset / hydrate the form every time the modal is opened
  useEffect(() => {
    if (!visible) return;
    setFormData({
      ...emptyForm,
      ...(initialData || {}),
      EquipmentCode: initialData?.EquipmentCode || nextCode || "",
      SupplierID: initialData?.SupplierID || "",
      SupplierVendor: initialData?.SupplierVendor || "",
    });
  }, [visible, initialData, nextCode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ReactSelect calls onChange(name, selectedOption)
  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({ ...prev, [name]: selectedOption?.value ?? "" }));
  };

  // Dedicated handler for Supplier / Vendor select
  const handleVendorSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      SupplierID: selectedOption?.SupplierID || (selectedOption?.value && !isNaN(Number(selectedOption.value)) ? Number(selectedOption.value) : ""),
      SupplierVendor: selectedOption?.SupplierName || selectedOption?.label || "",
    }));
  };

  const handleVendorCreateOption = (inputValue) => {
    const trimmed = inputValue?.trim() || "";
    setFormData((prev) => ({
      ...prev,
      SupplierID: "",
      SupplierVendor: trimmed,
    }));
  };

  // Resolve selected value for the Vendor ReactSelect
  const selectedVendorValue = useMemo(() => {
    if (formData?.SupplierID) {
      return String(formData.SupplierID);
    }
    if (formData?.SupplierVendor) {
      const match = activeVendorOptions.find(
        (o) =>
          o.label?.toLowerCase() === formData.SupplierVendor.toLowerCase() ||
          o.SupplierName?.toLowerCase() === formData.SupplierVendor.toLowerCase()
      );
      if (match) return String(match.value);
      return formData.SupplierVendor;
    }
    return "";
  }, [formData?.SupplierID, formData?.SupplierVendor, activeVendorOptions]);

  // Combined options ensuring custom/legacy vendor name displays properly
  const displayVendorOptions = useMemo(() => {
    const list = [...activeVendorOptions];
    if (
      formData?.SupplierVendor &&
      !list.some(
        (o) =>
          String(o.value) === String(formData.SupplierID) ||
          o.label?.toLowerCase() === formData.SupplierVendor.toLowerCase()
      )
    ) {
      list.unshift({
        value: formData.SupplierVendor,
        label: formData.SupplierVendor,
        SupplierID: null,
        SupplierName: formData.SupplierVendor,
      });
    }
    return list;
  }, [activeVendorOptions, formData?.SupplierID, formData?.SupplierVendor]);

  // DatePicker calls onChange(value, name)
  const handleDateChange = (value, name) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData?.EquipmentName?.trim()) {
      notify(t("Equipment Name is required"), "error");
      return;
    }
    onSave(formData);
  };

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header={t(isEdit ? "Edit Equipment" : "Add Equipment")}
      modalWidth="900px"
      buttons={
        <>
          <SaveButton
            text={t("Save equipment")}
            onClick={handleSave}
            disabled={isSaving}
          />
          <CancelButton text={t("Cancel")} onClick={() => setVisible(false)} />
        </>
      }
    >
      <div className="row">
        <Input
          type="text"
          name="EquipmentCode"
          id="equipmentCode"
          lable="Equipment Code"
          placeholder="Equipment Code"
          value={formData?.EquipmentCode}
          onChange={handleChange}
          disabled={true}
          respclass="col-md-4 col-12"
          tabIndex={1}
        />
        <Input
          type="text"
          name="EquipmentName"
          id="equipmentName"
          lable="Equipment Name"
          // placeholder="Equipment Name"
          value={formData?.EquipmentName}
          onChange={handleChange}
          required={true}
          maxLength={100}
          respclass="col-md-4 col-12"
          tabIndex={2}
        />
        <ReactSelect
          id="categoryId"
          name="CategoryID"
          placeholderName="Category"
          value={formData?.CategoryID}
          dynamicOptions={categoryList}
          onChange={handleSelectChange}
          respclass="col-md-4 col-12"
          tabIndex={3}
        />
      </div>

      <div className="row">
        <Input
          type="text"
          name="Make"
          id="make"
          lable="Make"
          // placeholder="Make"
          value={formData?.Make}
          onChange={handleChange}
          maxLength={100}
          respclass="col-md-4 col-12"
          tabIndex={4}
        />
        <Input
          type="text"
          name="ModelNo"
          id="modelNo"
          lable="Model"
          // placeholder="Model"
          value={formData?.ModelNo}
          onChange={handleChange}
          maxLength={100}
          respclass="col-md-4 col-12"
          tabIndex={5}
        />
        <Input
          type="text"
          name="SerialNo"
          id="serialNo"
          lable="Serial No."
          // placeholder="Serial No."
          value={formData?.SerialNo}
          onChange={handleChange}
          maxLength={100}
          respclass="col-md-4 col-12"
          tabIndex={6}
        />
      </div>

      <div className="row">
        <ReactSelect
          id="supplierVendor"
          name="SupplierID"
          placeholderName="Supplier / Vendor"
          searchable={true}
          creatable={true}
          onCreateOption={handleVendorCreateOption}
          value={selectedVendorValue}
          dynamicOptions={displayVendorOptions}
          onChange={handleVendorSelectChange}
          respclass="col-md-4 col-12"
          tabIndex={7}
        />
        <DatePicker
          id="purchaseDate"
          name="PurchaseDate"
          className="custom-calendar"
          lable="Purchase Date"
          value={formData?.PurchaseDate}
          onChange={handleDateChange}
          respclass="col-md-4 col-12"
          tabIndex={8}
        />
        <DatePicker
          id="installationDate"
          name="InstallationDate"
          className="custom-calendar"
          lable="Installation Date"
          value={formData?.InstallationDate}
          onChange={handleDateChange}
          respclass="col-md-4 col-12"
          tabIndex={9}
        />
      </div>

      <div className="row">
        <DatePicker
          id="warrantyExpiry"
          name="WarrantyExpiry"
          className="custom-calendar"
          lable="Warranty Expiry"
          value={formData?.WarrantyExpiry}
          onChange={handleDateChange}
          respclass="col-md-4 col-12"
          tabIndex={10}
        />
        <Input
          type="number"
          name="Cost"
          id="cost"
          lable="Cost (₹)"
          placeholder="Cost (₹)"
          value={formData?.Cost}
          onChange={handleChange}
          display="right"
          respclass="col-md-4 col-12"
          tabIndex={11}
        />
        <ReactSelect
          id="departmentId"
          name="DepartmentID"
          placeholderName="Department"
          value={formData?.DepartmentID}
          dynamicOptions={departmentList}
          onChange={handleSelectChange}
          respclass="col-md-4 col-12"
          tabIndex={12}
        />
      </div>

      <div className="row">
        <ReactSelect
          id="modalCentreId"
          name="CentreID"
          placeholderName="Centre"
          value={formData?.CentreID}
          dynamicOptions={centreList}
          onChange={handleSelectChange}
          respclass="col-md-4 col-12"
          tabIndex={13}
        />
        <ReactSelect
          id="criticality"
          name="Criticality"
          placeholderName="Criticality"
          value={formData?.Criticality}
          dynamicOptions={CRITICALITY_OPTIONS}
          onChange={handleSelectChange}
          respclass="col-md-4 col-12"
          tabIndex={14}
        />
        <ReactSelect
          id="status"
          name="Status"
          placeholderName="Status"
          value={formData?.Status}
          dynamicOptions={STATUS_FORM_OPTIONS}
          onChange={handleSelectChange}
          respclass="col-md-4 col-12"
          tabIndex={15}
        />
      </div>
    </Modal>
  );
};

export default AddEquipmentModal;
